/**
 * Helper para autenticación unificada en endpoints de API
 * Soporta tanto JWT como NextAuth
 */

import { NextRequest } from "next/server";
import { getCurrentUser } from "./auth-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-config";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  name: string;
}

/**
 * Obtiene el usuario actual usando JWT o NextAuth
 */
export async function getCurrentUserUnified(): Promise<AuthUser | null> {
  try {
    // Intentar obtener usuario con JWT primero
    const currentUser = await getCurrentUser();
    
    if (currentUser) {
      return {
        userId: currentUser.userId,
        email: currentUser.email,
        role: currentUser.role,
        name: currentUser.name || ""
      };
    }
    
    // Si no hay usuario JWT, intentar con NextAuth
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      // Buscar usuario en la base de datos
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      
      if (dbUser) {
        return {
          userId: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          name: dbUser.name || ""
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Middleware para verificar autenticación en endpoints
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUserUnified();
  
  if (!user) {
    throw new Error("No autenticado");
  }
  
  return user;
}
