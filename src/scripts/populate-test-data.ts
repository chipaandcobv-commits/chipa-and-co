import { PrismaClient } from "../generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// Datos de productos realistas
const products = [
  { name: "Café Americano", price: 1200, description: "Café negro tradicional" },
  { name: "Café Latte", price: 1500, description: "Café con leche espumada" },
  { name: "Cappuccino", price: 1400, description: "Café con leche y espuma" },
  { name: "Mocha", price: 1600, description: "Café con chocolate y leche" },
  { name: "Espresso", price: 800, description: "Café concentrado" },
  { name: "Café con Leche", price: 1300, description: "Café con leche caliente" },
  { name: "Té Verde", price: 900, description: "Té verde natural" },
  { name: "Té Negro", price: 900, description: "Té negro clásico" },
  { name: "Chocolate Caliente", price: 1400, description: "Chocolate con leche" },
  { name: "Jugo de Naranja", price: 1100, description: "Jugo natural de naranja" },
  { name: "Agua Mineral", price: 500, description: "Agua mineral 500ml" },
  { name: "Sándwich de Jamón y Queso", price: 1800, description: "Sándwich fresco" },
  { name: "Croissant", price: 1200, description: "Croissant de mantequilla" },
  { name: "Torta de Chocolate", price: 1600, description: "Torta casera" },
  { name: "Galletas", price: 800, description: "Galletas caseras x6" },
  { name: "Ensalada César", price: 2200, description: "Ensalada fresca" },
  { name: "Pizza Margherita", price: 2800, description: "Pizza italiana" },
  { name: "Hamburguesa Clásica", price: 2500, description: "Hamburguesa con papas" },
  { name: "Pasta Carbonara", price: 2400, description: "Pasta con salsa cremosa" },
  { name: "Sopa del Día", price: 1600, description: "Sopa casera" }
];

// Datos de premios realistas
const rewards = [
  { name: "Café Gratis", description: "Un café de tu elección gratis", pointsCost: 100, stock: 50 },
  { name: "Descuento 20%", description: "20% de descuento en tu próxima compra", pointsCost: 200, stock: 30 },
  { name: "Postre Gratis", description: "Un postre de tu elección gratis", pointsCost: 150, stock: 40 },
  { name: "Descuento 50%", description: "50% de descuento en tu próxima compra", pointsCost: 500, stock: 20 },
  { name: "Comida Completa", description: "Una comida completa gratis", pointsCost: 800, stock: 15 },
  { name: "Bebida Gratis", description: "Una bebida de tu elección gratis", pointsCost: 80, stock: 60 },
  { name: "Descuento 30%", description: "30% de descuento en tu próxima compra", pointsCost: 300, stock: 25 },
  { name: "Snack Gratis", description: "Un snack de tu elección gratis", pointsCost: 120, stock: 45 }
];

// Generar nombres realistas
const firstNames = [
  "María", "José", "Ana", "Carlos", "Laura", "Miguel", "Carmen", "Luis", "Isabel", "Roberto",
  "Patricia", "Fernando", "Lucía", "Diego", "Sofía", "Alejandro", "Valentina", "Andrés", "Camila", "Javier",
  "Daniela", "Ricardo", "Gabriela", "Manuel", "Natalia", "Francisco", "Mariana", "David", "Paula", "Juan",
  "Carolina", "Pedro", "Adriana", "Santiago", "Verónica", "Eduardo", "Claudia", "Héctor", "Elena", "Raúl",
  "Monica", "Alberto", "Rosa", "Eduardo", "Teresa", "Guillermo", "Silvia", "Mario", "Graciela", "Oscar"
];

const lastNames = [
  "García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Pérez", "Gómez", "Martín", "Jiménez",
  "Ruiz", "Hernández", "Díaz", "Moreno", "Muñoz", "Álvarez", "Romero", "Alonso", "Gutiérrez", "Navarro",
  "Torres", "Domínguez", "Vázquez", "Ramos", "Gil", "Ramírez", "Serrano", "Blanco", "Suárez", "Molina",
  "Morales", "Ortega", "Delgado", "Castro", "Ortiz", "Rubio", "Marín", "Sanz", "Iglesias", "Medina",
  "Cortés", "Castillo", "Garrido", "Cruz", "Reyes", "Flores", "Herrera", "Peña", "León", "Vidal"
];

// Generar DNIs únicos
function generateDNI(): string {
  const numbers = Math.floor(Math.random() * 90000000) + 10000000;
  return numbers.toString();
}

