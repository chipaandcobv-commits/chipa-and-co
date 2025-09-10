import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { hashPassword } from "../../../../lib/auth-server";
import { securityLogger, SecurityEventType } from "../../../../lib/securityLogger";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Token y nueva contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Buscar usuario con el token válido y no expirado
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(), // Token no expirado
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        isGoogleUser: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Token inválido o expirado" },
        { status: 400 }
      );
    }

    // Hashear nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar contraseña y limpiar token de reset
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // Log de actividad
    securityLogger.log(
      SecurityEventType.PASSWORD_RESET_COMPLETED,
      request,
      user.id,
      user.email,
      "Password reset completed",
      { isGoogleUser: user.isGoogleUser }
    );

    return NextResponse.json({
      success: true,
      message: "Contraseña restablecida exitosamente",
    });

  } catch (error) {
    console.error("Error in reset password:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Endpoint para validar si un token es válido (sin cambiar contraseña)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token es requerido" },
        { status: 400 }
      );
    }

    // Buscar usuario con el token válido y no expirado
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(), // Token no expirado
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Token inválido o expirado" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Error validating reset token:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
