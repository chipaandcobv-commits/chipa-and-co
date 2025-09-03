import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { PrismaClient } from "@/generated/prisma";
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    // Obtener todas las órdenes con sus items y productos
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        client: {
          select: {
            name: true,
            email: true,
            dni: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (orders.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No hay órdenes para hacer backup",
      });
    }

    // Preparar datos para Excel
    const backupData = orders.map(order => ({
      orderId: order.id,
      clientName: order.client.name,
      clientEmail: order.client.email,
      clientDni: order.client.dni,
      totalAmount: order.totalAmount,
      totalPoints: order.totalPoints,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    }));

    // Crear workbook de Excel
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Resumen de Órdenes
    const ordersSummary = backupData.map(order => ({
      'ID de Orden': order.orderId,
      'Nombre del Cliente': order.clientName,
      'Email del Cliente': order.clientEmail,
      'DNI del Cliente': order.clientDni,
      'Monto Total': `$${order.totalAmount.toLocaleString()}`,
      'Puntos Otorgados': order.totalPoints.toLocaleString(),
      'Fecha de Creación': new Date(order.createdAt).toLocaleDateString('es-AR'),
      'Hora de Creación': new Date(order.createdAt).toLocaleTimeString('es-AR'),
    }));

    const ordersSheet = XLSX.utils.json_to_sheet(ordersSummary);
    XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Resumen de Órdenes');

    // Hoja 2: Detalle de Items
    const itemsDetail: Array<{
      'ID de Orden': string;
      'Cliente': string;
      'DNI': string;
      'Producto': string;
      'Cantidad': number;
      'Precio Unitario': string;
      'Total del Item': string;
      'Fecha de Orden': string;
    }> = [];
    
    backupData.forEach(order => {
      order.items.forEach(item => {
        itemsDetail.push({
          'ID de Orden': order.orderId,
          'Cliente': order.clientName,
          'DNI': order.clientDni,
          'Producto': item.productName,
          'Cantidad': item.quantity,
          'Precio Unitario': `$${item.unitPrice.toLocaleString()}`,
          'Total del Item': `$${item.total.toLocaleString()}`,
          'Fecha de Orden': new Date(order.createdAt).toLocaleDateString('es-AR'),
        });
      });
    });

    const itemsSheet = XLSX.utils.json_to_sheet(itemsDetail);
    XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Detalle de Items');

    // Hoja 3: Estadísticas
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalPoints = orders.reduce((sum, order) => sum + order.totalPoints, 0);
    const uniqueClients = new Set(orders.map(order => order.clientDni)).size;
    const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0);

    const statsData = [
      { 'Métrica': 'Total de Órdenes', 'Valor': orders.length },
      { 'Métrica': 'Total de Items', 'Valor': totalItems },
      { 'Métrica': 'Monto Total', 'Valor': `$${totalAmount.toLocaleString()}` },
      { 'Métrica': 'Puntos Totales Otorgados', 'Valor': totalPoints.toLocaleString() },
      { 'Métrica': 'Clientes Únicos', 'Valor': uniqueClients },
      { 'Métrica': 'Fecha de Backup', 'Valor': new Date().toLocaleDateString('es-AR') },
      { 'Métrica': 'Hora de Backup', 'Valor': new Date().toLocaleTimeString('es-AR') },
    ];

    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estadísticas');

    // Generar archivo Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Eliminar todas las órdenes y sus items (cascade)
    await prisma.order.deleteMany({});

    // Crear respuesta con archivo Excel
    const response = new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="backup-ordenes-${new Date().toISOString().split('T')[0]}.xlsx"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

    return response;
  } catch (error) {
    console.error("Error en backup de órdenes:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
