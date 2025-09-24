import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { requireAdmin } from "../../../../lib/admin";

const prisma = new PrismaClient();

// GET - Obtener todos los usuarios
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    const search = url.searchParams.get("search");

    const where: any = {
      role: "USER", // Solo mostrar usuarios normales, no administradores
    };

    // Remover el filtro de rol ya que siempre filtramos por USER
    // if (role && ["USER", "ADMIN"].includes(role)) {
    //   where.role = role;
    // }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { dni: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        role: true,
        puntos: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            rewardClaims: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      {
        status:
          error.message ===
          "Acceso denegado: Se requieren permisos de administrador"
            ? 403
            : 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH - Actualizar rol de usuario
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const data = await request.json();
    const { userId, role } = data;

    // Validaciones
    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: "ID de usuario y rol son requeridos" },
        { status: 400 }
      );
    }

    if (!["USER", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Rol inválido" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar rol
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        role: true,
        puntos: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Rol actualizado a ${role}`,
    });
  } catch (error: any) {
    console.error("Update user role error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      {
        status:
          error.message ===
          "Acceso denegado: Se requieren permisos de administrador"
            ? 403
            : 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
