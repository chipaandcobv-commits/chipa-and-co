import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

// GET - Obtener ranking de usuarios
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");
    const page = url.searchParams.get("page");

    const pageSize = limit ? parseInt(limit) : 10;
    const currentPage = page ? parseInt(page) : 1;
    const skip = (currentPage - 1) * pageSize;

    // Obtener ranking de usuarios
    const users = await prisma.user.findMany({
      where: {
        role: "USER", // Solo usuarios normales, no admins
      },
      select: {
        id: true,
        name: true,
        dni: true,
        puntos: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            rewardClaims: true,
          },
        },
      },
      orderBy: [
        { puntos: "desc" },
        { createdAt: "asc" }, // En caso de empate, el más antiguo primero
      ],
      take: pageSize,
      skip: skip,
    });

    // Obtener total de usuarios para paginación
    const totalUsers = await prisma.user.count({
      where: {
        role: "USER",
      },
    });

    // Añadir posición en el ranking
    const usersWithRank = users.map((user, index) => ({
      ...user,
      rank: skip + index + 1,
      ordersCount: user._count.orders,
      claimsCount: user._count.rewardClaims,
    }));

    return NextResponse.json({
      success: true,
      ranking: usersWithRank,
      pagination: {
        currentPage,
        pageSize,
        totalUsers,
        totalPages: Math.ceil(totalUsers / pageSize),
        hasNext: currentPage * pageSize < totalUsers,
        hasPrev: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Get ranking error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
