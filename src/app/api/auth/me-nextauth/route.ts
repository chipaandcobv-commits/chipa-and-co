import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        dni: session.user.dni,
        puntos: session.user.puntos,
        puntosHistoricos: session.user.puntosHistoricos,
        role: session.user.role,
        isGoogleUser: session.user.isGoogleUser,
        needsProfileCompletion: session.user.needsProfileCompletion,
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt,
      },
    });

  } catch (error) {
    console.error("Error getting user from NextAuth session:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
