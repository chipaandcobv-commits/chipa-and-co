import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../../generated/prisma";
import { hashPassword } from "../../../../../lib/auth-server";
import { securityLogger, SecurityEventType } from "../../../../../lib/securityLogger";
import { requireAdmin } from "../../../../../lib/admin";

const prisma = new PrismaClient();

// POST - Resetear contraseña de usuario por admin
export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario sea admin
    const adminUser = await requireAdmin();

    const { userId, newPassword } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // No permitir resetear contraseña de otros admins
    if (user.role === "ADMIN" && user.id !== adminUser.id) {
      return NextResponse.json(
        { success: false, error: "No se puede resetear la contraseña de otro administrador" },
        { status: 403 }
      );
    }

    // Generar contraseña estándar si no se proporciona
    const passwordToUse = newPassword || generateStandardPassword();
    
    // Hash de la nueva contraseña
    const hashedPassword = await hashPassword(passwordToUse);

    // Actualizar contraseña del usuario
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    // Log del evento de seguridad
    securityLogger.log(
      SecurityEventType.ADMIN_ACCESS,
      request,
      adminUser.id,
      adminUser.email,
      adminUser.role,
      {
        action: "password_reset_by_admin",
        targetUserId: userId,
        targetUserEmail: user.email,
        targetUserName: user.name,
        resetBy: adminUser.id,
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      success: true,
      message: "Contraseña reseteada exitosamente",
      data: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        newPassword: passwordToUse, // Solo para mostrar al admin
        resetBy: adminUser.id,
        resetAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Admin password reset error:", error);
    
    securityLogger.log(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      request,
      undefined,
      undefined,
      undefined,
      {
        reason: "Admin password reset error",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    );

    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Función para generar contraseña estándar
function generateStandardPassword(): string {
  // Contraseña estándar: "ChipaCo2024!"
  // Fácil de recordar y comunicar al cliente
  return "ChipaCo2024!";
}

// GET - Obtener información del usuario para resetear contraseña
export async function GET(request: NextRequest) {
  try {
    // Verificar que el usuario sea admin
    const adminUser = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dni: user.dni,
        role: user.role,
        createdAt: user.createdAt,
        canResetPassword: user.role !== "ADMIN" || user.id === adminUser.id,
      },
    });
  } catch (error) {
    console.error("Get user for password reset error:", error);
    
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
