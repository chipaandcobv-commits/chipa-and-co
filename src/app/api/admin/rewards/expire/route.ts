import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../../generated/prisma";
import { getCurrentUser } from "../../../../../lib/auth";

const prisma = new PrismaClient();

// POST - Marcar premios vencidos y eliminar los que tienen más de 48 horas
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Acceso denegado. Solo administradores pueden ejecutar esta acción.",
        },
        { status: 403 }
      );
    }

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

    return NextResponse.json({
      success: true,
      message: `Proceso completado: ${result.expiredCount} premios marcados como vencidos, ${result.deletedCount} premios eliminados`,
      data: result,
    });
  } catch (error: any) {
    console.error("Expire rewards error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Obtener estadísticas de premios vencidos
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Acceso denegado. Solo administradores pueden ejecutar esta acción.",
        },
        { status: 403 }
      );
    }

    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const stats = await prisma.$transaction(async (tx) => {
      // Premios pendientes que han expirado
      const expiredPending = await tx.rewardClaim.count({
        where: {
          status: "PENDING",
          expiresAt: {
            lt: now,
          },
        },
      });

      // Premios vencidos que pueden ser eliminados
      const expiredToDelete = await tx.rewardClaim.count({
        where: {
          status: "EXPIRED",
          expiresAt: {
            lt: fortyEightHoursAgo,
          },
        },
      });

      // Total de premios vencidos
      const totalExpired = await tx.rewardClaim.count({
        where: {
          status: "EXPIRED",
        },
      });

      return {
        expiredPending,
        expiredToDelete,
        totalExpired,
      };
    });

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Get expire stats error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
