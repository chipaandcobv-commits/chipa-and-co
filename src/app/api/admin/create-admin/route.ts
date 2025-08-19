import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { hashPassword } from "../../../../lib/auth";

const prisma = new PrismaClient();

// POST - Crear usuario administrador inicial
export async function POST(request: NextRequest) {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: "Ya existe un usuario administrador" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { name, email, dni, password, secretKey } = data;

    // Verificar clave secreta (puedes cambiar esto por algo más seguro)
    if (
      secretKey !== process.env.ADMIN_SECRET_KEY &&
      secretKey !== "admin-create-key-2024"
    ) {
      return NextResponse.json(
        { success: false, error: "Clave secreta inválida" },
        { status: 403 }
      );
    }

    // Validaciones
    if (!name || !email || !dni || !password) {
      return NextResponse.json(
        { success: false, error: "Nombre, email, DNI y contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "La contraseña debe tener al menos 8 caracteres",
        },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, error: "Este email ya está registrado" },
        { status: 400 }
      );
    }

    // Verificar si el DNI ya existe
    const existingUserByDni = await prisma.user.findUnique({
      where: { dni },
    });

    if (existingUserByDni) {
      return NextResponse.json(
        { success: false, error: "Este DNI ya está registrado" },
        { status: 400 }
      );
    }

    // Crear admin
    const hashedPassword = await hashPassword(password);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        dni,
        password: hashedPassword,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      admin,
      message: "Usuario administrador creado exitosamente",
    });
  } catch (error: any) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
