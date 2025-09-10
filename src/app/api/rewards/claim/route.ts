import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { getCurrentUser } from "../../../../lib/auth-server";

const prisma = new PrismaClient();

// POST - Canjear premio
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Debes estar autenticado para canjear premios",
        },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { rewardId } = data;

    if (!rewardId) {
      return NextResponse.json(
        { success: false, error: "ID del premio requerido" },
        { status: 400 }
      );
    }

    // Usar transacción para asegurar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // Obtener usuario actual
      const user = await tx.user.findUnique({
        where: { id: currentUser.userId },
      });

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      // Obtener premio
      const reward = await tx.reward.findUnique({
        where: { id: rewardId },
      });

      if (!reward || !reward.isActive) {
        throw new Error("Premio no disponible");
      }

      // Verificar puntos suficientes
      if (user.puntos < reward.pointsCost) {
        throw new Error(
          `Puntos insuficientes. Necesitas ${reward.pointsCost} puntos, tienes ${user.puntos}`
        );
      }

      // Verificar stock si aplica
      if (reward.stock !== null && reward.stock <= 0) {
        throw new Error("Premio agotado");
      }

      // Verificar si el usuario ya tiene un premio pendiente o vencido del mismo tipo
      const existingClaim = await tx.rewardClaim.findFirst({
        where: {
          rewardId,
          userId: currentUser.userId,
          status: {
            in: ["PENDING", "EXPIRED"],
          },
        },
      });

      if (existingClaim) {
        if (existingClaim.status === "PENDING") {
          throw new Error("Ya tienes un premio pendiente de este tipo");
        } else {
          throw new Error("Ya tienes un premio vencido de este tipo");
        }
      }

      // Crear canje con fecha de vencimiento (24 horas desde ahora)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const claim = await tx.rewardClaim.create({
        data: {
          rewardId,
          userId: currentUser.userId,
          pointsSpent: reward.pointsCost,
          expiresAt,
        },
        include: {
          reward: true,
        },
      });

      // Descontar puntos del usuario (solo puntos actuales, no históricos)
      const updatedUser = await tx.user.update({
        where: { id: currentUser.userId },
        data: {
          puntos: {
            decrement: reward.pointsCost,
          },
          // Los puntos históricos no se afectan al canjear premios
        },
      });

      // Decrementar stock si aplica
      if (reward.stock !== null) {
        await tx.reward.update({
          where: { id: rewardId },
          data: {
            stock: {
              decrement: 1,
            },
          },
        });
      }

      return { claim, updatedUser };
    });

    return NextResponse.json({
      success: true,
      message: `¡Premio canjeado exitosamente! Has gastado ${result.claim.pointsSpent} puntos`,
      claim: {
        id: result.claim.id,
        reward: result.claim.reward.name,
        pointsSpent: result.claim.pointsSpent,
        status: result.claim.status,
        createdAt: result.claim.createdAt,
      },
      newTotalPoints: result.updatedUser.puntos,
    });
  } catch (error: any) {
    console.error("Claim reward error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
