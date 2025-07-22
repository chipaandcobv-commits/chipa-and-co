import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../../generated/prisma";
import { requireAdmin } from "../../../../../lib/admin";

const prisma = new PrismaClient();

interface Params {
  params: Promise<{ id: string }>;
}

// PUT - Actualizar producto
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();

    const { id } = await params;
    const data = await request.json();
    const { name, price, description, isActive } = data;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Validaciones
    if (price !== undefined && price < 0) {
      return NextResponse.json(
        { success: false, error: "El precio no puede ser negativo" },
        { status: 400 }
      );
    }

    // Actualizar producto
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name || existingProduct.name,
        price: price !== undefined ? parseFloat(price) : existingProduct.price,
        description:
          description !== undefined ? description : existingProduct.description,
        isActive: isActive !== undefined ? isActive : existingProduct.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("Update product error:", error);
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

// DELETE - Eliminar producto
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();

    const { id } = await params;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // En lugar de eliminar físicamente, marcar como inactivo si tiene órdenes
    if (existingProduct.orderItems.length > 0) {
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: "Producto marcado como inactivo (tiene órdenes asociadas)",
        product: updatedProduct,
      });
    }

    // Si no tiene órdenes, eliminar completamente
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Producto eliminado exitosamente",
    });
  } catch (error: any) {
    console.error("Delete product error:", error);
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
