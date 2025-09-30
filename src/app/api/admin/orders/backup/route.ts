import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { PrismaClient } from "@/generated/prisma";
import ExcelJS from "exceljs";

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
        createdAt: "desc",
      },
    });

    // Obtener premios canjeados (excepto los pendientes)
    const rewardClaims = await prisma.rewardClaim.findMany({
      where: {
        status: {
          not: "PENDING", // Excluir premios pendientes
        },
      },
      include: {
        reward: true,
        user: {
          select: {
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

    if (orders.length === 0 && rewardClaims.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No hay órdenes ni premios canjeados para hacer backup",
      });
    }

    // Preparar datos para Excel - Órdenes
    const backupData = orders.map((order) => ({
      orderId: order.id,
      clientName: order.client.name,
      clientEmail: order.client.email,
      clientDni: order.client.dni,
      totalAmount: order.totalAmount,
      totalPoints: order.totalPoints,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    }));

    // Preparar datos para Excel - Premios Canjeados
    const rewardClaimsData = rewardClaims.map((claim) => ({
      claimId: claim.id,
      clientName: claim.user.name,
      clientEmail: claim.user.email,
      clientDni: claim.user.dni,
      rewardName: claim.reward.name,
      pointsSpent: claim.pointsSpent,
      status: claim.status,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
      expiresAt: claim.expiresAt,
    }));

    // Crear workbook de Excel
    const workbook = new ExcelJS.Workbook();

    // Hoja 1: Resumen de Órdenes (solo si hay órdenes)
    if (orders.length > 0) {
      const ordersSummary = backupData.map((order) => ({
        "ID de Orden": order.orderId,
        "Nombre del Cliente": order.clientName,
        "Email del Cliente": order.clientEmail,
        "DNI del Cliente": order.clientDni,
        "Monto Total": `$${order.totalAmount.toLocaleString()}`,
        "Puntos Otorgados": order.totalPoints.toLocaleString(),
        "Fecha de Creación": new Date(order.createdAt).toLocaleDateString(
          "es-AR"
        ),
        "Hora de Creación": new Date(order.createdAt).toLocaleTimeString(
          "es-AR"
        ),
      }));

      const ordersSheet = workbook.addWorksheet("Resumen de Órdenes");
      ordersSheet.columns = [
        { header: "ID de Orden", key: "ID de Orden", width: 15 },
        { header: "Nombre del Cliente", key: "Nombre del Cliente", width: 25 },
        { header: "Email del Cliente", key: "Email del Cliente", width: 30 },
        { header: "DNI del Cliente", key: "DNI del Cliente", width: 15 },
        { header: "Monto Total", key: "Monto Total", width: 15 },
        { header: "Puntos Otorgados", key: "Puntos Otorgados", width: 15 },
        { header: "Fecha de Creación", key: "Fecha de Creación", width: 15 },
        { header: "Hora de Creación", key: "Hora de Creación", width: 15 },
      ];
      ordersSheet.addRows(ordersSummary);
    }

    // Hoja 2: Detalle de Items (solo si hay órdenes)
    if (orders.length > 0) {
      const itemsDetail: Array<{
        "ID de Orden": string;
        Cliente: string;
        DNI: string;
        Producto: string;
        Cantidad: number;
        "Precio Unitario": string;
        "Total del Item": string;
        "Fecha de Orden": string;
      }> = [];

      backupData.forEach((order) => {
        order.items.forEach((item) => {
          itemsDetail.push({
            "ID de Orden": order.orderId,
            Cliente: order.clientName,
            DNI: order.clientDni || "N/A",
            Producto: item.productName,
            Cantidad: item.quantity,
            "Precio Unitario": `$${item.unitPrice.toLocaleString()}`,
            "Total del Item": `$${item.total.toLocaleString()}`,
            "Fecha de Orden": new Date(order.createdAt).toLocaleDateString(
              "es-AR"
            ),
          });
        });
      });

      const itemsSheet = workbook.addWorksheet("Detalle de Items");
      itemsSheet.columns = [
        { header: "ID de Orden", key: "ID de Orden", width: 15 },
        { header: "Cliente", key: "Cliente", width: 25 },
        { header: "DNI", key: "DNI", width: 15 },
        { header: "Producto", key: "Producto", width: 30 },
        { header: "Cantidad", key: "Cantidad", width: 10 },
        { header: "Precio Unitario", key: "Precio Unitario", width: 15 },
        { header: "Total del Item", key: "Total del Item", width: 15 },
        { header: "Fecha de Orden", key: "Fecha de Orden", width: 15 },
      ];
      itemsSheet.addRows(itemsDetail);
    }

    // Hoja 3: Premios Canjeados (solo si hay premios canjeados)
    if (rewardClaims.length > 0) {
      const rewardsSummary = rewardClaimsData.map((claim) => ({
        "ID de Canje": claim.claimId,
        "Nombre del Cliente": claim.clientName,
        "Email del Cliente": claim.clientEmail,
        "DNI del Cliente": claim.clientDni,
        "Nombre del Premio": claim.rewardName,
        "Puntos Gastados": claim.pointsSpent.toLocaleString(),
        Estado: claim.status,
        "Fecha de Canje": new Date(claim.createdAt).toLocaleDateString("es-AR"),
        "Hora de Canje": new Date(claim.createdAt).toLocaleTimeString("es-AR"),
        "Fecha de Actualización": new Date(claim.updatedAt).toLocaleDateString(
          "es-AR"
        ),
        "Fecha de Vencimiento": new Date(claim.expiresAt).toLocaleDateString(
          "es-AR"
        ),
      }));

      const rewardsSheet = workbook.addWorksheet("Premios Canjeados");
      rewardsSheet.columns = [
        { header: "ID de Canje", key: "ID de Canje", width: 15 },
        { header: "Nombre del Cliente", key: "Nombre del Cliente", width: 25 },
        { header: "Email del Cliente", key: "Email del Cliente", width: 30 },
        { header: "DNI del Cliente", key: "DNI del Cliente", width: 15 },
        { header: "Nombre del Premio", key: "Nombre del Premio", width: 30 },
        { header: "Puntos Gastados", key: "Puntos Gastados", width: 15 },
        { header: "Estado", key: "Estado", width: 15 },
        { header: "Fecha de Canje", key: "Fecha de Canje", width: 15 },
        { header: "Hora de Canje", key: "Hora de Canje", width: 15 },
        {
          header: "Fecha de Actualización",
          key: "Fecha de Actualización",
          width: 20,
        },
        {
          header: "Fecha de Vencimiento",
          key: "Fecha de Vencimiento",
          width: 20,
        },
      ];
      rewardsSheet.addRows(rewardsSummary);
    }

    // Hoja 4: Estadísticas
    const totalAmount = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const totalPoints = orders.reduce(
      (sum, order) => sum + order.totalPoints,
      0
    );
    const uniqueClients = new Set(orders.map((order) => order.clientDni)).size;
    const totalItems = orders.reduce(
      (sum, order) => sum + order.items.length,
      0
    );

    // Estadísticas de premios canjeados
    const totalRewardClaims = rewardClaims.length;
    const totalPointsSpent = rewardClaims.reduce(
      (sum, claim) => sum + claim.pointsSpent,
      0
    );
    const approvedClaims = rewardClaims.filter(
      (claim) => claim.status === "APPROVED"
    ).length;
    const rejectedClaims = rewardClaims.filter(
      (claim) => claim.status === "REJECTED"
    ).length;
    const expiredClaims = rewardClaims.filter(
      (claim) => claim.status === "EXPIRED"
    ).length;
    const uniqueRewardClients = new Set(
      rewardClaims.map((claim) => claim.user.dni)
    ).size;

    const statsData = [
      // Estadísticas de órdenes
      { Métrica: "Total de Órdenes", Valor: orders.length },
      { Métrica: "Total de Items", Valor: totalItems },
      { Métrica: "Monto Total", Valor: `$${totalAmount.toLocaleString()}` },
      {
        Métrica: "Puntos Totales Otorgados",
        Valor: totalPoints.toLocaleString(),
      },
      { Métrica: "Clientes Únicos (Órdenes)", Valor: uniqueClients },

      // Estadísticas de premios
      { Métrica: "Total de Premios Canjeados", Valor: totalRewardClaims },
      {
        Métrica: "Puntos Totales Gastados",
        Valor: totalPointsSpent.toLocaleString(),
      },
      { Métrica: "Premios Aprobados", Valor: approvedClaims },
      { Métrica: "Premios Rechazados", Valor: rejectedClaims },
      { Métrica: "Premios Vencidos", Valor: expiredClaims },
      { Métrica: "Clientes Únicos (Premios)", Valor: uniqueRewardClients },

      // Información del backup
      {
        Métrica: "Fecha de Backup",
        Valor: new Date().toLocaleDateString("es-AR"),
      },
      {
        Métrica: "Hora de Backup",
        Valor: new Date().toLocaleTimeString("es-AR"),
      },
    ];

    const statsSheet = workbook.addWorksheet("Estadísticas");
    statsSheet.columns = [
      { header: "Métrica", key: "Métrica", width: 30 },
      { header: "Valor", key: "Valor", width: 20 },
    ];
    statsSheet.addRows(statsData);

    // Generar archivo Excel
    const excelBuffer = await workbook.xlsx.writeBuffer();

    // Eliminar todas las órdenes y sus items (cascade)
    await prisma.order.deleteMany({});

    // Eliminar premios canjeados (excepto los pendientes)
    if (rewardClaims.length > 0) {
      await prisma.rewardClaim.deleteMany({
        where: {
          status: {
            not: "PENDING", // Excluir premios pendientes
          },
        },
      });
    }

    // Crear respuesta con archivo Excel
    const response = new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="backup-completo-${
          new Date().toISOString().split("T")[0]
        }.xlsx"`,
        "Content-Length": excelBuffer.byteLength.toString(),
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
