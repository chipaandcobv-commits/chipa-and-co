import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../../generated/prisma";
import { requireAdmin } from "../../../../../lib/admin";

const prisma = new PrismaClient();

// POST - Recalcular puntos de todos los usuarios basado en nueva configuración
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const data = await request.json();
    const { oldPointsPerPeso, newPointsPerPeso } = data;

    if (!oldPointsPerPeso || !newPointsPerPeso) {
      return NextResponse.json(
        { success: false, error: "Se requieren los valores antiguos y nuevos de puntos por peso" },
        { status: 400 }
      );
    }

    const oldRatio = parseFloat(oldPointsPerPeso);
    const newRatio = parseFloat(newPointsPerPeso);

    if (isNaN(oldRatio) || isNaN(newRatio) || oldRatio <= 0 || newRatio <= 0) {
      return NextResponse.json(
        { success: false, error: "Los valores de puntos por peso deben ser números válidos mayores a 0" },
        { status: 400 }
      );
    }

    // Calcular el factor de multiplicación
    const multiplier = newRatio / oldRatio;

    console.log(`🔄 Recalculando puntos: ${oldRatio} → ${newRatio} (factor: ${multiplier})`);

    // Obtener todos los usuarios
    const users = await prisma.user.findMany({
      where: { role: "USER" }, // Solo usuarios normales, no admins
      select: {
        id: true,
        dni: true,
        puntos: true,
        puntosHistoricos: true,
      },
    });

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay usuarios para recalcular",
        recalculatedUsers: 0,
      });
    }

    console.log(`👥 Encontrados ${users.length} usuarios para recalcular`);

    // Recalcular puntos usando una estrategia más eficiente
    let recalculatedUsers = 0;
    const batchSize = 100; // Lotes más grandes para updateMany

    console.log(`🔄 Procesando ${users.length} usuarios en lotes de ${batchSize}...`);

    // Si el multiplicador es 1, no hay cambios necesarios
    if (multiplier === 1) {
      console.log("ℹ️ El multiplicador es 1, no se requieren cambios");
      recalculatedUsers = users.length;
    } else {
      // Procesar en lotes usando updateMany para mayor eficiencia
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        
        // Usar transacción para cada lote
        const batchResult = await prisma.$transaction(async (tx) => {
          let processed = 0;
          
          // Procesar cada usuario del lote individualmente para mantener precisión
          for (const user of batch) {
            const newCurrentPoints = Math.round(user.puntos * multiplier);
            const newHistoricPoints = Math.round(user.puntosHistoricos * multiplier);

            await tx.user.update({
              where: { id: user.id },
              data: {
                puntos: newCurrentPoints,
                puntosHistoricos: newHistoricPoints,
              },
            });
            
            processed++;
          }
          
          return processed;
        }, {
          timeout: 20000, // 20 segundos por transacción
        });
        
        recalculatedUsers += batchResult;
        const progress = Math.round((recalculatedUsers/users.length)*100);
        console.log(`📊 Procesados ${recalculatedUsers}/${users.length} usuarios (${progress}%)`);
        
        // Pausa más larga entre lotes para evitar sobrecarga
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }

    const result = recalculatedUsers;

    console.log(`✅ Recalculados ${result} usuarios exitosamente`);

    return NextResponse.json({
      success: true,
      message: `Puntos recalculados exitosamente para ${result} usuarios`,
      recalculatedUsers: result,
      oldRatio,
      newRatio,
      multiplier,
      details: {
        oldPointsPerPeso: oldRatio,
        newPointsPerPeso: newRatio,
        factorMultiplicacion: multiplier,
        usuariosAfectados: result,
      },
    });

  } catch (error: any) {
    console.error("Recalculate points error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      {
        status:
          error.message === "Acceso denegado: Se requieren permisos de administrador"
            ? 403
            : 500,
      }
    );
  }
}
