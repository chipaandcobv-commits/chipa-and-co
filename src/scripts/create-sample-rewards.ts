import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function createSampleRewards() {
  try {
    console.log("Creando premios de prueba...");

    const sampleRewards = [
      {
        name: "Café Gratis",
        description: "Un delicioso café de la casa",
        pointsCost: 50,
        stock: null, // Ilimitado
        imageUrl: null,
        isActive: true,
      },
      {
        name: "Descuento 10%",
        description: "10% de descuento en tu próxima compra",
        pointsCost: 100,
        stock: 10,
        imageUrl: null,
        isActive: true,
      },
      {
        name: "Chipa Grande",
        description: "Un chipa grande recién horneado",
        pointsCost: 25,
        stock: 20,
        imageUrl: null,
        isActive: true,
      },
      {
        name: "Descuento 20%",
        description: "20% de descuento en tu próxima compra",
        pointsCost: 200,
        stock: 5,
        imageUrl: null,
        isActive: true,
      },
    ];

    for (const rewardData of sampleRewards) {
      const existingReward = await prisma.reward.findFirst({
        where: { name: rewardData.name },
      });

      if (!existingReward) {
        const reward = await prisma.reward.create({
          data: rewardData,
        });
        console.log(`✅ Premio creado: ${reward.name}`);
      } else {
        console.log(`⚠️ Premio ya existe: ${rewardData.name}`);
      }
    }

    console.log("🎉 Premios de prueba creados exitosamente!");
  } catch (error) {
    console.error("Error creando premios:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleRewards();
