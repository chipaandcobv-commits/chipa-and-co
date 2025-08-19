import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { requireAdmin } from "../../../../lib/admin";

const prisma = new PrismaClient();

// GET - Obtener ranking de usuarios por puntos históricos
export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      where: {
        role: "USER", // Solo usuarios normales, no admins
      },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        puntos: true,
        puntosHistoricos: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            rewardClaims: true,
          },
        },
      },
      orderBy: {
        puntosHistoricos: "desc", // Ordenar por puntos históricos descendente
      },
    });

    // Calcular estadísticas adicionales
    const totalUsers = users.length;
    const totalHistoricPoints = users.reduce((sum, user) => sum + user.puntosHistoricos, 0);
    const totalCurrentPoints = users.reduce((sum, user) => sum + user.puntos, 0);
    const totalOrders = users.reduce((sum, user) => sum + user._count.orders, 0);
    const totalClaims = users.reduce((sum, user) => sum + user._count.rewardClaims, 0);

    return NextResponse.json({
      success: true,
      ranking: users.map((user, index) => ({
        position: index + 1,
        id: user.id,
        name: user.name,
        email: user.email,
        dni: user.dni,
        puntosActuales: user.puntos,
        puntosHistoricos: user.puntosHistoricos,
        totalCompras: user._count.orders,
        totalCanjes: user._count.rewardClaims,
        fechaRegistro: user.createdAt,
      })),
      stats: {
        totalUsers,
        totalHistoricPoints,
        totalCurrentPoints,
        totalOrders,
        totalClaims,
        promedioPuntosHistoricos: totalUsers > 0 ? Math.round(totalHistoricPoints / totalUsers) : 0,
        promedioPuntosActuales: totalUsers > 0 ? Math.round(totalCurrentPoints / totalUsers) : 0,
      },
    });
  } catch (error: any) {
    console.error("Get ranking error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      {
        status:
          error.message ===
          "Acceso denegado: Se requieren permisos de administrador"
            ? 403
            : 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
