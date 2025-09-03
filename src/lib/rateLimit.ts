import { NextRequest } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Ventana de tiempo en milisegundos
  maxRequests: number; // Máximo número de requests por ventana
  blockDuration: number; // Duración del bloqueo en milisegundos
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    blockedUntil: number;
  };
}

// Store en memoria (en producción usar Redis)
const rateLimitStore: RateLimitStore = {};

// Configuraciones por ruta
const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // Login - muy restrictivo
  "/api/auth/login": {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 intentos por 15 minutos
    blockDuration: 30 * 60 * 1000, // Bloqueo por 30 minutos
  },
  // Registro - restrictivo
  "/api/auth/register": {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3, // 3 intentos por hora
    blockDuration: 60 * 60 * 1000, // Bloqueo por 1 hora
  },
  // APIs admin - moderadamente restrictivo
  "/api/admin": {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 100, // 100 requests por 5 minutos
    blockDuration: 15 * 60 * 1000, // Bloqueo por 15 minutos
  },
  // APIs generales - menos restrictivo
  default: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 60, // 60 requests por minuto
    blockDuration: 5 * 60 * 1000, // Bloqueo por 5 minutos
  },
};

export function getRateLimitConfig(path: string): RateLimitConfig {
  // Buscar configuración específica
  for (const [route, config] of Object.entries(rateLimitConfigs)) {
    if (route !== "default" && path.startsWith(route)) {
      return config;
    }
  }
  return rateLimitConfigs.default;
}

export function getClientIdentifier(request: NextRequest): string {
  // Identificar cliente por IP y User-Agent
  const ip = request.headers.get("x-forwarded-for") || 
             request.headers.get("x-real-ip") || 
             request.headers.get("cf-connecting-ip") || // Cloudflare
             request.headers.get("x-client-ip") || // Otros proxies
             "unknown";
  
  const userAgent = request.headers.get("user-agent") || "unknown";
  
  // Crear hash simple del identificador
  return `${ip}-${userAgent}`.slice(0, 100);
}

export function checkRateLimit(
  request: NextRequest,
  path: string
): { allowed: boolean; remaining: number; resetTime: number; blockedUntil?: number } {
  const config = getRateLimitConfig(path);
  const clientId = getClientIdentifier(request);
  const now = Date.now();
  
  // Limpiar entradas expiradas
  if (rateLimitStore[clientId]) {
    const entry = rateLimitStore[clientId];
    
    // Si está bloqueado, verificar si ya expiró
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        blockedUntil: entry.blockedUntil,
      };
    }
    
    // Si la ventana expiró, resetear
    if (now > entry.resetTime) {
      delete rateLimitStore[clientId];
    }
  }
  
  // Si no existe entrada, crear una nueva
  if (!rateLimitStore[clientId]) {
    rateLimitStore[clientId] = {
      count: 0,
      resetTime: now + config.windowMs,
      blockedUntil: 0,
    };
  }
  
  const entry = rateLimitStore[clientId];
  
  // Si excede el límite, bloquear
  if (entry.count >= config.maxRequests) {
    entry.blockedUntil = now + config.blockDuration;
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.blockedUntil,
      blockedUntil: entry.blockedUntil,
    };
  }
  
  // Incrementar contador
  entry.count++;
  
  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
  };
}

export function getRateLimitHeaders(
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    "X-RateLimit-Limit": "100",
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": new Date(resetTime).toISOString(),
    "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
  };
}

// Función para limpiar store periódicamente (ejecutar cada hora)
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  
  for (const [clientId, entry] of Object.entries(rateLimitStore)) {
    // Limpiar entradas expiradas
    if (now > entry.resetTime && (!entry.blockedUntil || now > entry.blockedUntil)) {
      delete rateLimitStore[clientId];
    }
  }
}

// Limpiar store cada hora
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitStore, 60 * 60 * 1000);
}

