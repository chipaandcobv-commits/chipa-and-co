import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Intentar obtener usuario con JWT primero
    let currentUser = await getCurrentUser();
    
    // Si no hay usuario JWT, intentar con NextAuth
    if (!currentUser) {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        // Buscar usuario en la base de datos
        const dbUser = await prisma.user.findUnique({
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
          }
        });
        
        if (dbUser) {
          currentUser = {
            userId: dbUser.id,
            email: dbUser.email,
            role: dbUser.role,
            name: dbUser.name
          };
        }
      }
    }

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener datos actualizados del usuario
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
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

    return NextResponse.json({
      success: true,
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
