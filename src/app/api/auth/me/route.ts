import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    // if (!currentUser) {
    //   return NextResponse.json(
    //     { success: false, error: "No autenticado" },
    //     { status: 401 }
    //   );
    // }

    // Obtener datos actualizados del usuario
    const user = await prisma.user.findUnique({
      where: { id: currentUser?.userId },
      select: {
        id: true,
        name: true,
        email: true,
        puntos: true,
        avatar: true,
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
      user,
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
