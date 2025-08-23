import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { requireAuth } from "../../../../lib/auth";

const prisma = new PrismaClient();

// PUT - Actualizar datos del perfil
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { name, email } = await request.json();

    // Validaciones
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "El nombre debe tener al menos 2 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe (excluyendo el usuario actual)
    const existingUserWithEmail = await prisma.user.findFirst({
      where: {
        email: email.trim(),
        id: { not: user.id },
      },
    });

    if (existingUserWithEmail) {
      return NextResponse.json(
        { success: false, error: "El correo electrónico ya está en uso" },
        { status: 400 }
      );
    }

    // Actualizar usuario (solo nombre y email, DNI no se puede cambiar)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        email: email.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        puntos: true,
        puntosHistoricos: true,
        role: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Datos actualizados correctamente",
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      {
        status:
          error.message === "No autorizado"
            ? 401
            : 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
