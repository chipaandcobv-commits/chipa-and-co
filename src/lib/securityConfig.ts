// Configuración centralizada de seguridad
export const SECURITY_CONFIG = {
  // Configuración de JWT
  JWT: {
    SECRET_MIN_LENGTH: 32,
    TOKEN_EXPIRY: "7d",
    REFRESH_TOKEN_EXPIRY: "30d",
    ISSUER: "app-fidelizacion-auth",
    AUDIENCE: "app-fidelizacion",
    ALGORITHM: "HS256",
  },
  
  // Configuración de contraseñas
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
    BCRYPT_COST: 12,
  },
  
  // Configuración de rate limiting
  RATE_LIMIT: {
    LOGIN: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutos
      MAX_REQUESTS: 5,
      BLOCK_DURATION_MS: 30 * 60 * 1000, // 30 minutos
    },
    REGISTER: {
      WINDOW_MS: 60 * 60 * 1000, // 1 hora
      MAX_REQUESTS: 3,
      BLOCK_DURATION_MS: 60 * 60 * 1000, // 1 hora
    },
    ADMIN_API: {
      WINDOW_MS: 5 * 60 * 1000, // 5 minutos
      MAX_REQUESTS: 100,
      BLOCK_DURATION_MS: 15 * 60 * 1000, // 15 minutos
    },
    GENERAL_API: {
      WINDOW_MS: 1 * 60 * 1000, // 1 minuto
      MAX_REQUESTS: 60,
      BLOCK_DURATION_MS: 5 * 60 * 1000, // 5 minutos
    },
  },
  
  // Configuración de intentos de login
  LOGIN_ATTEMPTS: {
    MAX_ATTEMPTS: 5,
    BLOCK_DURATION_MINUTES: 30,
    CLEANUP_INTERVAL_MS: 5 * 60 * 1000, // 5 minutos
  },
  
  // Configuración de cookies
  COOKIES: {
    AUTH_TOKEN: {
      NAME: "auth-token",
      HTTP_ONLY: true,
      SECURE: process.env.NODE_ENV === "production",
      SAME_SITE: "lax",
      MAX_AGE: 7 * 24 * 60 * 60, // 7 días
      PATH: "/",
    },
    REFRESH_TOKEN: {
      NAME: "refresh-token",
      HTTP_ONLY: true,
      SECURE: process.env.NODE_ENV === "production",
      SAME_SITE: "lax",
      MAX_AGE: 30 * 24 * 60 * 60, // 30 días
      PATH: "/api/auth/refresh",
    },
  },
  
  // Configuración de headers de seguridad
  SECURITY_HEADERS: {
    X_XSS_PROTECTION: "1; mode=block",
    X_CONTENT_TYPE_OPTIONS: "nosniff",
    X_FRAME_OPTIONS: "DENY",
    REFERRER_POLICY: "strict-origin-when-cross-origin",
    PERMISSIONS_POLICY: "camera=(), microphone=(), geolocation=(), payment=()",
    CONTENT_SECURITY_POLICY: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  
  // Configuración de logging
  LOGGING: {
    MAX_LOGS: 10000,
    CLEANUP_INTERVAL_MS: 24 * 60 * 60 * 1000, // 24 horas
    LOG_AGE_DAYS: 30,
    ENABLE_EXTERNAL_LOGGING: process.env.NODE_ENV === "production",
  },
  
  // Configuración de validación de entrada
  INPUT_VALIDATION: {
    MAX_EMAIL_LENGTH: 254,
    MAX_NAME_LENGTH: 100,
    MAX_DNI_LENGTH: 20,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_GENERAL_LENGTH: 500,
    ENABLE_HTML_SANITIZATION: true,
    ALLOWED_HTML_TAGS: [
      "b", "i", "u", "strong", "em", "p", "br", "span", "div",
      "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6",
      "a", "img", "table", "tr", "td", "th", "thead", "tbody",
      "tfoot", "caption", "colgroup", "col", "blockquote", "code",
      "pre", "mark", "small", "sub", "sup", "time", "abbr",
      "acronym", "cite", "q", "del", "ins", "s", "strike",
      "big", "center", "font", "hr", "address", "article",
      "aside", "footer", "header", "main", "nav", "section",
      "details", "summary", "dialog", "menu", "menuitem",
      "datalist", "fieldset", "legend", "label", "input",
      "textarea", "select", "option", "optgroup", "button",
      "form", "output", "progress", "meter", "canvas", "audio",
      "video", "source", "track", "embed", "object", "param",
      "iframe", "map", "area", "figure", "figcaption", "picture",
      "svg", "math", "script", "style", "link", "meta", "title",
      "base", "head", "body", "html", "doctype",
    ],
  },
  
  // Configuración de detección de amenazas
  THREAT_DETECTION: {
    ENABLE_SQL_INJECTION_DETECTION: true,
    ENABLE_XSS_DETECTION: true,
    ENABLE_COMMAND_INJECTION_DETECTION: true,
    ENABLE_PATH_TRAVERSAL_DETECTION: true,
    ENABLE_LDAP_INJECTION_DETECTION: true,
    ENABLE_NOSQL_INJECTION_DETECTION: true,
    ENABLE_TEMPLATE_INJECTION_DETECTION: true,
    ENABLE_XML_INJECTION_DETECTION: true,
    ENABLE_HTML_INJECTION_DETECTION: true,
    SUSPICIOUS_USER_AGENTS: [
      /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
      /python/i, /java/i, /perl/i, /ruby/i, /sqlmap/i, /nikto/i,
      /nmap/i, /metasploit/i, /burp/i, /owasp/i, /zap/i, /acunetix/i,
      /nessus/i, /openvas/i, /qualys/i, /rapid7/i, /tenable/i,
    ],
    SLOW_REQUEST_THRESHOLD_MS: 1000,
  },
  
  // Configuración de CSRF
  CSRF: {
    ENABLE_PROTECTION: true,
    TOKEN_LENGTH: 32,
    PROTECTED_ROUTES: ["/api/admin", "/api/user"],
    ENABLE_REFERER_CHECK: true,
  },
  
  // Configuración de sesiones
  SESSION: {
    ENABLE_SESSION_TRACKING: true,
    SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutos
    ENABLE_SESSION_ROTATION: true,
    MAX_CONCURRENT_SESSIONS: 3,
  },
  
  // Configuración de auditoría
  AUDIT: {
    ENABLE_AUDIT_LOGGING: true,
    LOG_AUTH_EVENTS: true,
    LOG_DATA_ACCESS: true,
    LOG_ADMIN_ACTIONS: true,
    LOG_SECURITY_EVENTS: true,
    LOG_PERFORMANCE_METRICS: true,
  },
  
  // Configuración de notificaciones
  NOTIFICATIONS: {
    ENABLE_EMAIL_ALERTS: process.env.ENABLE_EMAIL_ALERTS === "true",
    ENABLE_SMS_ALERTS: process.env.ENABLE_SMS_ALERTS === "true",
    ENABLE_WEBHOOK_ALERTS: process.env.ENABLE_WEBHOOK_ALERTS === "true",
    CRITICAL_ALERT_THRESHOLD: 5, // Alertas después de 5 eventos críticos
    ALERT_COOLDOWN_MS: 5 * 60 * 1000, // 5 minutos entre alertas
  },
  
  // Configuración de IP blocking
  IP_BLOCKING: {
    ENABLE_AUTOMATIC_BLOCKING: true,
    BLOCK_DURATION_MS: 24 * 60 * 60 * 1000, // 24 horas
    MAX_FAILED_ATTEMPTS_BEFORE_BLOCK: 10,
    WHITELIST_IPS: process.env.WHITELIST_IPS?.split(",") || [],
    BLACKLIST_IPS: process.env.BLACKLIST_IPS?.split(",") || [],
  },
  
  // Configuración de monitoreo
  MONITORING: {
    ENABLE_REAL_TIME_MONITORING: true,
    MONITORING_INTERVAL_MS: 30 * 1000, // 30 segundos
    ENABLE_PERFORMANCE_MONITORING: true,
    ENABLE_ERROR_MONITORING: true,
    ENABLE_SECURITY_MONITORING: true,
  },
};

