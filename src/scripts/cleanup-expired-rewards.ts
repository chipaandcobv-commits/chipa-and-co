import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function cleanupExpiredRewards() {
  try {
    console.log("🔄 Iniciando limpieza de premios vencidos...");
    
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
    console.log(`📊 Resumen: ${result.expiredCount} vencidos, ${result.deletedCount} eliminados`);
    
    return result;
  } catch (error) {
    console.error("❌ Error durante la limpieza:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanupExpiredRewards()
    .then(() => {
      console.log("🎉 Script completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal:", error);
      process.exit(1);
    });
}

export { cleanupExpiredRewards };
