import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { getCurrentUser } from "../../../../lib/auth";

const prisma = new PrismaClient();

interface Params {
  params: Promise<{ qrCode: string }>;
}

// GET - Obtener información del QR (sin escanear)
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { qrCode } = await params;

    const order = await prisma.order.findUnique({
      where: { qrCode },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Código QR no válido" },
        { status: 404 }
      );
    }

    if (order.isScanned) {
      return NextResponse.json(
        {
          success: false,
          error: "Este código QR ya fue usado",
          scannedAt: order.scannedAt,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        totalAmount: order.totalAmount,
        totalPoints: order.totalPoints,
        items: order.items.map((item) => ({
          product: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Get QR info error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Escanear código QR y asignar puntos
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { qrCode } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Debes estar autenticado para escanear códigos QR",
        },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { qrCode },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Código QR no válido" },
        { status: 404 }
      );
    }

    if (order.isScanned) {
      return NextResponse.json(
        {
          success: false,
          error: "Este código QR ya fue usado",
          scannedAt: order.scannedAt,
        },
        { status: 400 }
      );
    }

    // Usar transacción para asegurar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // Marcar orden como escaneada
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          isScanned: true,
          scannedAt: new Date(),
          scannedBy: currentUser.userId,
        },
      });

      // Crear registro de escaneo
      const qrScan = await tx.qRScan.create({
        data: {
          orderId: order.id,
          userId: currentUser.userId,
          pointsEarned: order.totalPoints,
        },
      });

      // Actualizar puntos del usuario
      const updatedUser = await tx.user.update({
        where: { id: currentUser.userId },
        data: {
          puntos: {
            increment: order.totalPoints,
          },
        },
      });

      return { updatedOrder, qrScan, updatedUser };
    });

    return NextResponse.json({
      success: true,
      message: `¡Felicidades! Has ganado ${order.totalPoints} puntos`,
      pointsEarned: order.totalPoints,
      newTotalPoints: result.updatedUser.puntos,
      order: {
        id: order.id,
        totalAmount: order.totalAmount,
        items: order.items.map((item) => ({
          product: item.product.name,
          quantity: item.quantity,
          total: item.total,
        })),
      },
    });
  } catch (error: any) {
    console.error("Scan QR error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