// Función para validar configuración
export function validateSecurityConfig(): string[] {
  const errors: string[] = [];
  
  // Validar JWT_SECRET
  if (process.env.NODE_ENV === "production") {
    if (!process.env.JWT_SECRET) {
      errors.push("JWT_SECRET debe estar configurado en producción");
    } else if (process.env.JWT_SECRET.length < SECURITY_CONFIG.JWT.SECRET_MIN_LENGTH) {
      errors.push(`JWT_SECRET debe tener al menos ${SECURITY_CONFIG.JWT.SECRET_MIN_LENGTH} caracteres`);
    }
  }
  
  // Validar configuración de cookies
  if (process.env.NODE_ENV === "production") {
    if (!process.env.COOKIE_DOMAIN) {
      errors.push("COOKIE_DOMAIN debe estar configurado en producción");
    }
  }
  
  // Validar configuración de notificaciones
  if (SECURITY_CONFIG.NOTIFICATIONS.ENABLE_EMAIL_ALERTS && !process.env.SMTP_CONFIG) {
    errors.push("SMTP_CONFIG debe estar configurado si se habilitan alertas por email");
  }
  
  if (SECURITY_CONFIG.NOTIFICATIONS.ENABLE_WEBHOOK_ALERTS && !process.env.SECURITY_WEBHOOK_URL) {
    errors.push("SECURITY_WEBHOOK_URL debe estar configurado si se habilitan alertas por webhook");
  }
  
  return errors;
}

