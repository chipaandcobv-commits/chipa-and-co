
import { getCurrentUser } from "./auth";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// Verificar si el usuario actual es admin
export async function isCurrentUserAdmin(): Promise<boolean> {

  
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
       window.location.href = "/login";
       return false;
    };

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: { role: true },
    });

    return user?.role === "ADMIN";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Verificar permisos de admin para API routes y retornar usuario completo
export async function requireAdmin() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("No autorizado");
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        puntos: true,
        puntosHistoricos: true,
        role: true,
        password: true, // Necesario para cambio de contraseña
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (user.role !== "ADMIN") {
      throw new Error("Se requiere rol de administrador");
    }

    return user;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener usuario completo con rol
export async function getCurrentUserWithRole() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        puntos: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting user with role:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
