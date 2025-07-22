import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard"];

// Rutas que redirigen al dashboard si el usuario ya está autenticado
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("auth-token")?.value;

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Verificar si es una ruta de autenticación
  const isAuthRoute = authRoutes.includes(pathname);

  if (isProtectedRoute) {
    // Si no hay token, redirigir a login
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verificar si el token es válido
    const user = await verifyToken(token);
    if (!user) {
      // Token inválido, limpiar cookie y redirigir a login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth-token");
      return response;
    }
  }

  if (isAuthRoute && token) {
    // Si está autenticado y trata de acceder a login/register, redirigir al dashboard
    const user = await verifyToken(token);
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
