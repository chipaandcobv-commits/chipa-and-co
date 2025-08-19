import { PrismaClient } from "../generated/prisma";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log("🔧 Creando usuario administrador...");

    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      console.log("⚠️  Ya existe un usuario administrador:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nombre: ${existingAdmin.name}`);
      return;
    }

    // Datos del admin (puedes modificar estos valores)
    const adminData = {
      name: "Administrador",
      email: "admin@app-fidelizacion.com",
      dni: "ADMIN001",
      password: "Admin123456", // Cambia esta contraseña
    };

    // Hash de la contraseña
    const hashedPassword = await hashPassword(adminData.password);

    // Crear admin
    const admin = await prisma.user.create({
      data: {
        name: adminData.name,
        email: adminData.email,
        dni: adminData.dni,
        password: hashedPassword,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("✅ Usuario administrador creado exitosamente!");
    console.log("📋 Detalles del administrador:");
    console.log(`   ID: ${admin.id}`);
    console.log(`   Nombre: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   DNI: ${admin.dni}`);
    console.log(`   Contraseña: ${adminData.password}`);
    console.log("");
    console.log("🔐 IMPORTANTE: Cambia la contraseña después del primer login");
    console.log("🌐 Accede al panel de administración en: /admin");
  } catch (error) {
    console.error("❌ Error creando administrador:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  createAdmin();
}

export { createAdmin };
