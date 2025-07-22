import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { requireAdmin } from "../../../../lib/admin";

const prisma = new PrismaClient();

// GET - Obtener configuración del sistema
export async function GET() {
  try {
    await requireAdmin();

    const configs = await prisma.systemConfig.findMany();

    // Configuración por defecto si no existe
    const defaultConfigs = {
      pointsPerPeso: "0.001", // 1000 pesos = 1 punto
      systemName: "Sistema de Fidelización",
      welcomeMessage: "¡Bienvenido! Escanea códigos QR para ganar puntos.",
    };

    const configMap: Record<string, string> = {};
    configs.forEach((config) => {
      configMap[config.key] = config.value;
    });

    // Agregar configuraciones por defecto si no existen
    for (const [key, value] of Object.entries(defaultConfigs)) {
      if (!configMap[key]) {
        configMap[key] = value;
      }
    }

    return NextResponse.json({
      success: true,
      config: configMap,
    });
  } catch (error: any) {
    console.error("Get config error:", error);
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

// PUT - Actualizar configuración del sistema
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const data = await request.json();
    const { configs } = data;

    if (!configs || typeof configs !== "object") {
      return NextResponse.json(
        { success: false, error: "Configuraciones requeridas" },
        { status: 400 }
      );
    }

    // Validaciones específicas
    if (configs.pointsPerPeso) {
      const pointsPerPeso = parseFloat(configs.pointsPerPeso);
      if (isNaN(pointsPerPeso) || pointsPerPeso <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: "La equivalencia de puntos debe ser un número mayor a 0",
          },
          { status: 400 }
        );
      }
    }

    // Actualizar o crear configuraciones
    const updatedConfigs = [];
    for (const [key, value] of Object.entries(configs)) {
      const config = await prisma.systemConfig.upsert({
        where: { key },
        update: {
          value: String(value),
          updatedAt: new Date(),
        },
        create: {
          key,
          value: String(value),
          description: getConfigDescription(key),
        },
      });
      updatedConfigs.push(config);
    }

    return NextResponse.json({
      success: true,
      configs: updatedConfigs,
      message: "Configuración actualizada exitosamente",
    });
  } catch (error: any) {
    console.error("Update config error:", error);
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

function getConfigDescription(key: string): string {
  const descriptions: Record<string, string> = {
    pointsPerPeso: "Cantidad de puntos que se otorgan por cada peso gastado",
    systemName: "Nombre del sistema de fidelización",
    welcomeMessage: "Mensaje de bienvenida para usuarios",
  };
  return descriptions[key] || "Configuración del sistema";
}
