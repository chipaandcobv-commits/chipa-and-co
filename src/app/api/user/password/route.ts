import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { requireAuth } from "../../../../lib/auth";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// PUT - Cambiar contraseña
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { currentPassword, newPassword } = await request.json();

    // Validaciones
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "La contraseña actual y la nueva contraseña son requeridas" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Obtener usuario con contraseña para verificar
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!userWithPassword) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      userWithPassword.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: "La contraseña actual es incorrecta" },
        { status: 400 }
      );
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const isNewPasswordSame = await bcrypt.compare(
      newPassword,
      userWithPassword.password
    );

    if (isNewPasswordSame) {
      return NextResponse.json(
        { success: false, error: "La nueva contraseña debe ser diferente a la actual" },
        { status: 400 }
      );
    }

    // Hashear nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
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
