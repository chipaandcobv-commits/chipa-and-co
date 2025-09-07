import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// Función para limpiar premios vencidos automáticamente
async function cleanupExpiredRewards() {
  try {
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    console.log(`🔄 Iniciando limpieza de premios vencidos...`);
    console.log(`📅 Fecha actual: ${now.toISOString()}`);
    console.log(`📅 48 horas atrás: ${fortyEightHoursAgo.toISOString()}`);

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

      console.log(`✅ ${expiredClaims.count} premios marcados como vencidos`);

      // 2. Eliminar premios vencidos que tienen más de 48 horas
      const deletedClaims = await tx.rewardClaim.deleteMany({
        where: {
          status: "EXPIRED",
          expiresAt: {
            lt: fortyEightHoursAgo,
          },
        },
      });

      console.log(`🗑️ ${deletedClaims.count} premios eliminados permanentemente`);

      return {
        expiredCount: expiredClaims.count,
        deletedCount: deletedClaims.count,
      };
    });

    console.log("✅ Limpieza completada exitosamente");
    return result;
  } catch (error) {
    console.error("❌ Error durante la limpieza:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    console.log("🚀 Ejecutando limpieza manual de premios vencidos...");

    // Ejecutar limpieza
    const result = await cleanupExpiredRewards();

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
      message: `Limpieza ejecutada exitosamente: ${result.expiredCount} premios marcados como vencidos, ${result.deletedCount} premios eliminados`,
      result: {
        expiredCount: result.expiredCount,
        deletedCount: result.deletedCount,
      },
      stats: {
        total: totalClaims,
        pending: pendingClaims,
        expired: expiredClaims,
        approved: stats.find(s => s.status === "APPROVED")?._count.status || 0,
        rejected: stats.find(s => s.status === "REJECTED")?._count.status || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error en limpieza manual:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      {
        status:
          error.message === "Acceso denegado: Se requieren permisos de administrador"
            ? 403
            : 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    // Solo obtener estadísticas sin ejecutar limpieza
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

    // Verificar si hay premios que deberían estar vencidos
    const now = new Date();
    const shouldBeExpired = await prisma.rewardClaim.count({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: now,
        },
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        total: totalClaims,
        pending: pendingClaims,
        expired: expiredClaims,
        approved: stats.find(s => s.status === "APPROVED")?._count.status || 0,
        rejected: stats.find(s => s.status === "REJECTED")?._count.status || 0,
        shouldBeExpired,
      },
      needsCleanup: shouldBeExpired > 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error obteniendo estadísticas:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      {
        status:
          error.message === "Acceso denegado: Se requieren permisos de administrador"
            ? 403
            : 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
