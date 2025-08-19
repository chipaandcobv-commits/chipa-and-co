
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

// Verificar permisos de admin para API routes
export async function requireAdmin() {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    throw new Error("Acceso denegado: Se requieren permisos de administrador");
  }
  return true;
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
