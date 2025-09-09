import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        role: true,
        isGoogleUser: true,
        needsProfileCompletion: true,
      },
    });

    if (!user) {
      // Usuario no existe, redirigir a login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user.needsProfileCompletion) {
      // Usuario necesita completar perfil
      return NextResponse.redirect(new URL("/complete-profile", request.url));
    }

    // Usuario completo, redirigir según rol
    const target = user.role === "ADMIN" ? "/admin" : "/cliente";
    return NextResponse.redirect(new URL(target, request.url));

  } catch (error) {
    console.error("Error in google-redirect:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  } finally {
    await prisma.$disconnect();
  }
}