// Función para obtener configuración por entorno
export function getConfigForEnvironment(env: string) {
  const baseConfig = { ...SECURITY_CONFIG };
  
  if (env === "development") {
    // Configuración más permisiva para desarrollo
    baseConfig.RATE_LIMIT.LOGIN.MAX_REQUESTS = 20;
    baseConfig.RATE_LIMIT.LOGIN.BLOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutos
    baseConfig.LOGIN_ATTEMPTS.MAX_ATTEMPTS = 10;
    baseConfig.LOGIN_ATTEMPTS.BLOCK_DURATION_MINUTES = 5;
    baseConfig.THREAT_DETECTION.ENABLE_SQL_INJECTION_DETECTION = false;
    baseConfig.THREAT_DETECTION.ENABLE_XSS_DETECTION = false;
  }
  
  if (env === "test") {
    // Configuración para testing
    baseConfig.RATE_LIMIT.LOGIN.MAX_REQUESTS = 100;
    baseConfig.RATE_LIMIT.LOGIN.BLOCK_DURATION_MS = 1 * 60 * 1000; // 1 minuto
    baseConfig.LOGIN_ATTEMPTS.MAX_ATTEMPTS = 100;
    baseConfig.LOGIN_ATTEMPTS.BLOCK_DURATION_MINUTES = 1;
    baseConfig.THREAT_DETECTION.ENABLE_SQL_INJECTION_DETECTION = false;
    baseConfig.THREAT_DETECTION.ENABLE_XSS_DETECTION = false;
    baseConfig.LOGGING.ENABLE_EXTERNAL_LOGGING = false;
  }
  
  return baseConfig;
}

