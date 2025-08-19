import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../../generated/prisma";
import { requireAdmin } from "../../../../../lib/admin";

const prisma = new PrismaClient();

// POST - Validar premio canjeado
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const data = await request.json();
    const { claimId, status, notes } = data;

    if (!claimId || !status) {
      return NextResponse.json(
        { success: false, error: "ID del canje y estado son requeridos" },
        { status: 400 }
      );
    }

    // Validar que el estado sea válido
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Estado inválido" },
        { status: 400 }
      );
    }

    // Actualizar el estado del canje
    const updatedClaim = await prisma.rewardClaim.update({
      where: { id: claimId },
      data: {
        status,
        notes: notes || null,
        updatedAt: new Date(),
      },
      include: {
        reward: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            dni: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Premio ${status.toLowerCase()}`,
      claim: {
        id: updatedClaim.id,
        reward: updatedClaim.reward.name,
        user: updatedClaim.user.name,
        userDni: updatedClaim.user.dni,
        pointsSpent: updatedClaim.pointsSpent,
        status: updatedClaim.status,
        notes: updatedClaim.notes,
        createdAt: updatedClaim.createdAt,
        updatedAt: updatedClaim.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Validate reward error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      {
        status:
          error.message ===
          "Acceso denegado: Se requieren permisos de administrador"
            ? 403
            : 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Obtener canjes pendientes de validación
export async function GET() {
  try {
    await requireAdmin();

    const pendingClaims = await prisma.rewardClaim.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        reward: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            dni: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const stats = {
      pending: pendingClaims.length,
      total: await prisma.rewardClaim.count(),
      approved: await prisma.rewardClaim.count({ where: { status: "APPROVED" } }),
      rejected: await prisma.rewardClaim.count({ where: { status: "REJECTED" } }),
      completed: await prisma.rewardClaim.count({ where: { status: "COMPLETED" } }),
    };

    return NextResponse.json({
      success: true,
      claims: pendingClaims.map((claim) => ({
        id: claim.id,
        reward: claim.reward.name,
        user: claim.user.name,
        userDni: claim.user.dni,
        userEmail: claim.user.email,
        pointsSpent: claim.pointsSpent,
        status: claim.status,
        notes: claim.notes,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
      })),
      stats,
    });
  } catch (error: any) {
    console.error("Get pending claims error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      {
        status:
          error.message ===
          "Acceso denegado: Se requieren permisos de administrador"
            ? 403
            : 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
