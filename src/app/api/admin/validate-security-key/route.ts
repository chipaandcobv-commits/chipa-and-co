import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { requireAdmin } from "../../../../lib/admin";

const prisma = new PrismaClient();

// POST - Validar clave de seguridad
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { securityKey } = await request.json();

    if (!securityKey || typeof securityKey !== 'string') {
      return NextResponse.json(
        { success: false, error: "Clave de seguridad requerida" },
        { status: 400 }
      );
    }

    // Validar que la clave tenga exactamente 4 números
    if (!/^\d{4}$/.test(securityKey)) {
      return NextResponse.json(
        { success: false, error: "La clave debe ser exactamente 4 números" },
        { status: 400 }
      );
    }

    // Obtener la clave de seguridad de la base de datos
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'configSecurityKey' }
    });

    if (!config) {
      return NextResponse.json(
        { success: false, error: "Configuración de seguridad no encontrada" },
        { status: 500 }
      );
    }

    // Validar la clave
    const isValid = securityKey === config.value;

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: "Clave de seguridad válida"
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Clave de seguridad incorrecta" },
        { status: 401 }
      );
    }

  } catch (error: any) {
    console.error("Validate security key error:", error);
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
