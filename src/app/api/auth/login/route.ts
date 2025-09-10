import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { verifyPassword, signToken, setAuthCookie } from "../../../../lib/auth-server";
import { validateLoginForm } from "../../../../lib/validations";
import { securityLogger, SecurityEventType } from "../../../../lib/securityLogger";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validar datos del formulario
    const validation = validateLoginForm(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const { email, password } = data;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, errors: { email: "Credenciales inválidas" } },
        { status: 401 }
      );
    }

    // Verificar contraseña
    if (!user.password) {
      securityLogger.logLoginFailed(request, email, "No password set (Google user)");
      return NextResponse.json(
        { success: false, errors: { email: "Credenciales inválidas" } },
        { status: 401 }
      );
    }
    
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      securityLogger.logLoginFailed(request, email, "Invalid password");
      return NextResponse.json(
        { success: false, errors: { password: "Credenciales inválidas" } },
        { status: 401 }
      );
    }


    // Generar token JWT
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Configurar cookie
    await setAuthCookie(token);

    // Log del login exitoso
    securityLogger.logLoginSuccess(request, user.id, user.email, user.role);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dni: user.dni || null,
        puntos: user.puntos,
        puntosHistoricos: user.puntosHistoricos,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
