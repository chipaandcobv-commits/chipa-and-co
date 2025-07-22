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
        scans: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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

// POST - Crear nuevo pedido con QR
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const data = await request.json();
    const { items } = data; // [{ productId, quantity }]

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Debe incluir al menos un producto" },
        { status: 400 }
      );
    }

    // Obtener configuración de puntos
    const pointsConfig = await prisma.systemConfig.findUnique({
      where: { key: "pointsPerPeso" },
    });

    const pointsPerPeso = pointsConfig ? parseFloat(pointsConfig.value) : 0.001;

    // Validar y calcular productos
    let totalAmount = 0;
    const orderItems = [];

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

    // Generar código QR único
    const qrCode = generateQRCode();

    // Crear pedido
    const order = await prisma.order.create({
      data: {
        totalAmount,
        totalPoints,
        qrCode,
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
      },
    });

    return NextResponse.json({
      success: true,
      order,
      qrCode,
      qrUrl: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/scan/${qrCode}`,
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

function generateQRCode(): string {
  // Generar código QR único de 12 caracteres
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
