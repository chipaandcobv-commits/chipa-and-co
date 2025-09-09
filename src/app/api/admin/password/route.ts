import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        error: "Contraseña actual y nueva contraseña son requeridas",
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        error: "La nueva contraseña debe tener al menos 6 caracteres",
      }, { status: 400 });
    }

    // Verificar contraseña actual
    if (!admin.password) {
      return NextResponse.json({
        success: false,
        error: "Usuario no encontrado",
      }, { status: 404 });
    }
    
    const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: "La contraseña actual es incorrecta",
      }, { status: 400 });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