// Función para generar reporte de configuración
export function generateSecurityConfigReport(): Record<string, any> {
  const config = getConfigForEnvironment(process.env.NODE_ENV || "development");
  const validationErrors = validateSecurityConfig();
  
  return {
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    config: {
      jwt: {
        secretConfigured: !!process.env.JWT_SECRET,
        secretLength: process.env.JWT_SECRET?.length || 0,
        algorithm: config.JWT.ALGORITHM,
        tokenExpiry: config.JWT.TOKEN_EXPIRY,
      },
      rateLimiting: {
        enabled: true,
        loginLimit: config.RATE_LIMIT.LOGIN.MAX_REQUESTS,
        registerLimit: config.RATE_LIMIT.REGISTER.MAX_REQUESTS,
        adminLimit: config.RATE_LIMIT.ADMIN_API.MAX_REQUESTS,
      },
      passwordPolicy: {
        minLength: config.PASSWORD.MIN_LENGTH,
        maxLength: config.PASSWORD.MAX_LENGTH,
        requireUppercase: config.PASSWORD.REQUIRE_UPPERCASE,
        requireLowercase: config.PASSWORD.REQUIRE_LOWERCASE,
        requireNumbers: config.PASSWORD.REQUIRE_NUMBERS,
        bcryptCost: config.PASSWORD.BCRYPT_COST,
      },
      threatDetection: {
        sqlInjection: config.THREAT_DETECTION.ENABLE_SQL_INJECTION_DETECTION,
        xss: config.THREAT_DETECTION.ENABLE_XSS_DETECTION,
        commandInjection: config.THREAT_DETECTION.ENABLE_COMMAND_INJECTION_DETECTION,
        pathTraversal: config.THREAT_DETECTION.ENABLE_PATH_TRAVERSAL_DETECTION,
      },
      csrf: {
        enabled: config.CSRF.ENABLE_PROTECTION,
        tokenLength: config.CSRF.TOKEN_LENGTH,
        protectedRoutes: config.CSRF.PROTECTED_ROUTES,
      },
      logging: {
        maxLogs: config.LOGGING.MAX_LOGS,
        externalLogging: config.LOGGING.ENABLE_EXTERNAL_LOGGING,
        auditLogging: config.AUDIT.ENABLE_AUDIT_LOGGING,
      },
      monitoring: {
        realTime: config.MONITORING.ENABLE_REAL_TIME_MONITORING,
        performance: config.MONITORING.ENABLE_PERFORMANCE_MONITORING,
        security: config.MONITORING.ENABLE_SECURITY_MONITORING,
      },
    },
    validationErrors,
    recommendations: generateSecurityRecommendations(validationErrors, config),
  };
}

// Función para generar recomendaciones de seguridad
function generateSecurityRecommendations(errors: string[], config: any): string[] {
  const recommendations: string[] = [];
  
  if (errors.length > 0) {
    recommendations.push("Corregir errores de configuración antes de desplegar en producción");
  }
  
  if (process.env.NODE_ENV === "production") {
    if (!process.env.JWT_SECRET) {
      recommendations.push("Configurar JWT_SECRET con un valor seguro y único");
    }
    
    if (!process.env.COOKIE_DOMAIN) {
      recommendations.push("Configurar COOKIE_DOMAIN para restringir cookies al dominio correcto");
    }
    
    if (config.RATE_LIMIT.LOGIN.MAX_REQUESTS > 10) {
      recommendations.push("Considerar reducir el límite de intentos de login en producción");
    }
    
    if (!config.LOGGING.ENABLE_EXTERNAL_LOGGING) {
      recommendations.push("Habilitar logging externo para auditoría y monitoreo");
    }
    
    if (!config.NOTIFICATIONS.ENABLE_EMAIL_ALERTS && !config.NOTIFICATIONS.ENABLE_WEBHOOK_ALERTS) {
      recommendations.push("Configurar alertas para eventos de seguridad críticos");
    }
  }
  
  if (config.PASSWORD.BCRYPT_COST < 12) {
    recommendations.push("Considerar aumentar el costo de bcrypt a 12 o más para mayor seguridad");
  }
  
  if (!config.CSRF.ENABLE_PROTECTION) {
    recommendations.push("Habilitar protección CSRF para todas las rutas sensibles");
  }
  
  if (!config.IP_BLOCKING.ENABLE_AUTOMATIC_BLOCKING) {
    recommendations.push("Habilitar bloqueo automático de IPs maliciosas");
  }
  
  return recommendations;
}

