import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function fixGoogleUserRoles() {
  try {
    console.log("🔍 Buscando usuarios de Google con rol incorrecto...");

    // Buscar usuarios de Google que tengan rol ADMIN
    const googleUsers = await prisma.user.findMany({
      where: {
        isGoogleUser: true,
        role: "ADMIN", // Usuarios de Google que están marcados como ADMIN
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isGoogleUser: true,
        createdAt: true,
      },
    });

    console.log(`📊 Encontrados ${googleUsers.length} usuarios de Google con rol ADMIN:`);
    
    if (googleUsers.length === 0) {
      console.log("✅ No hay usuarios de Google con rol incorrecto.");
      return;
    }

    // Mostrar usuarios encontrados
    googleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Rol: ${user.role} - Creado: ${user.createdAt.toISOString()}`);
    });

    console.log("\n🔧 Corrigiendo roles...");

    let fixedCount = 0;
    const fixedUsers = [];

    // Corregir roles de usuarios de Google
    for (const user of googleUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "USER" },
      });
      
      fixedCount++;
      fixedUsers.push({
        email: user.email,
        name: user.name,
        oldRole: user.role,
        newRole: "USER",
      });

      console.log(`✅ Corregido: ${user.name} (${user.email}) - ${user.role} → USER`);
    }

    console.log(`\n🎉 Se corrigieron ${fixedCount} usuarios de Google:`);
    fixedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.oldRole} → ${user.newRole}`);
    });

    console.log("\n✅ Corrección completada exitosamente.");

  } catch (error) {
    console.error("❌ Error corrigiendo roles de usuarios de Google:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
fixGoogleUserRoles();
