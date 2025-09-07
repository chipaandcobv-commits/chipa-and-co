import { NextRequest, NextResponse } from "next/server";
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
    // Verificar token de seguridad (opcional, para mayor seguridad)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Ejecutar limpieza automática
    const cleanupResult = await cleanupExpiredRewards();

    return NextResponse.json({
      success: true,
      message: `Limpieza automática ejecutada: ${cleanupResult.expiredCount} vencidos, ${cleanupResult.deletedCount} eliminados`,
      result: cleanupResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en cron cleanup:", error);
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
    // Verificar token de seguridad
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Ejecutar limpieza manual
    const result = await cleanupExpiredRewards();

    return NextResponse.json({
      success: true,
      message: `Limpieza manual ejecutada: ${result.expiredCount} vencidos, ${result.deletedCount} eliminados`,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en cron cleanup POST:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
