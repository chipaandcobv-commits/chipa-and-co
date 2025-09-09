import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      dni?: string;
      puntos?: number;
      puntosHistoricos?: number;
      role?: string;
      isGoogleUser?: boolean;
      needsProfileCompletion?: boolean;
      createdAt?: string;
      updatedAt?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    dni?: string;
    puntos?: number;
    puntosHistoricos?: number;
    role?: string;
    isGoogleUser?: boolean;
    needsProfileCompletion?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    dni?: string;
    puntos?: number;
    puntosHistoricos?: number;
    role?: string;
    isGoogleUser?: boolean;
    needsProfileCompletion?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
}
