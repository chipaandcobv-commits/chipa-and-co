import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";
import { PrismaClient } from "../../../../generated/prisma";
import { securityLogger, SecurityEventType } from "../../../../lib/securityLogger";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea administrador
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Se requieren permisos de administrador" },
        { status: 403 }
      );
    }

    // Buscar usuarios de Google que tengan rol incorrecto
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
      },
    });

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
    }

    // Log de actividad
    securityLogger.log(
      SecurityEventType.DATA_UPDATED,
      request,
      adminUser.id,
      session.user.email,
      "Fixed Google user roles",
      { fixedCount, fixedUsers }
    );

    return NextResponse.json({
      success: true,
      message: `Se corrigieron ${fixedCount} usuarios de Google`,
      fixedCount,
      fixedUsers,
    });

  } catch (error) {
    console.error("Error fixing user roles:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
