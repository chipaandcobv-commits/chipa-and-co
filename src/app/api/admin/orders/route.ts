import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { requireAdmin } from "../../../../lib/admin";

const prisma = new PrismaClient();

// GET - Obtener todos los pedidos
export async function GET() {
  try {
    await requireAdmin();

    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            dni: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error("Get orders error:", error);
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

// POST - Crear nuevo pedido con DNI del cliente
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const data = await request.json();
    const { items, clientDni } = data; // [{ productId, quantity }], clientDni

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Debe incluir al menos un producto" },
        { status: 400 }
      );
    }

    if (!clientDni || typeof clientDni !== "string" || clientDni.trim() === "") {
      return NextResponse.json(
        { success: false, error: "El DNI del cliente es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const client = await prisma.user.findUnique({
      where: { dni: clientDni.trim() },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Cliente no encontrado con el DNI proporcionado" },
        { status: 404 }
      );
    }

    // Obtener configuración de puntos
    const pointsConfig = await prisma.systemConfig.findUnique({
      where: { key: "pointsPerPeso" },
    });

    const pointsPerPeso = pointsConfig ? parseFloat(pointsConfig.value) : 1; // 1 peso = 1 punto por defecto

    // Validar y calcular productos
    let totalAmount = 0;
    const orderItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }> = [];

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        return NextResponse.json(
          { success: false, error: "Productos y cantidades inválidos" },
          { status: 400 }
        );
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product || !product.isActive) {
        return NextResponse.json(
          {
            success: false,
            error: `Producto no encontrado o inactivo: ${productId}`,
          },
          { status: 400 }
        );
      }

      const itemTotal = product.price * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId,
        quantity,
        unitPrice: product.price,
        total: itemTotal,
      });
    }

    // Calcular puntos totales
    const totalPoints = Math.floor(totalAmount * pointsPerPeso);

    // Usar transacción para asegurar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // Crear pedido
      const order = await tx.order.create({
        data: {
          totalAmount,
          totalPoints,
          clientDni: clientDni.trim(),
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              dni: true,
            },
          },
        },
      });

      // Actualizar puntos del cliente
      const updatedClient = await tx.user.update({
        where: { dni: clientDni.trim() },
        data: {
          puntos: {
            increment: totalPoints,
          },
          puntosHistoricos: {
            increment: totalPoints,
          },
        },
      });

      return { order, updatedClient };
    });

    return NextResponse.json({
      success: true,
      order: result.order,
      client: result.updatedClient,
      message: `Orden creada exitosamente. ${totalPoints} puntos agregados al cliente ${result.updatedClient.name}`,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
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
