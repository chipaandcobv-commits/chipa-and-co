import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [ME-NEXTAUTH] Checking NextAuth session...');
    }
    
    const session = await getServerSession(authOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [ME-NEXTAUTH] Session result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email
      });
    }
    
    if (!session?.user?.email) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ [ME-NEXTAUTH] No session or user found');
      }
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener datos frescos de la base de datos en lugar de usar la sesión
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
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ [ME-NEXTAUTH] User not found in database');
      }
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [ME-NEXTAUTH] Fresh user data from database:', {
        id: user.id,
        puntos: user.puntos,
        puntosHistoricos: user.puntosHistoricos
      });
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
    console.error("Error getting user from NextAuth session:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
