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
      allowDangerousEmailAccountLinking: true, // Permitir vincular cuentas con el mismo email
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          console.log("🔍 [SIGNIN] Google OAuth attempt for:", user.email);
          
          // Buscar el usuario en la base de datos
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: {
              id: true,
              needsProfileCompletion: true,
              role: true,
              isGoogleUser: true,
            },
          });

          if (existingUser) {
            console.log("✅ [SIGNIN] User exists, updating Google OAuth info");
            
            // Actualizar el usuario existente para permitir Google OAuth
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                isGoogleUser: true,
                image: user.image,
                emailVerified: new Date(),
              },
            });
            
            // Crear o actualizar la cuenta de NextAuth
            await prisma.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: "google",
                  providerAccountId: account.providerAccountId,
                },
              },
              update: {
                userId: existingUser.id,
                type: account.type,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
              create: {
                userId: existingUser.id,
                type: account.type,
                provider: "google",
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
            
            console.log("✅ [SIGNIN] Account linked successfully");
            return true;
          }
          
          console.log("🆕 [SIGNIN] New user, allowing registration");
          return true;
        } catch (error) {
          console.error("❌ [SIGNIN] Error:", error);
          return true; // Permitir el login incluso si hay error
        }
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
  debug: true,
  session: {
    strategy: "jwt",
  },
};
