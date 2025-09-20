import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { hashPassword, signToken, setAuthCookie } from "../../../../lib/auth-server";
import { validateRegisterForm } from "../../../../lib/validations";
import { securityLogger, SecurityEventType } from "../../../../lib/securityLogger";
import { verifyCaptcha } from "../../../../lib/captchaService";
import { checkAdvancedRateLimit, checkGlobalRateLimit, incrementGlobalCounter, getRateLimitHeaders } from "../../../../lib/rateLimitAdvanced";
import { detectBotWithHoneypot, validateFormData, generateBrowserFingerprint, detectAttackPatterns, logBotDetection, debugHoneypotDetection } from "../../../../lib/honeypotService";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. RATE LIMITING AVANZADO
    const rateLimitResult = await checkAdvancedRateLimit(request, '/api/auth/register');
    if (!rateLimitResult.allowed) {
      securityLogger.log(
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        request,
        undefined,
        undefined,
        undefined,
        {
          reason: 'Advanced rate limit exceeded',
          totalRequests: rateLimitResult.totalRequests,
          windowStart: new Date(rateLimitResult.windowStart).toISOString(),
        }
      );

      const response = NextResponse.json(
        { 
          success: false, 
          error: "Demasiadas solicitudes de registro. Intenta más tarde.",
          retryAfter: rateLimitResult.blockedUntil ? Math.ceil((rateLimitResult.blockedUntil - Date.now()) / 1000) : 3600
        },
        { status: 429 }
      );

      // Agregar headers de rate limiting
      Object.entries(getRateLimitHeaders(rateLimitResult))
        .forEach(([key, value]) => response.headers.set(key, value));

      return response;
    }

    // 2. VERIFICAR LÍMITES GLOBALES
    const globalLimitResult = await checkGlobalRateLimit(request, 'register');
    if (!globalLimitResult.allowed) {
      securityLogger.log(
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        request,
        undefined,
        undefined,
        undefined,
        {
          reason: 'Global rate limit exceeded',
          limitReason: globalLimitResult.reason,
        }
      );

      return NextResponse.json(
        { 
          success: false, 
          error: globalLimitResult.reason || "Límite global de registros alcanzado"
        },
        { status: 429 }
      );
    }

    const data = await request.json();

    // 3. VALIDAR DATOS DEL FORMULARIO
    const validation = validateRegisterForm(data);
    if (!validation.isValid) {
      securityLogger.log(
        SecurityEventType.REGISTER_FAILED,
        request,
        undefined,
        data.email,
        undefined,
        {
          reason: 'Form validation failed',
          errors: validation.errors,
        }
      );

      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    // 4. VALIDAR HONEYPOTS
    const formValidation = validateFormData(data);
    if (!formValidation.valid) {
      securityLogger.log(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        request,
        undefined,
        data.email,
        undefined,
        {
          reason: 'Honeypot validation failed',
          errors: formValidation.errors,
        }
      );

      return NextResponse.json(
        { success: false, error: "Datos del formulario inválidos" },
        { status: 400 }
      );
    }

    // 5. DETECTAR BOTS CON HONEYPOTS
    const metadata = {
      startTime: data.startTime || startTime,
      endTime: Date.now(),
      userAgent: request.headers.get("user-agent") || "",
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      referer: request.headers.get("referer") || "",
      origin: request.headers.get("origin") || "",
      language: request.headers.get("accept-language") || "",
      timezone: data.timezone || "",
      screenResolution: data.screenResolution || "",
      colorDepth: data.colorDepth || "",
      platform: data.platform || "",
      cookieEnabled: data.cookieEnabled || false,
      doNotTrack: request.headers.get("dnt") || "",
      fingerprint: data.fingerprint || "",
    };

    // Generar fingerprint si no se proporcionó
    if (!metadata.fingerprint) {
      metadata.fingerprint = generateBrowserFingerprint(metadata);
    }

    const botDetection = detectBotWithHoneypot(data, metadata);
    
    // Debug information para desarrollo
    if (process.env.NODE_ENV === 'development') {
      const debugInfo = debugHoneypotDetection(data, metadata);
      console.log('🔍 [HONEYPOT DEBUG]', {
        email: data.email,
        confidence: debugInfo.confidence,
        reasons: debugInfo.reasons,
        debug: debugInfo.debug,
      });
    }
    
    // Solo bloquear si la confianza es muy alta (0.9 o más)
    if (botDetection.isBot && botDetection.confidence >= 0.9) {
      logBotDetection(true, botDetection.confidence, botDetection.reasons, metadata);
      
      securityLogger.log(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        request,
        undefined,
        data.email,
        undefined,
        {
          reason: 'Bot detected by honeypot (high confidence)',
          confidence: botDetection.confidence,
          reasons: botDetection.reasons,
          fingerprint: metadata.fingerprint,
        }
      );

      return NextResponse.json(
        { success: false, error: "Actividad sospechosa detectada" },
        { status: 403 }
      );
    }
    
    // Log de advertencia para confianza media
    if (botDetection.confidence >= 0.5 && botDetection.confidence < 0.9) {
      console.log('⚠️ [HONEYPOT WARNING] Medium confidence bot detection:', {
        email: data.email,
        confidence: botDetection.confidence,
        reasons: botDetection.reasons,
      });
    }

    // 6. DETECTAR PATRONES DE ATAQUE
    const attackDetection = detectAttackPatterns(data, metadata, 0);
    if (attackDetection.isAttack) {
      securityLogger.log(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        request,
        undefined,
        data.email,
        undefined,
        {
          reason: 'Attack pattern detected',
          pattern: attackDetection.pattern,
          confidence: attackDetection.confidence,
        }
      );

      return NextResponse.json(
        { success: false, error: "Patrón de ataque detectado" },
        { status: 403 }
      );
    }

    // 7. VERIFICAR CAPTCHA
    if (data.captchaToken) {
      const captchaResult = await verifyCaptcha(data.captchaToken, metadata.ip);
      if (!captchaResult.success) {
        securityLogger.log(
          SecurityEventType.SUSPICIOUS_ACTIVITY,
          request,
          undefined,
          data.email,
          undefined,
          {
            reason: 'CAPTCHA verification failed',
            error: captchaResult.error,
          }
        );

        return NextResponse.json(
          { success: false, error: "Verificación CAPTCHA fallida" },
          { status: 400 }
        );
      }
    }

    const { name, email, dni, password } = data;

    // Verificar si el usuario ya existe por email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, errors: { email: "Este email ya está registrado" } },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe por DNI
    const existingUserByDni = await prisma.user.findUnique({
      where: { dni },
    });

    if (existingUserByDni) {
      return NextResponse.json(
        { success: false, errors: { dni: "Este DNI ya está registrado" } },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        dni,
        password: hashedPassword,
      },
    });

    // 8. INCREMENTAR CONTADORES GLOBALES
    await incrementGlobalCounter(request, 'register');

    // 9. CREAR SESIÓN DE AUTENTICACIÓN AUTOMÁTICAMENTE
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = await signToken(tokenPayload);
    await setAuthCookie(token);

    // Log del registro exitoso
    securityLogger.log(
      SecurityEventType.REGISTER_SUCCESS,
      request,
      user.id,
      user.email,
      user.role,
      {
        registeredAt: new Date().toISOString(),
        formTime: Date.now() - startTime,
        fingerprint: metadata.fingerprint,
        botDetectionConfidence: botDetection.confidence,
        autoLogin: true,
      }
    );

    const response = NextResponse.json({
      success: true,
      message: "Usuario registrado exitosamente. Iniciando sesión automáticamente...",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dni: user.dni || null,
        puntos: user.puntos,
        puntosHistoricos: user.puntosHistoricos,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      autoLogin: true,
    });

    // Agregar headers de rate limiting
    Object.entries(getRateLimitHeaders(rateLimitResult))
      .forEach(([key, value]) => response.headers.set(key, value));

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
