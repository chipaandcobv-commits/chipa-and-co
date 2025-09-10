import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "../../../../lib/auth-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log("🔄 [HYBRID LOGOUT] Starting hybrid logout process...");
    }

    // Verificar si hay sesión NextAuth
    const session = await getServerSession(authOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log("🔍 [HYBRID LOGOUT] NextAuth session found:", !!session);
      if (session) {
        console.log("🔍 [HYBRID LOGOUT] NextAuth user:", session.user?.email);
      }
    }

    // Limpiar cookie JWT personalizada
    await clearAuthCookie();

    // Invalidar todas las sesiones de NextAuth (incluso si no hay sesión activa)
    try {
      // Obtener el email del usuario desde el token JWT si está disponible
      let userEmail = session?.user?.email;
      
      // Si no hay sesión NextAuth, intentar obtener el email del token JWT
      if (!userEmail) {
        const jwtToken = request.cookies.get("auth-token")?.value;
        if (jwtToken) {
          try {
            const { verifyToken } = await import("../../../../lib/auth-server");
            const jwtUser = await verifyToken(jwtToken);
            userEmail = jwtUser?.email;
          } catch (error) {
            // Token JWT inválido, continuar
          }
        }
      }

      if (userEmail) {
        // Buscar el usuario en la base de datos
        const user = await prisma.user.findUnique({
          where: { email: userEmail }
        });

        if (user) {
          // Eliminar todas las sesiones de NextAuth del usuario
          const deletedSessions = await prisma.session.deleteMany({
            where: { userId: user.id }
          });

          // También eliminar todos los tokens de NextAuth del usuario
          const deletedTokens = await prisma.account.deleteMany({
            where: { userId: user.id }
          });

          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ [HYBRID LOGOUT] Deleted ${deletedSessions.count} NextAuth sessions and ${deletedTokens.count} accounts for user:`, user.email);
          }
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log("⚠️ [HYBRID LOGOUT] Error invalidating NextAuth sessions:", error);
      }
    }

    // Crear respuesta
    const response = NextResponse.json({
      success: true,
      message: "Sesión híbrida cerrada exitosamente",
      hadNextAuthSession: !!session,
    });

    // Lista completa de cookies de autenticación
    const authCookies = [
      "auth-token",
      "next-auth.session-token",
      "next-auth.csrf-token", 
      "next-auth.callback-url",
      "next-auth.state"
    ];

    // Limpiar todas las cookies de autenticación
    authCookies.forEach(cookieName => {
      response.cookies.set(cookieName, "", {
        path: "/",
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    });

    if (process.env.NODE_ENV === 'development') {
      console.log("✅ [HYBRID LOGOUT] All cookies cleared and sessions invalidated");
    }

    return response;
  } catch (error) {
    console.error("Hybrid logout error:", error);
    return NextResponse.json(
      { success: false, error: "Error al cerrar sesión híbrida" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
