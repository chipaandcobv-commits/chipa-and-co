import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { PrismaClient } from "../generated/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "your-super-secret-jwt-key-at-least-32-characters-long"
);

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  [key: string]: string | number | boolean | null | undefined; // Index signature para compatibilidad con JWTPayload
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(
    payload as Record<string, string | number | boolean | null | undefined>
  )
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Verificar que el payload contiene los campos necesarios
    if (
      typeof payload === "object" &&
      payload !== null &&
      "userId" in payload &&
      "email" in payload &&
      "name" in payload
    ) {
      return payload as TokenPayload;
    }

    return null;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Get current user from cookies
export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token");

    if (!token) return null;

    return verifyToken(token.value);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Set auth cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

// Clear auth cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}

// Get full user data including role and points
export async function getCurrentUserFull() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;

    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        puntos: true,
        role: true,
      },
    });

    await prisma.$disconnect();

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      points: user.puntos, // Mapear puntos a points para consistencia
      role: user.role,
    };
  } catch (error) {
    console.error("Error getting current user full data:", error);
    return null;
  }
}
