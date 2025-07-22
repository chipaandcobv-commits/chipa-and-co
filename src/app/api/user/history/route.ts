import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { getCurrentUser } from "../../../../lib/auth";

const prisma = new PrismaClient();

interface ScanData {
  id: string;
  pointsEarned: number;
  createdAt: Date;
  order: {
    id: string;
    qrCode: string;
    totalAmount: number;
    items: Array<{
      product: {
        name: string;
      };
      quantity: number;
      total: number;
    }>;
  };
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
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Debes estar autenticado para ver tu historial",
        },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // 'scans', 'claims', or 'all'
    const limit = url.searchParams.get("limit");

    const pageSize = limit ? parseInt(limit) : 20;

    let scans: ScanData[] = [];
    let claims: ClaimData[] = [];

    // Obtener escaneos de QR si se solicita
    if (type === "scans" || type === "all" || !type) {
      scans = await prisma.qRScan.findMany({
        where: {
          userId: currentUser.userId,
        },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: type === "scans" ? pageSize : Math.floor(pageSize / 2),
      });
    }

    // Obtener canjes de premios si se solicita
    if (type === "claims" || type === "all" || !type) {
      claims = await prisma.rewardClaim.findMany({
        where: {
          userId: currentUser.userId,
        },
        include: {
          reward: true,
        },
        orderBy: { createdAt: "desc" },
        take: type === "claims" ? pageSize : Math.floor(pageSize / 2),
      });
    }

    // Combinar y ordenar por fecha si se solicita todo
    let combinedHistory: Array<{
      type: "scan" | "claim";
      id: string;
      date: Date;
      points: number;
      details: any;
    }> = [];

    if (type === "all" || !type) {
      const scanHistory = scans.map((scan) => ({
        type: "scan" as const,
        id: scan.id,
        date: scan.createdAt,
        points: scan.pointsEarned,
        details: {
          orderId: scan.order.id,
          qrCode: scan.order.qrCode,
          totalAmount: scan.order.totalAmount,
          items: scan.order.items.map((item) => ({
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

      combinedHistory = [...scanHistory, ...claimHistory]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, pageSize);
    }

    // Estadísticas del usuario
    const userStats = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        puntos: true,
        _count: {
          select: {
            qrScans: true,
            rewardClaims: true,
          },
        },
      },
    });

    const totalPointsEarned = await prisma.qRScan.aggregate({
      where: { userId: currentUser.userId },
      _sum: { pointsEarned: true },
    });

    const totalPointsSpent = await prisma.rewardClaim.aggregate({
      where: { userId: currentUser.userId },
      _sum: { pointsSpent: true },
    });

    return NextResponse.json({
      success: true,
      history:
        type === "all" || !type
          ? combinedHistory
          : {
              scans: type === "scans" ? scans : [],
              claims: type === "claims" ? claims : [],
            },
      stats: {
        currentPoints: userStats?.puntos || 0,
        totalScans: userStats?._count.qrScans || 0,
        totalClaims: userStats?._count.rewardClaims || 0,
        totalPointsEarned: totalPointsEarned._sum.pointsEarned || 0,
        totalPointsSpent: totalPointsSpent._sum.pointsSpent || 0,
      },
    });
  } catch (error) {
    console.error("Get user history error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
