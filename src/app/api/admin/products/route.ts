import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { requireAdmin } from "../../../../lib/admin";

const prisma = new PrismaClient();

// GET - Obtener todos los productos
export async function GET() {
  try {
    await requireAdmin();

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          select: {
            total: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    // Calcular el total de ventas para cada producto
    const productsWithSales = products.map(product => ({
      ...product,
      totalSales: product.orderItems.reduce((sum, item) => sum + item.total, 0),
    }));

    return NextResponse.json({
      success: true,
      products: productsWithSales,
    });
  } catch (error: any) {
    console.error("Get products error:", error);
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

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const data = await request.json();
    const { name, price, description } = data;

    // Validaciones
    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: "Nombre y precio son requeridos" },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { success: false, error: "El precio no puede ser negativo" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        description: description || null,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error("Create product error:", error);
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
