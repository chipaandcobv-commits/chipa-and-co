import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Crear usuarios de ejemplo
  const users = [
    {
      name: "Juan Pérez",
      email: "juan.perez@example.com",
    },
    {
      name: "María García",
      email: "maria.garcia@example.com",
    },
    {
      name: "Carlos López",
      email: "carlos.lopez@example.com",
    },
    {
      name: "Ana Martínez",
      email: "ana.martinez@example.com",
    },
    {
      name: "Luis Rodríguez",
      email: "luis.rodriguez@example.com",
    },
    {
      name: "Sofia Hernández",
      email: "sofia.hernandez@example.com",
    },
    {
      name: "Diego Fernández",
      email: "diego.fernandez@example.com",
    },
    {
      name: "Valentina Torres",
      email: "valentina.torres@example.com",
    },
  ];

  // Eliminar usuarios existentes (opcional, para limpiar antes de sembrar)
  await prisma.user.deleteMany();
  console.log("🗑️  Existing users deleted");

  // Crear usuarios
  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData,
    });
    console.log(`✅ Created user: ${user.name} (${user.email})`);
  }

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
