import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "../../../../lib/auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";

export async function POST(request: NextRequest) {
  try {
    // Limpiar cookie JWT personalizada
    await clearAuthCookie();

    // Crear respuesta con cookies limpiadas
    const response = NextResponse.json({
      success: true,
      message: "Sesión cerrada exitosamente",
    });

    // Limpiar todas las cookies de autenticación
    response.cookies.set("auth-token", "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    response.cookies.set("next-auth.session-token", "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    response.cookies.set("next-auth.csrf-token", "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    response.cookies.set("next-auth.callback-url", "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
