import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard", "/admin", "/rewards", "/ranking", "/history", "/profile", "/cliente"];

// Rutas específicas para administradores
const adminOnlyRoutes = ["/admin"];

// Rutas específicas para usuarios normales (redirigir al cliente)
const userRoutes = ["/dashboard", "/rewards", "/ranking", "/history", "/profile"];

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

  // Verificar si es una ruta de usuario normal
  const isUserRoute = userRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Si no hay token, redirigir a login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verificar si el token es válido
      const user = await verifyToken(token);
      if (!user) {
        // Token inválido, limpiar cookie y redirigir a login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("auth-token");
        return response;
      }

      // Si es una ruta de usuario normal y el usuario es ADMIN, redirigir al admin
      if (isUserRoute && user.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // Si es una ruta de usuario normal y el usuario es USER, redirigir al cliente
      if (isUserRoute && user.role === "USER") {
        return NextResponse.redirect(new URL("/cliente", request.url));
      }

    } catch (error) {
      // Error al verificar token, limpiar cookie y redirigir a login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth-token");
      return response;
    }
  }

  if (isAuthRoute && token) {
    // Si está autenticado y trata de acceder a login/register, redirigir según el rol
    try {
      const user = await verifyToken(token);
      if (user) {
        if (user.role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin", request.url));
        } else {
          return NextResponse.redirect(new URL("/cliente", request.url));
        }
      }
    } catch (error) {
      // Token inválido, limpiar cookie
      const response = NextResponse.next();
      response.cookies.delete("auth-token");
      return response;
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
