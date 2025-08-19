import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

// GET - Obtener premios disponibles para usuarios
export async function GET() {
  try {
    const rewards = await prisma.reward.findMany({
      where: {
        isActive: true,
        OR: [
          { stock: null }, // Stock ilimitado
          { stock: { gt: 0 } }, // Stock disponible
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        pointsCost: true,
        imageUrl: true,
        stock: true,
        isActive: true,
        _count: {
          select: {
            claims: true,
          },
        },
      },
      orderBy: { pointsCost: "asc" },
    });



    return NextResponse.json({
      success: true,
      rewards,
    });
  } catch (error) {
    console.error("Get rewards error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
