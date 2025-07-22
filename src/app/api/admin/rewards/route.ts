import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { requireAdmin } from "../../../../lib/admin";

const prisma = new PrismaClient();

// GET - Obtener todos los premios
export async function GET() {
  try {
    await requireAdmin();

    const rewards = await prisma.reward.findMany({
      include: {
        _count: {
          select: {
            claims: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      rewards,
    });
  } catch (error: any) {
    console.error("Get rewards error:", error);
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

// POST - Crear nuevo premio
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const data = await request.json();
    const { name, description, pointsCost, stock, imageUrl } = data;

    // Validaciones
    if (!name || !pointsCost) {
      return NextResponse.json(
        { success: false, error: "Nombre y costo en puntos son requeridos" },
        { status: 400 }
      );
    }

    if (pointsCost <= 0) {
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

    const reward = await prisma.reward.create({
      data: {
        name,
        description: description || null,
        pointsCost: parseInt(pointsCost),
        stock: stock !== null && stock !== undefined ? parseInt(stock) : null,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json({
      success: true,
      reward,
    });
  } catch (error: any) {
    console.error("Create reward error:", error);
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
