import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserUnified } from "../../../../lib/auth-helper";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserUnified();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Nombre y email son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe para otro usuario
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: currentUser.userId },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "El email ya está en uso" },
        { status: 400 }
      );
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.userId },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        puntos: true,
        puntosHistoricos: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