// Generar email basado en nombre
function generateEmail(firstName: string, lastName: string): string {
  const domains = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const randomNum = Math.floor(Math.random() * 1000);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@${domain}`;
}

// Generar fecha aleatoria en el último mes
function generateRandomDate(): Date {
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const randomTime = oneMonthAgo.getTime() + Math.random() * (now.getTime() - oneMonthAgo.getTime());
  return new Date(randomTime);
}

// Generar fecha de expiración para premios (24 horas después)
function generateExpirationDate(claimDate: Date): Date {
  return new Date(claimDate.getTime() + 24 * 60 * 60 * 1000);
}

async function populateTestData() {
  try {
    console.log("🚀 Iniciando población de datos de prueba...");
    
    // Limpiar datos existentes (COMENTADO para preservar datos existentes)
    // console.log("🧹 Limpiando datos existentes...");
    // await prisma.rewardClaim.deleteMany();
    // await prisma.orderItem.deleteMany();
    // await prisma.order.deleteMany();
    // await prisma.user.deleteMany();
    // await prisma.product.deleteMany();
    // await prisma.reward.deleteMany();
    
    // console.log("✅ Datos existentes eliminados");
    console.log("💾 Preservando datos existentes...");
    
    // Verificar si ya existen productos y premios
    const existingProducts = await prisma.product.count();
    const existingRewards = await prisma.reward.count();
    const existingUsers = await prisma.user.count();
    
    console.log(`📊 Estado actual de la base de datos:`);
    console.log(`   📦 Productos existentes: ${existingProducts}`);
    console.log(`   🎁 Premios existentes: ${existingRewards}`);
    console.log(`   👥 Usuarios existentes: ${existingUsers}`);
    
    // Solo crear productos si no existen
    let createdProducts = [];
    if (existingProducts === 0) {
      console.log("📦 Creando productos...");
      createdProducts = await Promise.all(
        products.map(product => 
          prisma.product.create({
            data: {
              name: product.name,
              price: product.price,
              description: product.description,
              isActive: true
            }
          })
        )
      );
      console.log(`✅ ${createdProducts.length} productos creados`);
    } else {
      console.log("📦 Productos ya existen, saltando creación...");
      createdProducts = await prisma.product.findMany();
    }
    
    // Solo crear premios si no existen
    let createdRewards = [];
    if (existingRewards === 0) {
      console.log("🎁 Creando premios...");
      createdRewards = await Promise.all(
        rewards.map(reward => 
          prisma.reward.create({
            data: {
              name: reward.name,
              description: reward.description,
              pointsCost: reward.pointsCost,
              stock: reward.stock,
              isActive: true
            }
          })
        )
      );
      console.log(`✅ ${createdRewards.length} premios creados`);
    } else {
      console.log("🎁 Premios ya existen, saltando creación...");
      createdRewards = await prisma.reward.findMany();
    }
    
    // Solo crear usuarios si no hay suficientes (mínimo 100 para testing)
    let users = [];
    if (existingUsers < 100) {
      const usersToCreate = 1500 - existingUsers;
      console.log(`👥 Creando ${usersToCreate} usuarios adicionales...`);
      
      for (let i = 0; i < usersToCreate; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const dni = generateDNI();
        const email = generateEmail(firstName, lastName);
        const password = await hash("123456", 10); // Contraseña por defecto
        
        const user = await prisma.user.create({
          data: {
            name: `${firstName} ${lastName}`,
            email,
            dni,
            password,
            puntos: Math.floor(Math.random() * 500) + 50, // 50-550 puntos iniciales
            role: "USER"
          }
        });
        
        users.push(user);
        
        if ((i + 1) % 100 === 0) {
          console.log(`👥 ${i + 1}/${usersToCreate} usuarios creados`);
        }
      }
      console.log(`✅ ${users.length} usuarios adicionales creados`);
    } else {
      console.log("👥 Usuarios suficientes existentes, saltando creación...");
      users = await prisma.user.findMany({
        where: { role: "USER" } // Solo usuarios normales, no admins
      });
    }
    
    // Solo crear órdenes si no hay suficientes
    const existingOrders = await prisma.order.count();
    let orders = [];
    if (existingOrders < 100) {
      console.log("🛒 Creando órdenes...");
      const ordersToCreate = Math.min(1500, users.length);
      
      for (let i = 0; i < ordersToCreate; i++) {
        const user = users[i];
        const orderDate = generateRandomDate();
        
        // Generar 1-3 items por orden
        const numItems = Math.floor(Math.random() * 3) + 1;
        const orderItems = [];
        let totalAmount = 0;
        let totalPoints = 0;
        
        for (let j = 0; j < numItems; j++) {
          const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          const unitPrice = product.price;
          const total = unitPrice * quantity;
          
          orderItems.push({
            productId: product.id,
            quantity,
            unitPrice,
            total
          });
          
          totalAmount += total;
          totalPoints += Math.floor(total / 100); // 1 punto por cada $100
        }
        
        const order = await prisma.order.create({
          data: {
            totalAmount,
            totalPoints,
            clientDni: user.dni!,
            createdAt: orderDate,
            items: {
              create: orderItems
            }
          }
        });
        
        orders.push(order);
        
        if ((i + 1) % 100 === 0) {
          console.log(`🛒 ${i + 1}/${ordersToCreate} órdenes creadas`);
        }
      }
      console.log(`✅ ${orders.length} órdenes creadas`);
    } else {
      console.log("🛒 Órdenes suficientes existentes, saltando creación...");
      orders = await prisma.order.findMany();
    }
    
    // Solo crear reclamos de premios si no hay suficientes
    const existingClaims = await prisma.rewardClaim.count();
    let rewardClaims = [];
    if (existingClaims < 50) {
      console.log("🎯 Creando reclamos de premios...");
      const usersWithClaims = users.filter(() => Math.random() < 0.3); // 30% de usuarios
      
      for (let i = 0; i < usersWithClaims.length; i++) {
        const user = usersWithClaims[i];
        const reward = createdRewards[Math.floor(Math.random() * createdRewards.length)];
        const claimDate = generateRandomDate();
        const expirationDate = generateExpirationDate(claimDate);
        
        // Determinar estado basado en la fecha
        let status = "PENDING";
        const now = new Date();
        
        if (expirationDate < now) {
          // Si ya expiró, determinar si se eliminó o sigue como vencido
          const hoursSinceExpiration = (now.getTime() - expirationDate.getTime()) / (1000 * 60 * 60);
          if (hoursSinceExpiration > 48) {
            status = "DELETED"; // Se habría eliminado automáticamente
          } else {
            status = "EXPIRED";
          }
        }
        
        // Solo crear reclamos que no estén eliminados
        if (status !== "DELETED") {
          const claim = await prisma.rewardClaim.create({
            data: {
              userId: user.id,
              rewardId: reward.id,
              status,
              expiresAt: expirationDate,
              pointsSpent: reward.pointsCost
            }
          });
          
          rewardClaims.push(claim);
        }
        
        if ((i + 1) % 50 === 0) {
          console.log(`🎯 ${i + 1}/${usersWithClaims.length} reclamos procesados`);
        }
      }
      console.log(`✅ ${rewardClaims.length} reclamos de premios creados`);
    } else {
      console.log("🎯 Reclamos suficientes existentes, saltando creación...");
      rewardClaims = await prisma.rewardClaim.findMany();
    }
    
    // Actualizar puntos históricos solo para usuarios nuevos
    if (orders.length > 0) {
      console.log("📊 Actualizando puntos históricos...");
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const userOrders = orders.filter(order => order.clientDni === user.dni!);
        const totalPointsEarned = userOrders.reduce((sum, order) => sum + order.totalPoints, 0);
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            puntosHistoricos: totalPointsEarned
          }
        });
        
        if ((i + 1) % 100 === 0) {
          console.log(`📊 ${i + 1}/${users.length} usuarios actualizados`);
        }
      }
    }
    
    // NO crear usuario admin (comentado)
    // const adminExists = await prisma.user.findFirst({
    //   where: { role: "ADMIN" }
    // });
    
    // if (!adminExists) {
    //   const adminPassword = await hash("admin123", 10);
    //   await prisma.user.create({
    //     data: {
    //       name: "Administrador",
    //       email: "admin@cafe.com",
    //       dni: "00000000",
    //       password: adminPassword,
    //       puntos: 0,
    //       role: "ADMIN"
    //     }
    //   });
    //   console.log("👑 Usuario administrador creado (admin@cafe.com / admin123)");
    // }
    
    console.log("\n🎉 ¡Población de datos completada exitosamente!");
    console.log("\n📊 Resumen de datos creados:");
    console.log(`   👥 Usuarios totales: ${users.length}`);
    console.log(`   🛒 Órdenes totales: ${orders.length}`);
    console.log(`   📦 Productos totales: ${createdProducts.length}`);
    console.log(`   🎁 Premios totales: ${createdRewards.length}`);
    console.log(`   🎯 Reclamos de Premios totales: ${rewardClaims.length}`);
    console.log("\n🔑 Credenciales de acceso:");
    console.log("   👤 Usuario normal: cualquier email generado / 123456");
    console.log("   💡 NOTA: No se crearon usuarios administradores");
    console.log("\n💡 Los datos simulan un mes de uso real con:");
    console.log("   • Usuarios adicionales creados según necesidad");
    console.log("   • Órdenes y premios distribuidos en el último mes");
    console.log("   • Estados de premios realistas (pendientes, vencidos, etc.)");
    console.log("   • Datos existentes preservados");
    
  } catch (error) {
    console.error("❌ Error durante la población de datos:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  populateTestData()
    .then(() => {
      console.log("\n🎯 Script completado exitosamente");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Error fatal:", error);
      process.exit(1);
    });
}

export { populateTestData };
