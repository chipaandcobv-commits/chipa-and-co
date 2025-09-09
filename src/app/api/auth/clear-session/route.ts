import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe en la base de datos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // El usuario no existe en la base de datos, limpiar la sesión
      return NextResponse.json({
        success: true,
        message: "Usuario no encontrado en la base de datos",
        shouldClearSession: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Usuario encontrado en la base de datos",
      shouldClearSession: false,
    });

  } catch (error) {
    console.error("Error checking user session:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
