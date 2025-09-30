import { PrismaClient } from "../generated/prisma";
import * as readline from "readline";

const prisma = new PrismaClient();

// Configuraciones iniciales del sistema
const initialConfigs = [
  {
    key: "welcomeMessage",
    value: "¡Bienvenido a Chipa&Co! Presenta tu DNI para ganar puntos.",
    description: "Mensaje de bienvenida para usuarios",
  },
  {
    key: "pointsPerPeso",
    value: "1",
    description:
      "Cantidad de puntos que se otorgan por cada peso gastado (1 = 1 peso = 1 punto)",
  },
  {
    key: "pointsLimit",
    value: "150000",
    description:
      "Límite máximo de puntos que puede acumular un usuario antes de mostrar advertencia",
  },
  {
    key: "systemName",
    value: "Chipa&Co",
    description: "Nombre del sistema de fidelización",
  },
  {
    key: "configSecurityKey",
    value: "1212",
    description:
      "Clave de seguridad de 4 números para acceder al apartado de configuración (solo modificable desde base de datos)",
  },
];

async function initSystemConfig() {
  try {
    console.log("🔧 === INICIALIZACIÓN DE CONFIGURACIONES DEL SISTEMA ===\n");

    // Verificar configuraciones existentes
    const existingConfigs = await prisma.systemConfig.findMany();
    console.log(`📊 Configuraciones existentes: ${existingConfigs.length}`);

    if (existingConfigs.length > 0) {
      console.log("⚠️  Ya existen configuraciones en el sistema:");
      existingConfigs.forEach((config) => {
        console.log(`   - ${config.key}: ${config.value}`);
      });

      const overwrite = await askQuestion(
        "\n¿Deseas actualizar las configuraciones existentes? (s/N): "
      );
      if (overwrite.toLowerCase() !== "s" && overwrite.toLowerCase() !== "si") {
        console.log("❌ Operación cancelada.");
        return;
      }
    }

    console.log("\n📝 Inicializando configuraciones del sistema...\n");

    let createdCount = 0;
    let updatedCount = 0;

    for (const config of initialConfigs) {
      try {
        const existing = await prisma.systemConfig.findUnique({
          where: { key: config.key },
        });

        if (existing) {
          await prisma.systemConfig.update({
            where: { key: config.key },
            data: {
              value: config.value,
              description: config.description,
              updatedAt: new Date(),
            },
          });
          updatedCount++;
          console.log(`🔄 Actualizado: ${config.key} = ${config.value}`);
        } else {
          await prisma.systemConfig.create({
            data: config,
          });
          createdCount++;
          console.log(`✅ Creado: ${config.key} = ${config.value}`);
        }
      } catch (error) {
        console.error(`❌ Error con ${config.key}:`, error);
      }
    }

    console.log(
      "\n🎉 ¡Configuraciones del sistema inicializadas exitosamente!"
    );
    console.log(`📊 Resumen:`);
    console.log(`   ✅ Configuraciones creadas: ${createdCount}`);
    console.log(`   🔄 Configuraciones actualizadas: ${updatedCount}`);
    console.log(`   📋 Total procesadas: ${createdCount + updatedCount}`);

    // Mostrar configuraciones establecidas
    console.log("\n🔧 Configuraciones establecidas:");
    for (const config of initialConfigs) {
      console.log(`   ${config.key}: ${config.value}`);
    }

    console.log("\n🎯 Próximos pasos:");
    console.log("   1. Revisa las configuraciones en /admin/config");
    console.log("   2. Ajusta los valores según tu negocio");
    console.log(
      "   3. La clave de seguridad (1212) solo se puede cambiar desde la base de datos"
    );
  } catch (error) {
    console.error("\n❌ Error inicializando configuraciones:", error);
    if (error instanceof Error) {
      console.error("   Detalle:", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Función para leer input del usuario
function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initSystemConfig()
    .then(() => {
      console.log("\n🎯 Script completado exitosamente");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Error fatal:", error);
      process.exit(1);
    });
}

export { initSystemConfig };
