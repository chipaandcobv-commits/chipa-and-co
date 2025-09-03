import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";
import { checkRateLimit, getRateLimitHeaders } from "./lib/rateLimit";
import { securityLogger, SecurityEventType } from "./lib/securityLogger";

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard", "/admin", "/rewards", "/ranking", "/history", "/profile", "/cliente"];

// Rutas específicas para administradores
const adminOnlyRoutes = ["/admin"];

// Rutas específicas para usuarios normales (redirigir al cliente)
const userRoutes = ["/dashboard", "/rewards", "/ranking", "/history", "/profile"];

// Rutas que redirigen al dashboard si el usuario ya está autenticado
const authRoutes = ["/login", "/register"];

// Rutas que requieren CSRF protection
const csrfProtectedRoutes = ["/api/admin", "/api/user"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const startTime = Date.now();
  
  try {
    // 1. RATE LIMITING - Verificar límites de velocidad
    const rateLimitResult = checkRateLimit(request, pathname);
    
    if (!rateLimitResult.allowed) {
      // Log del ataque de rate limiting
      securityLogger.logRateLimitExceeded(
        request,
        rateLimitResult.remaining,
        rateLimitResult.resetTime - Date.now()
      );
      
      // Retornar error 429 (Too Many Requests)
      const response = NextResponse.json(
        { 
          error: "Demasiadas solicitudes", 
          retryAfter: Math.ceil((rateLimitResult.blockedUntil! - Date.now()) / 1000) 
        },
        { status: 429 }
      );
      
      // Agregar headers de rate limiting
      Object.entries(getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime))
        .forEach(([key, value]) => response.headers.set(key, value));
      
      return response;
    }
    
    // 2. VALIDACIÓN DE HEADERS DE SEGURIDAD
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";
    
    // Detectar User-Agents sospechosos
    const suspiciousUserAgents = [
      /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i, /python/i, /java/i, /perl/i, /ruby/i,
      /sqlmap/i, /nikto/i, /nmap/i, /metasploit/i, /burp/i, /owasp/i, /zap/i, /acunetix/i, /nessus/i
    ];
    
    const isSuspiciousUserAgent = suspiciousUserAgents.some(pattern => pattern.test(userAgent));
    
    if (isSuspiciousUserAgent) {
      securityLogger.logSuspiciousActivity(request, {
        reason: "Suspicious User-Agent",
        userAgent,
        path: pathname,
      });
    }
    
    // 3. VALIDACIÓN DE REFERER (CSRF protection básica)
    if (csrfProtectedRoutes.some(route => pathname.startsWith(route))) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");
      
      if (origin && host && !origin.includes(host) && !referer.includes(host)) {
        securityLogger.log(
          SecurityEventType.CSRF_ATTEMPT,
          request,
          undefined,
          undefined,
          undefined,
          { origin, referer, host }
        );
        
        return NextResponse.json(
          { error: "Solicitud no autorizada" },
          { status: 403 }
        );
      }
    }
    
    // 4. AUTENTICACIÓN Y AUTORIZACIÓN
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
        securityLogger.logAccessDenied(request, undefined, undefined, "No token provided");
        
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      try {
        // Verificar si el token es válido
        const user = await verifyToken(token);
        if (!user) {
          // Token inválido, limpiar cookie y redirigir a login
          securityLogger.log(
            SecurityEventType.TOKEN_INVALID,
            request,
            undefined,
            undefined,
            undefined,
            { token: token.substring(0, 20) + "..." }
          );
          
          const response = NextResponse.redirect(new URL("/login", request.url));
          response.cookies.delete("auth-token");
          return response;
        }
        
        // Log de acceso exitoso
        securityLogger.log(
          SecurityEventType.ACCESS_GRANTED,
          request,
          user.userId,
          user.email,
          user.role || "USER"
        );
        
        // Si es una ruta de usuario normal y el usuario es ADMIN, redirigir al admin
        if (isUserRoute && user.role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
        
        // Si es una ruta de usuario normal y el usuario es USER, redirigir al cliente
        if (isUserRoute && user.role === "USER") {
          return NextResponse.redirect(new URL("/cliente", request.url));
        }
        
        // Verificar acceso a rutas admin
        if (adminOnlyRoutes.some(route => pathname.startsWith(route)) && user.role !== "ADMIN") {
          securityLogger.logAccessDenied(request, user.userId, user.email, "Admin access required");
          return NextResponse.json(
            { error: "Acceso denegado: Se requieren permisos de administrador" },
            { status: 403 }
          );
        }
        
      } catch (error) {
        // Error al verificar token, limpiar cookie y redirigir a login
        securityLogger.log(
          SecurityEventType.TOKEN_INVALID,
          request,
          undefined,
          undefined,
          undefined,
          { error: error instanceof Error ? error.message : "Unknown error" }
        );
        
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
    
    // 5. LOGGING DE PERFORMANCE
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (duration > 1000) { // Log requests lentos (>1s)
      securityLogger.logSuspiciousActivity(request, {
        reason: "Slow request",
        duration,
        path: pathname,
      });
    }
    
    // 6. HEADERS DE SEGURIDAD ADICIONALES
    const response = NextResponse.next();
    
    // Agregar headers de rate limiting
    Object.entries(getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime))
      .forEach(([key, value]) => response.headers.set(key, value));
    
    // Agregar header de request ID para tracking
    response.headers.set("X-Request-ID", `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    return response;
    
  } catch (error) {
    // Log de errores del middleware
    securityLogger.log(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      request,
      undefined,
      undefined,
      undefined,
      {
        reason: "Middleware error",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      }
    );
    
    // En caso de error, permitir que continúe pero loguear
    return NextResponse.next();
  }
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
