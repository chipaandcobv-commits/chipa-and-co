import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "../../../../lib/auth-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";

export async function POST(request: NextRequest) {
  try {
    // Verificar si hay sesión NextAuth
    const session = await getServerSession(authOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log("🔍 [UNIFIED LOGOUT] Session found:", !!session);
      if (session) {
        console.log("🔍 [UNIFIED LOGOUT] Session user:", session.user?.email);
      }
    }
    
    // Limpiar cookie JWT personalizada
    await clearAuthCookie();

    // Crear respuesta
    const response = NextResponse.json({
      success: true,
      message: "Sesión cerrada exitosamente",
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
      console.log("✅ [UNIFIED LOGOUT] All cookies cleared");
    }

    return response;
  } catch (error) {
    console.error("Unified logout error:", error);
    return NextResponse.json(
      { success: false, error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
