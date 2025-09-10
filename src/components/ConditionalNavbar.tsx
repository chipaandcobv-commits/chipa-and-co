"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import AuthHeader from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  // Rutas donde NO mostrar navbar
  const noNavbarRoutes = [
    "/login",
    "/register",
    "/cliente",
    "/cliente/profile",
    "/cliente/rewards"
  ];
  
  // Rutas de admin donde SÍ mostrar navbar
  const adminRoutes = [
    "/admin",
    "/admin/config",
    "/admin/expired-rewards",
    "/admin/orders",
    "/admin/products",
    "/admin/ranking",
    "/admin/rewards",
    "/admin/security",
    "/admin/users",
    "/admin/validate"
  ];
  
  // No mostrar navbar en rutas específicas
  if (noNavbarRoutes.some(route => pathname.startsWith(route))) {
    return null;
  }
  
  // Mostrar navbar solo si hay usuario y es admin, o en rutas generales
  if (user && (user.role === "ADMIN" || adminRoutes.some(route => pathname.startsWith(route)))) {
    return <AuthHeader />;
  }
  
  // No mostrar navbar para usuarios cliente
  if (user && user.role === "USER") {
    return null;
  }
  
  // No mostrar navbar para usuarios no autenticados
  if (!user) {
    return null;
  }
  
  return null;
}
