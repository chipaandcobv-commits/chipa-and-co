import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "../generated/prisma";
import { signToken } from "./auth-server";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Buscar el usuario en la base de datos
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: {
            id: true,
            needsProfileCompletion: true,
            role: true,
          },
        });

        if (existingUser) {
          // El usuario ya existe, verificar si necesita completar perfil
          if (!existingUser.needsProfileCompletion) {
            // Usuario completo, redirigir según su rol
            return true;
          }
          // Usuario necesita completar perfil
          return true;
        }
        
        // Usuario nuevo, permitir registro
        return true;
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Si la URL es relativa, hacerla absoluta
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Si la URL es del mismo dominio, permitirla
      else if (new URL(url).origin === baseUrl) return url;
      
      // Redirigir a la página de callback para manejar el flujo de Google
      return `${baseUrl}/auth-callback`;
    },
    async jwt({ token, user, account, trigger }) {
      // Si es la primera vez que se crea el token (después del login) o si se está actualizando
      if (user || trigger === "update") {
        // Buscar el usuario en nuestra base de datos
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: {
            id: true,
            name: true,
            email: true,
            dni: true,
            puntos: true,
            puntosHistoricos: true,
            role: true,
            isGoogleUser: true,
            needsProfileCompletion: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (dbUser) {
          // Agregar información del usuario al token JWT
          token.id = dbUser.id;
          token.dni = dbUser.dni || undefined;
          token.puntos = dbUser.puntos;
          token.puntosHistoricos = dbUser.puntosHistoricos;
          token.role = dbUser.role;
          token.isGoogleUser = dbUser.isGoogleUser;
          token.needsProfileCompletion = dbUser.needsProfileCompletion;
          token.createdAt = dbUser.createdAt.toISOString();
          token.updatedAt = dbUser.updatedAt.toISOString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        // Pasar la información del token a la sesión
        session.user.id = token.id as string;
        session.user.dni = token.dni as string | undefined;
        session.user.puntos = token.puntos as number;
        session.user.puntosHistoricos = token.puntosHistoricos as number;
        session.user.role = token.role as string;
        session.user.isGoogleUser = token.isGoogleUser as boolean;
        session.user.needsProfileCompletion = token.needsProfileCompletion as boolean;
        session.user.createdAt = token.createdAt as string;
        session.user.updatedAt = token.updatedAt as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Cuando se crea un nuevo usuario con Google
      if (user.email) {
        await prisma.user.update({
          where: { email: user.email },
          data: {
            isGoogleUser: true,
            needsProfileCompletion: true, // OBLIGATORIO: Necesita completar DNI y contraseña
            image: user.image,
            emailVerified: new Date(),
            role: "USER", // Asegurar que los usuarios de Google sean USER por defecto
          },
        });
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
