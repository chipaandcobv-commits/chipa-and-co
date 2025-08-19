import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { hashPassword, signToken, setAuthCookie } from "../../../../lib/auth";
import { validateRegisterForm } from "../../../../lib/validations";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validar datos del formulario
    const validation = validateRegisterForm(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const { name, email, dni, password } = data;

    // Verificar si el usuario ya existe por email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, errors: { email: "Este email ya está registrado" } },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe por DNI
    const existingUserByDni = await prisma.user.findUnique({
      where: { dni },
    });

    if (existingUserByDni) {
      return NextResponse.json(
        { success: false, errors: { dni: "Este DNI ya está registrado" } },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        dni,
        password: hashedPassword,
      },
    });

    // Generar token JWT
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // Configurar cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dni: user.dni,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
