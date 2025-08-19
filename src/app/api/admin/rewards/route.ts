import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { requireAdmin } from "../../../../lib/admin";

const prisma = new PrismaClient();

// GET - Obtener todos los premios
export async function GET() {
  try {
    await requireAdmin();

    const rewards = await prisma.reward.findMany({
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

    if (!name || !pointsCost) {
      return NextResponse.json(
        { success: false, error: "Nombre y costo en puntos son requeridos" },
        { status: 400 }
      );
    }

    const reward = await prisma.reward.create({
      data: {
        name,
        description,
        pointsCost: parseInt(pointsCost),
        stock: stock ? parseInt(stock) : null,
        imageUrl,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Premio creado exitosamente",
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
