import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dni = searchParams.get("dni");

    // Si se proporciona DNI, buscar usuario específico
    if (dni) {
      const user = await prisma.user.findUnique({
        where: { dni: dni.trim() },
        select: {
          id: true,
          name: true,
          email: true,
          dni: true,
          avatar: true,
          puntos: true,
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
    }

    // Si no se proporciona DNI, obtener todos los usuarios (sin passwords por seguridad)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        avatar: true,
        puntos: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
