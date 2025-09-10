import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { securityLogger, SecurityEventType } from "../../../../lib/securityLogger";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email es requerido" },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        isGoogleUser: true,
        password: true,
      },
    });

    // Por seguridad, siempre devolver éxito aunque el email no exista
    // Esto previene ataques de enumeración de emails
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Si el email existe, recibirás un enlace de recuperación",
      });
    }

    // Verificar que el usuario tenga contraseña (no es un usuario solo de Google sin completar perfil)
    if (!user.password) {
      return NextResponse.json({
        success: true,
        message: "Si el email existe, recibirás un enlace de recuperación",
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      },
    });

    // Log de actividad
    securityLogger.log(
      SecurityEventType.PASSWORD_RESET_REQUESTED,
      request,
      user.id,
      user.email,
      "Password reset requested",
      { isGoogleUser: user.isGoogleUser }
    );

    // TODO: Enviar email con el token
    // Por ahora, devolvemos el token en la respuesta para testing
    // En producción, esto debe enviarse por email
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    console.log(`🔐 Password reset link for ${user.email}: ${resetUrl}`);

    return NextResponse.json({
      success: true,
      message: "Si el email existe, recibirás un enlace de recuperación",
      // TODO: Remover en producción
      resetUrl: process.env.NODE_ENV === "development" ? resetUrl : undefined,
    });

  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
