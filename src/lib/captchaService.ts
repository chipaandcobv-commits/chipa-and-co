// Servicio de CAPTCHA para verificación de humanos
// Soporta reCAPTCHA v3 y hCaptcha

interface CaptchaConfig {
  provider: 'recaptcha' | 'hcaptcha' | 'none';
  siteKey: string;
  secretKey: string;
  threshold: number; // Para reCAPTCHA v3 (0.0 - 1.0)
}

const CAPTCHA_CONFIG: CaptchaConfig = {
  provider: (process.env.CAPTCHA_PROVIDER as any) || 'none',
  siteKey: process.env.CAPTCHA_SITE_KEY || '',
  secretKey: process.env.CAPTCHA_SECRET_KEY || '',
  threshold: parseFloat(process.env.CAPTCHA_THRESHOLD || '0.5'),
};

// Interfaz para la respuesta de verificación
interface CaptchaVerificationResult {
  success: boolean;
  score?: number; // Para reCAPTCHA v3
  error?: string;
  details?: any;
}

// Función para verificar reCAPTCHA v3
async function verifyRecaptchaV3(token: string, remoteip?: string): Promise<CaptchaVerificationResult> {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: CAPTCHA_CONFIG.secretKey,
        response: token,
        remoteip: remoteip || '',
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: 'reCAPTCHA verification failed',
        details: data['error-codes'],
      };
    }

    // Verificar score para reCAPTCHA v3
    if (data.score !== undefined) {
      if (data.score < CAPTCHA_CONFIG.threshold) {
        return {
          success: false,
          score: data.score,
          error: `Score too low: ${data.score} < ${CAPTCHA_CONFIG.threshold}`,
        };
      }
    }

    return {
      success: true,
      score: data.score,
      details: data,
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Función para verificar hCaptcha
async function verifyHCaptcha(token: string, remoteip?: string): Promise<CaptchaVerificationResult> {
  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: CAPTCHA_CONFIG.secretKey,
        response: token,
        remoteip: remoteip || '',
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: 'hCaptcha verification failed',
        details: data['error-codes'],
      };
    }

    return {
      success: true,
      details: data,
    };
  } catch (error) {
    console.error('hCaptcha verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Función principal para verificar CAPTCHA
export async function verifyCaptcha(
  token: string, 
  remoteip?: string
): Promise<CaptchaVerificationResult> {
  // Si no hay configuración de CAPTCHA, permitir (modo desarrollo)
  if (CAPTCHA_CONFIG.provider === 'none' || !CAPTCHA_CONFIG.secretKey) {
    console.log('🔓 [CAPTCHA] Modo desarrollo - CAPTCHA deshabilitado');
    return { success: true };
  }

  if (!token) {
    return {
      success: false,
      error: 'CAPTCHA token requerido',
    };
  }

  switch (CAPTCHA_CONFIG.provider) {
    case 'recaptcha':
      return await verifyRecaptchaV3(token, remoteip);
      
    case 'hcaptcha':
      return await verifyHCaptcha(token, remoteip);
      
    default:
      return {
        success: false,
        error: `Provider de CAPTCHA no soportado: ${CAPTCHA_CONFIG.provider}`,
      };
  }
}

// Función para obtener la configuración del cliente
export function getCaptchaConfig() {
  return {
    provider: CAPTCHA_CONFIG.provider,
    siteKey: CAPTCHA_CONFIG.siteKey,
    threshold: CAPTCHA_CONFIG.threshold,
    enabled: CAPTCHA_CONFIG.provider !== 'none' && !!CAPTCHA_CONFIG.siteKey,
  };
}

// Función para generar script de CAPTCHA
export function generateCaptchaScript(): string {
  if (CAPTCHA_CONFIG.provider === 'none' || !CAPTCHA_CONFIG.siteKey) {
    return '';
  }

  switch (CAPTCHA_CONFIG.provider) {
    case 'recaptcha':
      return `https://www.google.com/recaptcha/api.js?render=${CAPTCHA_CONFIG.siteKey}`;
      
    case 'hcaptcha':
      return 'https://js.hcaptcha.com/1/api.js';
      
    default:
      return '';
  }
}

// Función para validar si el CAPTCHA está configurado correctamente
export function validateCaptchaConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (CAPTCHA_CONFIG.provider === 'none') {
    return { valid: true, errors: [] };
  }

  if (!CAPTCHA_CONFIG.siteKey) {
    errors.push('CAPTCHA_SITE_KEY no configurado');
  }

  if (!CAPTCHA_CONFIG.secretKey) {
    errors.push('CAPTCHA_SECRET_KEY no configurado');
  }

  if (CAPTCHA_CONFIG.provider === 'recaptcha' && CAPTCHA_CONFIG.threshold < 0 || CAPTCHA_CONFIG.threshold > 1) {
    errors.push('CAPTCHA_THRESHOLD debe estar entre 0.0 y 1.0');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Función para obtener el componente de CAPTCHA según el provider
export function getCaptchaComponent(): string {
  switch (CAPTCHA_CONFIG.provider) {
    case 'recaptcha':
      return 'RecaptchaV3';
      
    case 'hcaptcha':
      return 'HCaptcha';
      
    default:
      return 'None';
  }
}

// Función para logging de eventos de CAPTCHA
export function logCaptchaEvent(
  event: 'verification_attempt' | 'verification_success' | 'verification_failed',
  details: any
): void {
  const timestamp = new Date().toISOString();
  console.log(`🔒 [CAPTCHA] ${event.toUpperCase()}:`, {
    timestamp,
    provider: CAPTCHA_CONFIG.provider,
    ...details,
  });
}
