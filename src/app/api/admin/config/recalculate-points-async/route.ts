import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../../generated/prisma";
import { requireAdmin } from "../../../../../lib/admin";

const prisma = new PrismaClient();

// POST - Recalcular puntos de todos los usuarios de forma asíncrona
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

    console.log(`🔄 Iniciando recálculo asíncrono: ${oldRatio} → ${newRatio} (factor: ${multiplier})`);

    // Obtener todos los usuarios
    const users = await prisma.user.findMany({
      where: { role: "USER" },
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

    // Si el multiplicador es 1, no hay cambios necesarios
    if (multiplier === 1) {
      console.log("ℹ️ El multiplicador es 1, no se requieren cambios");
      return NextResponse.json({
        success: true,
        message: `No se requieren cambios (multiplicador = 1). ${users.length} usuarios verificados.`,
        recalculatedUsers: users.length,
        oldRatio,
        newRatio,
        multiplier,
      });
    }

    // Procesar usuarios uno por uno sin transacciones grandes
    let recalculatedUsers = 0;
    const batchSize = 10; // Lotes muy pequeños
    const totalBatches = Math.ceil(users.length / batchSize);

    console.log(`🔄 Procesando ${users.length} usuarios en ${totalBatches} lotes de ${batchSize}...`);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, users.length);
      const batch = users.slice(startIndex, endIndex);

      console.log(`📦 Procesando lote ${batchIndex + 1}/${totalBatches} (usuarios ${startIndex + 1}-${endIndex})`);

      // Procesar cada usuario del lote individualmente
      for (const user of batch) {
        try {
          const newCurrentPoints = Math.round(user.puntos * multiplier);
          const newHistoricPoints = Math.round(user.puntosHistoricos * multiplier);

          // Actualización individual sin transacción
          await prisma.user.update({
            where: { id: user.id },
            data: {
              puntos: newCurrentPoints,
              puntosHistoricos: newHistoricPoints,
            },
          });

          recalculatedUsers++;
        } catch (error) {
          console.error(`❌ Error actualizando usuario ${user.dni || user.id}:`, error);
          // Continuar con el siguiente usuario
        }
      }

      // Pausa entre lotes para evitar sobrecarga
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const progress = Math.round(((batchIndex + 1) / totalBatches) * 100);
      console.log(`📊 Progreso: ${progress}% (${recalculatedUsers}/${users.length} usuarios procesados)`);
    }

    console.log(`✅ Recalculados ${recalculatedUsers} usuarios exitosamente`);

    return NextResponse.json({
      success: true,
      message: `Puntos recalculados exitosamente para ${recalculatedUsers} usuarios`,
      recalculatedUsers,
      oldRatio,
      newRatio,
      multiplier,
      details: {
        oldPointsPerPeso: oldRatio,
        newPointsPerPeso: newRatio,
        factorMultiplicacion: multiplier,
        usuariosAfectados: recalculatedUsers,
        totalUsuarios: users.length,
      },
    });

  } catch (error: any) {
    console.error("Recalculate points async error:", error);
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
