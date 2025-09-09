import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { PrismaClient } from "../../../../generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Contraseña actual y nueva contraseña son requeridas" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Obtener usuario con contraseña
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar contraseña actual
    if (!user.password) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: "La contraseña actual es incorrecta" },
        { status: 400 }
      );
    }

    // Hashear nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: currentUser.userId },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
