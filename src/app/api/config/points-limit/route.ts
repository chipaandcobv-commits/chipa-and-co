import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

// GET - Obtener límite de puntos configurado
export async function GET() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'pointsLimit' }
    });

    // Valor por defecto si no existe la configuración
    const pointsLimit = config ? parseInt(config.value) : 10000;

    return NextResponse.json({
      success: true,
      pointsLimit,
    });
  } catch (error: any) {
    console.error("Get points limit error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
