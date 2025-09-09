import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";
import { PrismaClient } from "../../../../generated/prisma";
import { signToken } from "../../../../lib/auth";
import { securityLogger, SecurityEventType } from "../../../../lib/securityLogger";

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

    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // OBLIGATORIO: Si el usuario necesita completar perfil, no generar token
    if (user.needsProfileCompletion) {
      return NextResponse.json(
        { success: false, error: "Perfil incompleto - Debe completar DNI y contraseña obligatoriamente" },
        { status: 400 }
      );
    }

    // Verificar que el usuario tenga DNI (campo obligatorio)
    if (!user.dni || user.dni.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "DNI es obligatorio - Debe completar su perfil" },
        { status: 400 }
      );
    }

    // Generar token JWT
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      dni: user.dni,
    });

    // Log de actividad
    securityLogger.log(
      SecurityEventType.ACCESS_GRANTED,
      request,
      user.id,
      user.email,
      "Google OAuth completion",
      { method: "google" }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dni: user.dni,
        puntos: user.puntos,
        puntosHistoricos: user.puntosHistoricos,
        role: user.role,
        isGoogleUser: user.isGoogleUser,
        needsProfileCompletion: user.needsProfileCompletion,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });

  } catch (error) {
    console.error("Error generating Google completion token:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
