import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../../generated/prisma";
import { requireAdmin } from "../../../../../lib/admin";

const prisma = new PrismaClient();

interface Params {
  params: Promise<{ id: string }>;
}

// PUT - Actualizar premio
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();

    const { id } = await params;
    const data = await request.json();
    const { name, description, pointsCost, stock, imageUrl, isActive } = data;

    // Verificar que el premio existe
    const existingReward = await prisma.reward.findUnique({
      where: { id },
    });

    if (!existingReward) {
      return NextResponse.json(
        { success: false, error: "Premio no encontrado" },
        { status: 404 }
      );
    }

    // Validaciones
    if (pointsCost !== undefined && pointsCost <= 0) {
      return NextResponse.json(
        { success: false, error: "El costo en puntos debe ser mayor a 0" },
        { status: 400 }
      );
    }

    if (stock !== null && stock !== undefined && stock < 0) {
      return NextResponse.json(
        { success: false, error: "El stock no puede ser negativo" },
        { status: 400 }
      );
    }

    // Actualizar premio
    const updatedReward = await prisma.reward.update({
      where: { id },
      data: {
        name: name || existingReward.name,
        description:
          description !== undefined ? description : existingReward.description,
        pointsCost:
          pointsCost !== undefined
            ? parseInt(pointsCost)
            : existingReward.pointsCost,
        stock:
          stock !== undefined
            ? stock !== null
              ? parseInt(stock)
              : null
            : existingReward.stock,
        imageUrl: imageUrl !== undefined ? imageUrl : existingReward.imageUrl,
        isActive: isActive !== undefined ? isActive : existingReward.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      reward: updatedReward,
    });
  } catch (error: any) {
    console.error("Update reward error:", error);
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

// DELETE - Eliminar premio
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();

    const { id } = await params;

    // Verificar que el premio existe
    const existingReward = await prisma.reward.findUnique({
      where: { id },
      include: {
        claims: true,
      },
    });

    if (!existingReward) {
      return NextResponse.json(
        { success: false, error: "Premio no encontrado" },
        { status: 404 }
      );
    }

    // Si tiene canjes, marcar como inactivo en lugar de eliminar
    if (existingReward.claims.length > 0) {
      const updatedReward = await prisma.reward.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: "Premio marcado como inactivo (tiene canjes asociados)",
        reward: updatedReward,
      });
    }

    // Si no tiene canjes, eliminar completamente
    await prisma.reward.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Premio eliminado exitosamente",
    });
  } catch (error: any) {
    console.error("Delete reward error:", error);
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
