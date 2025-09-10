import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { requireAdmin } from "../../../../lib/admin";

const prisma = new PrismaClient();

// GET - Obtener estadísticas y analytics
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const period = url.searchParams.get("period") || "30"; // días por defecto
    const productId = url.searchParams.get("productId"); // filtro por producto

    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Estadísticas generales
    const totalUsers = await prisma.user.count({
      where: { role: "USER" },
    });
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({
      where: { isActive: true },
    });

    // Estadísticas de puntos
    const pointsStats = await prisma.user.aggregate({
      where: { role: "USER" },
      _sum: {
        puntos: true,
        puntosHistoricos: true,
      },
    });

    // Órdenes en el período
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        ...(productId && {
          items: {
            some: {
              productId: productId,
            },
          },
        }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            dni: true,
          },
        },
      },
    });

    // Agrupar órdenes por día
    const ordersByDay = orders.reduce(
      (
        acc: Record<string, { total: number; points: number; orders: number }>,
        order
      ) => {
        const day = order.createdAt.toISOString().split("T")[0];
        if (!acc[day]) {
          acc[day] = { total: 0, points: 0, orders: 0 };
        }
        
        if (productId) {
          // Si hay filtro por producto, solo contar los items de ese producto
          const productItems = order.items.filter(item => item.productId === productId);
          const productTotal = productItems.reduce((sum, item) => sum + item.total, 0);
          const productQuantity = productItems.reduce((sum, item) => sum + item.quantity, 0);
          
          acc[day].total += productTotal;
          acc[day].orders += productQuantity; // Usar cantidad de productos en lugar de número de órdenes
        } else {
          acc[day].total += order.totalAmount;
          acc[day].orders += 1;
        }
        
        acc[day].points += order.totalPoints;
        return acc;
      },
      {}
    );

    // Productos más populares (por cantidad en órdenes)
    const productStats = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
        total: true,
      },
      _count: true,
      where: {
        order: {
          createdAt: {
            gte: startDate,
          },
        },
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    // Obtener detalles de los productos más populares
    const topProducts = await Promise.all(
      productStats.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        return {
          product,
          totalSales: item._sum.total || 0,
          totalQuantity: item._sum.quantity || 0,
          orderCount: item._count,
        };
      })
    );

    // Proyecciones simples (basadas en tendencia del período)
    const dailyAverage =
      Object.values(ordersByDay).reduce((acc, day) => acc + day.total, 0) /
      periodDays;
    const projections = {
      nextWeek: dailyAverage * 7,
      nextMonth: dailyAverage * 30,
      nextQuarter: dailyAverage * 90,
    };

    // Premios más populares
    const rewardClaims = await prisma.rewardClaim.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        reward: true,
      },
    });

    const totalPointsDistributed = orders.reduce(
      (acc, order) => acc + order.totalPoints,
      0
    );
    const totalPointsSpent = rewardClaims.reduce(
      (acc, claim) => acc + claim.pointsSpent,
      0
    );

    // Usar estadísticas de puntos históricos
    const totalHistoricPoints = pointsStats._sum.puntosHistoricos || 0;
    const totalCurrentPoints = pointsStats._sum.puntos || 0;

    // Obtener lista de productos para el filtro
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      analytics: {
        summary: {
          totalUsers,
          totalProducts,
          activeProducts,
          totalOrders: orders.length,
          totalPointsDistributed,
          totalPointsSpent,
          totalHistoricPoints,
          totalCurrentPoints,
        },
        ordersByDay,
        topProducts,
        projections,
        rewardStats: {
          totalClaims: rewardClaims.length,
          pointsSpent: totalPointsSpent,
        },
        products, // Lista de productos para el filtro
        period: periodDays,
      },
    });
  } catch (error: any) {
    console.error("Get analytics error:", error);
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
