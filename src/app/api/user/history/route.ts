import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { requireAuth } from "../../../../lib/auth";

const prisma = new PrismaClient();

interface OrderData {
  id: string;
  totalPoints: number;
  totalAmount: number;
  createdAt: Date;
  items: Array<{
    product: {
      name: string;
    };
    quantity: number;
    total: number;
  }>;
}

interface ClaimData {
  id: string;
  pointsSpent: number;
  status: string;
  createdAt: Date;
  reward: {
    name: string;
    description: string | null;
  };
}

// GET - Obtener historial del usuario
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Iniciando request de history...");
    
    const currentUser = await requireAuth();
    console.log(`✅ Usuario autenticado: ${currentUser.name} (${currentUser.email})`);

    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // 'orders', 'claims', or 'all'
    const limit = url.searchParams.get("limit");

    const pageSize = limit ? parseInt(limit) : 20;

    let orders: OrderData[] = [];
    let claims: ClaimData[] = [];

    // Obtener órdenes si se solicita
    if (type === "orders" || type === "all" || !type) {
      console.log(`🔍 Buscando órdenes para DNI: ${currentUser.dni}`);
      const ordersData = await prisma.order.findMany({
        where: {
          clientDni: currentUser.dni,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: type === "orders" ? pageSize : Math.floor(pageSize / 2),
      });

      orders = ordersData as unknown as OrderData[];
      console.log(`✅ Encontradas ${orders.length} órdenes`);
    }

    // Obtener canjes de premios si se solicita
    if (type === "claims" || type === "all" || !type) {
      console.log(`🔍 Buscando canjes para usuario ID: ${currentUser.id}`);
      claims = await prisma.rewardClaim.findMany({
        where: {
          userId: currentUser.id,
        },
        include: {
          reward: true,
        },
        orderBy: { createdAt: "desc" },
        take: type === "claims" ? pageSize : Math.floor(pageSize / 2),
      });
      console.log(`✅ Encontrados ${claims.length} canjes`);
    }

    // Combinar y ordenar por fecha si se solicita todo
    let combinedHistory: Array<{
      type: "order" | "claim";
      id: string;
      date: Date;
      points: number;
      details: any;
    }> = [];

    if (type === "all" || !type) {
      const orderHistory = orders.map((order) => ({
        type: "order" as const,
        id: order.id,
        date: order.createdAt,
        points: order.totalPoints,
        details: {
          orderId: order.id,
          totalAmount: order.totalAmount,
          items: order.items.map((item) => ({
            product: item.product.name,
            quantity: item.quantity,
            total: item.total,
          })),
        },
      }));

      const claimHistory = claims.map((claim) => ({
        type: "claim" as const,
        id: claim.id,
        date: claim.createdAt,
        points: -claim.pointsSpent, // Negativo porque son puntos gastados
        details: {
          reward: claim.reward.name,
          description: claim.reward.description,
          status: claim.status,
        },
      }));

      combinedHistory = [...orderHistory, ...claimHistory]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, pageSize);
    }

    // Estadísticas del usuario
    const userStats = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        puntos: true,
        _count: {
          select: {
            orders: true,
            rewardClaims: true,
          },
        },
      },
    });

    const totalPointsEarned = await prisma.order.aggregate({
      where: { clientDni: currentUser.dni },
      _sum: { totalPoints: true },
    });

    const totalPointsSpent = await prisma.rewardClaim.aggregate({
      where: { userId: currentUser.id },
      _sum: { pointsSpent: true },
    });

    // Preparar la respuesta según el tipo solicitado
    let historyResponse: Array<{
      type: "order" | "claim";
      id: string;
      date: Date;
      points: number;
      details: any;
    }>;
    
    if (type === "all" || !type) {
      historyResponse = combinedHistory;
    } else if (type === "orders") {
      historyResponse = orders.map((order) => ({
        type: "order" as const,
        id: order.id,
        date: order.createdAt,
        points: order.totalPoints,
        details: {
          orderId: order.id,
          totalAmount: order.totalAmount,
          items: order.items.map((item) => ({
            product: item.product.name,
            quantity: item.quantity,
            total: item.total,
          })),
        },
      }));
    } else if (type === "claims") {
      historyResponse = claims.map((claim) => ({
        type: "claim" as const,
        id: claim.id,
        date: claim.createdAt,
        points: -claim.pointsSpent, // Negativo porque son puntos gastados
        details: {
          reward: claim.reward.name,
          description: claim.reward.description,
          status: claim.status,
        },
      }));
    } else {
      historyResponse = [];
    }

    console.log(`✅ History request completado exitosamente`);

    return NextResponse.json({
      success: true,
      history: historyResponse,
      stats: {
        currentPoints: userStats?.puntos || 0,
        totalOrders: userStats?._count.orders || 0,
        totalClaims: userStats?._count.rewardClaims || 0,
        totalPointsEarned: totalPointsEarned._sum?.totalPoints || 0,
        totalPointsSpent: totalPointsSpent._sum?.pointsSpent || 0,
      },
    });
  } catch (error: any) {
    console.error("❌ Get user history error:", error);
    console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack,
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
