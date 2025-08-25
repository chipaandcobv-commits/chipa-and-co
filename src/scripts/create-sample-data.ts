import { PrismaClient } from "../generated/prisma";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function createSampleData() {
  try {
    console.log("🔄 Creando datos de prueba...");

    // 1. Crear usuario administrador
    console.log("📝 Creando usuario administrador...");
    const adminPassword = await hashPassword("admin123");
    
    const admin = await prisma.user.upsert({
      where: { email: "admin@chipa.com" },
      update: {},
      create: {
        name: "Administrador Chipa&Co",
        email: "admin@chipa.com",
        dni: "99999999",
        password: adminPassword,
        puntos: 0,
        puntosHistoricos: 0,
        role: "ADMIN",
      },
    });

    console.log("✅ Administrador creado:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Contraseña: admin123`);
    console.log(`   Nombre: ${admin.name}`);

    // 2. Crear usuario cliente de prueba
    console.log("📝 Creando usuario cliente...");
    const clientPassword = await hashPassword("cliente123");
    
    const client = await prisma.user.upsert({
      where: { email: "cliente@test.com" },
      update: {},
      create: {
        name: "Cliente de Prueba",
        email: "cliente@test.com",
        dni: "12345678",
        password: clientPassword,
        puntos: 2500,
        puntosHistoricos: 3500,
        role: "USER",
      },
    });

    console.log("✅ Cliente creado:");
    console.log(`   Email: ${client.email}`);
    console.log(`   Contraseña: cliente123`);
    console.log(`   Nombre: ${client.name}`);
    console.log(`   Puntos: ${client.puntos}`);

    // 3. Crear premios de prueba
    console.log("🎁 Creando premios de prueba...");
    
    const rewards = [
      {
        name: "Chipa Clásica",
        description: "Deliciosa chipa tradicional recién horneada",
        pointsCost: 100,
        stock: 50,
        imageUrl: null,
      },
      {
        name: "Chipa con Queso",
        description: "Chipa especial con queso derretido por dentro",
        pointsCost: 150,
        stock: 30,
        imageUrl: null,
      },
      {
        name: "Chipa Rellena",
        description: "Chipa rellena con jamón y queso",
        pointsCost: 200,
        stock: 25,
        imageUrl: null,
      },
      {
        name: "Chipa Gigante",
        description: "Chipa extra grande para compartir",
        pointsCost: 300,
        stock: 20,
        imageUrl: null,
      },
      {
        name: "Combo Familiar",
        description: "Pack de 6 chipas + bebida",
        pointsCost: 500,
        stock: 15,
        imageUrl: null,
      },
      {
        name: "Descuento 20%",
        description: "Descuento del 20% en tu próxima compra",
        pointsCost: 800,
        stock: 10,
        imageUrl: null,
      },
      {
        name: "Descuento 50%",
        description: "Descuento del 50% en tu próxima compra",
        pointsCost: 1500,
        stock: 5,
        imageUrl: null,
      },
      {
        name: "Comida Gratis",
        description: "¡Una comida completamente gratis!",
        pointsCost: 2000,
        stock: 3,
        imageUrl: null,
      },
    ];

    for (const rewardData of rewards) {
      const reward = await prisma.reward.create({
        data: rewardData,
      });
      console.log(`   ✅ ${reward.name} - ${reward.pointsCost} pts`);
    }

    // 4. Crear productos de prueba
    console.log("🛍️ Creando productos de prueba...");
    
    const products = [
      {
        name: "Chipa Clásica",
        price: 500,
        description: "Chipa tradicional de almidón de mandioca",
      },
      {
        name: "Chipa con Queso",
        price: 700,
        description: "Chipa con queso derretido",
      },
      {
        name: "Chipa Rellena",
        price: 900,
        description: "Chipa rellena con jamón y queso",
      },
      {
        name: "Chipa Gigante",
        price: 1200,
        description: "Chipa extra grande",
      },
      {
        name: "Coca Cola",
        price: 300,
        description: "Bebida gaseosa 500ml",
      },
      {
        name: "Agua Mineral",
        price: 200,
        description: "Agua mineral 500ml",
      },
    ];

    for (const productData of products) {
      const product = await prisma.product.create({
        data: productData,
      });
      console.log(`   ✅ ${product.name} - $${product.price}`);
    }

    // 5. Crear algunas órdenes de ejemplo
    console.log("📦 Creando órdenes de ejemplo...");
    
    const orders = [
      {
        totalAmount: 1200,
        totalPoints: 120,
        clientDni: client.dni,
        items: [
          { productName: "Chipa Gigante", quantity: 1, unitPrice: 1200, total: 1200 },
        ],
      },
      {
        totalAmount: 800,
        totalPoints: 80,
        clientDni: client.dni,
        items: [
          { productName: "Chipa con Queso", quantity: 1, unitPrice: 700, total: 700 },
          { productName: "Coca Cola", quantity: 1, unitPrice: 300, total: 300 },
        ],
      },
    ];

    for (const orderData of orders) {
      const order = await prisma.order.create({
        data: {
          totalAmount: orderData.totalAmount,
          totalPoints: orderData.totalPoints,
          clientDni: orderData.clientDni,
        },
      });

      // Crear items de la orden
      for (const itemData of orderData.items) {
        const product = await prisma.product.findFirst({
          where: { name: itemData.productName },
        });
        
        if (product) {
          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: product.id,
              quantity: itemData.quantity,
              unitPrice: itemData.unitPrice,
              total: itemData.total,
            },
          });
        }
      }
      
      console.log(`   ✅ Orden #${order.id.slice(-6)} - $${order.totalAmount} - ${order.totalPoints} pts`);
    }

    console.log("\n🎉 Datos de prueba creados exitosamente!");
    console.log("\n📋 CREDENCIALES DE ACCESO:");
    console.log("=" * 50);
    console.log("👨‍💼 ADMINISTRADOR:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Contraseña: admin123`);
    console.log(`   URL: http://localhost:3001/admin`);
    console.log("");
    console.log("👤 CLIENTE:");
    console.log(`   Email: ${client.email}`);
    console.log(`   Contraseña: cliente123`);
    console.log(`   URL: http://localhost:3001/cliente`);
    console.log(`   Puntos disponibles: ${client.puntos}`);
    console.log("");
    console.log("🎁 PREMIOS DISPONIBLES:");
    rewards.forEach((reward, index) => {
      console.log(`   ${index + 1}. ${reward.name} - ${reward.pointsCost} pts`);
    });

  } catch (error) {
    console.error("❌ Error creando datos de prueba:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createSampleData()
    .then(() => {
      console.log("\n🚀 ¡Sistema listo para usar!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal:", error);
      process.exit(1);
    });
}

export { createSampleData };
