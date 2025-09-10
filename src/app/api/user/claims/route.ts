import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserUnified } from "../../../../lib/auth-helper";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserUnified();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const claims = await prisma.rewardClaim.findMany({
      where: {
        userId: currentUser.userId,
      },
      include: {
        reward: {
          select: {
            id: true,
            name: true,
            description: true,
            pointsCost: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      claims,
    });
  } catch (error) {
    console.error("Get user claims error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
