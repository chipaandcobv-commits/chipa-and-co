import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// Función para limpiar premios vencidos automáticamente
async function cleanupExpiredRewards() {
  try {
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Usar transacción para asegurar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // 1. Marcar premios pendientes que han expirado (más de 24 horas) como vencidos
      const expiredClaims = await tx.rewardClaim.updateMany({
        where: {
          status: "PENDING",
          expiresAt: {
            lt: now,
          },
        },
        data: {
          status: "EXPIRED",
        },
      });

      // 2. Eliminar premios vencidos que tienen más de 48 horas
      const deletedClaims = await tx.rewardClaim.deleteMany({
        where: {
          status: "EXPIRED",
          expiresAt: {
            lt: fortyEightHoursAgo,
          },
        },
      });

      return {
        expiredCount: expiredClaims.count,
        deletedCount: deletedClaims.count,
      };
    });

    return result;
  } catch (error) {
    console.error("Error durante la limpieza automática:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    // Ejecutar limpieza automática
    const cleanupResult = await cleanupExpiredRewards();

    // Obtener estadísticas actualizadas
    const stats = await prisma.rewardClaim.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const totalClaims = await prisma.rewardClaim.count();
    const pendingClaims = await prisma.rewardClaim.count({
      where: { status: "PENDING" },
    });
    const expiredClaims = await prisma.rewardClaim.count({
      where: { status: "EXPIRED" },
    });

    return NextResponse.json({
      success: true,
      stats: {
        total: totalClaims,
        pending: pendingClaims,
        expired: expiredClaims,
        approved: stats.find(s => s.status === "APPROVED")?._count.status || 0,
        rejected: stats.find(s => s.status === "REJECTED")?._count.status || 0,
      },
      cleanup: cleanupResult,
      message: `Limpieza automática ejecutada: ${cleanupResult.expiredCount} vencidos, ${cleanupResult.deletedCount} eliminados`,
    });
  } catch (error) {
    console.error("Error en GET /api/admin/rewards/expire:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    // Ejecutar limpieza manual
    const result = await cleanupExpiredRewards();

    return NextResponse.json({
      success: true,
      message: `Limpieza manual ejecutada: ${result.expiredCount} vencidos, ${result.deletedCount} eliminados`,
      result,
    });
  } catch (error) {
    console.error("Error en POST /api/admin/rewards/expire:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
