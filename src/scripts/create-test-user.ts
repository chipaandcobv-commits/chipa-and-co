import { PrismaClient } from "../generated/prisma";
import { hashPassword } from "../lib/auth-server";

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log("🔄 Creando usuario de prueba...");

    // Verificar si ya existe un usuario de prueba
    const existingUser = await prisma.user.findFirst({
      where: {
        email: "cliente@test.com",
      },
    });

    if (existingUser) {
      console.log("✅ Usuario de prueba ya existe:");
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Nombre: ${existingUser.name}`);
      console.log(`   Puntos: ${existingUser.puntos}`);
      console.log(`   Rol: ${existingUser.role}`);
      return existingUser;
    }

    // Crear usuario de prueba
    const hashedPassword = await hashPassword("123456");
    
    const testUser = await prisma.user.create({
      data: {
        name: "Cliente de Prueba",
        email: "cliente@test.com",
        dni: "12345678",
        password: hashedPassword,
        puntos: 1000,
        puntosHistoricos: 1500,
        role: "USER",
      },
    });

    console.log("✅ Usuario de prueba creado exitosamente:");
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Contraseña: 123456`);
    console.log(`   Nombre: ${testUser.name}`);
    console.log(`   Puntos: ${testUser.puntos}`);
    console.log(`   Rol: ${testUser.role}`);

    return testUser;
  } catch (error) {
    console.error("❌ Error creando usuario de prueba:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createTestUser()
    .then(() => {
      console.log("🎉 Script completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal:", error);
      process.exit(1);
    });
}

export { createTestUser };
