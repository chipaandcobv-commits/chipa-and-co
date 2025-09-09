import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";
import { PrismaClient } from "../../../../generated/prisma";
import { securityLogger, SecurityEventType } from "../../../../lib/securityLogger";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { dni, password, confirmPassword } = await request.json();

    // Validaciones OBLIGATORIAS - No se puede continuar sin estos datos
    const errors: Record<string, string> = {};

    if (!dni || dni.trim().length === 0) {
      errors.dni = "El DNI es OBLIGATORIO y no puede estar vacío";
    } else if (!/^\d{7,8}$/.test(dni.trim())) {
      errors.dni = "El DNI debe tener entre 7 y 8 dígitos";
    }

    if (!password || password.trim().length === 0) {
      errors.password = "La contraseña es OBLIGATORIA y no puede estar vacía";
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!confirmPassword || confirmPassword.trim().length === 0) {
      errors.confirmPassword = "Debes confirmar la contraseña";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    // Verificar si el DNI ya existe
    if (dni && !errors.dni) {
      const existingUser = await prisma.user.findUnique({
        where: { dni: dni.trim() },
      });

      if (existingUser && existingUser.email !== session.user.email) {
        errors.dni = "Este DNI ya está registrado";
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        dni: dni.trim(),
        password: hashedPassword,
        needsProfileCompletion: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        puntos: true,
        puntosHistoricos: true,
        role: true,
        isGoogleUser: true,
        needsProfileCompletion: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log de actividad
    securityLogger.log(
      SecurityEventType.DATA_UPDATED,
      request,
      updatedUser.id,
      updatedUser.email,
      "Profile completion",
      { dni: updatedUser.dni }
    );

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    console.error("Error completing profile:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
