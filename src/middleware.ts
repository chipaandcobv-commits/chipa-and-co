import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth-server";
import { checkRateLimit, getRateLimitHeaders } from "./lib/rateLimit";
import { securityLogger, SecurityEventType } from "./lib/securityLogger";
import { getToken } from "next-auth/jwt";

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard", "/admin", "/ranking", "/profile", "/cliente"];

// Rutas específicas para administradores
const adminOnlyRoutes = ["/admin"];

// Rutas específicas para usuarios normales (redirigir al cliente)
const userRoutes = ["/dashboard", "/ranking", "/profile"];

// Rutas que redirigen al dashboard si el usuario ya está autenticado
const authRoutes = ["/login", "/register"];

// Rutas que requieren autenticación parcial (como completar perfil)
const partialAuthRoutes = ["/complete-profile"];

// Rutas de NextAuth.js
const nextAuthRoutes = ["/api/auth"];

// Rutas que requieren CSRF protection
const csrfProtectedRoutes = ["/api/admin", "/api/user"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const startTime = Date.now();
  
  // Redirigir la raíz a login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // EXCLUIR COMPLETAMENTE las rutas de NextAuth.js del middleware
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }
  
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
    
    // Debug: mostrar todas las cookies disponibles (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log("🍪 [MIDDLEWARE DEBUG] All cookies:", request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 20)}...`));
      console.log("🍪 [MIDDLEWARE DEBUG] JWT token:", token ? "Found" : "Not found");
    }
    
    // Verificar si la ruta requiere autenticación
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );
    
    // Verificar si es una ruta de autenticación
    const isAuthRoute = authRoutes.includes(pathname);
    
    // Verificar si es una ruta de autenticación parcial
    const isPartialAuthRoute = partialAuthRoutes.includes(pathname);
    
    // Verificar si es una ruta de usuario normal
    const isUserRoute = userRoutes.some((route) =>
      pathname.startsWith(route)
    );
    
    if (isProtectedRoute) {
      // Verificar autenticación con JWT o NextAuth.js
      let user = null;
      let authMethod = "none";
      
      // Primero intentar con JWT
      if (token) {
        try {
          user = await verifyToken(token);
          if (user) {
            // Verificar si el usuario necesita completar perfil (para tokens JWT existentes)
            // Nota: Los tokens JWT solo se generan después de completar el perfil,
            // pero mantenemos esta verificación por seguridad
            authMethod = "jwt";
          }
        } catch (error) {
          // Token JWT inválido, continuar con NextAuth.js
        }
      }
      
      // Si no hay JWT válido, verificar NextAuth.js
      if (!user) {
        try {
          if (process.env.NODE_ENV === 'development') {
            console.log("🔍 [MIDDLEWARE DEBUG] Checking NextAuth.js token...");
          }
          const nextAuthToken = await getToken({ 
            req: request, 
            secret: process.env.NEXTAUTH_SECRET 
          });
          
          if (process.env.NODE_ENV === 'development') {
            console.log("🔍 [MIDDLEWARE DEBUG] NextAuth token:", nextAuthToken ? "Found" : "Not found");
            if (nextAuthToken) {
              console.log("🔍 [MIDDLEWARE DEBUG] Token details:", {
                email: nextAuthToken.email,
                sub: nextAuthToken.sub,
                id: nextAuthToken.id,
                role: nextAuthToken.role
              });
            }
          }
          
          if (nextAuthToken && nextAuthToken.email) {
            // Verificar si el usuario necesita completar perfil
            if (nextAuthToken.needsProfileCompletion) {
              // OBLIGATORIO: Redirigir a completar perfil si faltan datos
              if (process.env.NODE_ENV === 'development') {
                console.log("🔄 [MIDDLEWARE DEBUG] User needs profile completion, redirecting...");
              }
              return NextResponse.redirect(new URL("/complete-profile", request.url));
            }
            
            // Crear objeto user compatible con el formato JWT
            user = {
              userId: nextAuthToken.sub || nextAuthToken.id,
              email: nextAuthToken.email,
              role: nextAuthToken.role || "USER",
              dni: nextAuthToken.dni,
              name: nextAuthToken.name
            };
            authMethod = "nextauth";
            if (process.env.NODE_ENV === 'development') {
              console.log("✅ [MIDDLEWARE DEBUG] NextAuth user created:", user);
            }
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.log("❌ [MIDDLEWARE DEBUG] NextAuth error:", error);
          }
        }
      }
      
      // Si no hay autenticación válida
      if (!user) {
        // Verificar si es una ruta de autenticación parcial - permitir acceso
        if (isPartialAuthRoute) {
          return NextResponse.next();
        }
        
        securityLogger.logAccessDenied(request, "No valid authentication found");
        
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      // Log de acceso exitoso
      securityLogger.log(
        SecurityEventType.ACCESS_GRANTED,
        request,
        user.userId,
        user.email || "unknown",
        user.role || "USER",
        { authMethod }
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
        securityLogger.logAccessDenied(request, "Admin access required", user.userId, user.email || "unknown");
        return NextResponse.json(
          { error: "Acceso denegado: Se requieren permisos de administrador" },
          { status: 403 }
        );
      }
    }
    
    if (isAuthRoute) {
      // Verificar si viene de un logout (no redirigir automáticamente)
      const referer = request.headers.get("referer") || "";
      const url = new URL(request.url);
      const fromLogout = url.searchParams.get("from") === "logout";
      const hasTimestamp = url.searchParams.get("t");
      const forceLogout = url.searchParams.get("force") === "true";
      const isFromLogout = fromLogout || hasTimestamp || forceLogout || referer.includes("/cliente") || referer.includes("/admin");
      
      if (process.env.NODE_ENV === 'development') {
        console.log("🔍 [MIDDLEWARE DEBUG] Auth route access:", { 
          pathname, 
          referer, 
          fromLogout,
          hasTimestamp,
          forceLogout,
          isFromLogout 
        });
      }
      
      // Si viene de logout, permitir acceso a login sin redirección
      if (isFromLogout) {
        if (process.env.NODE_ENV === 'development') {
          console.log("🔄 [MIDDLEWARE DEBUG] Allowing login access after logout");
        }
        return NextResponse.next();
      }
      
      // Si está autenticado y trata de acceder a login/register, redirigir según el rol
      let user = null;
      
      // Verificar JWT primero
      if (token) {
        try {
          user = await verifyToken(token);
        } catch (error) {
          // Token JWT inválido, continuar con NextAuth.js
        }
      }
      
      // Si no hay JWT válido, verificar NextAuth.js
      if (!user) {
        try {
          const nextAuthToken = await getToken({ 
            req: request, 
            secret: process.env.NEXTAUTH_SECRET 
          });
          
          if (nextAuthToken && nextAuthToken.email) {
            user = {
              userId: nextAuthToken.sub || nextAuthToken.id,
              email: nextAuthToken.email,
              role: nextAuthToken.role || "USER",
              dni: nextAuthToken.dni,
              name: nextAuthToken.name
            };
          }
        } catch (error) {
          // Error al verificar NextAuth.js token
        }
      }
      
      if (user) {
        if (user.role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin", request.url));
        } else {
          return NextResponse.redirect(new URL("/cliente", request.url));
        }
      }
    }

    // Permitir acceso a rutas de autenticación parcial sin verificación de token
    if (isPartialAuthRoute) {
      return NextResponse.next();
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
