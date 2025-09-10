// Sistema de Honeypots para detectar bots
// Completamente GRATUITO - no requiere servicios externos

interface HoneypotConfig {
  enabled: boolean;
  fieldNames: string[];
  timeThreshold: number; // Tiempo mínimo para completar formulario (ms)
  maxFormTime: number; // Tiempo máximo para completar formulario (ms)
}

const HONEYPOT_CONFIG: HoneypotConfig = {
  enabled: process.env.HONEYPOT_ENABLED !== 'false', // Habilitado por defecto
  fieldNames: [
    'website', // Campo común en formularios
    'url',
    'homepage',
    'phone_number', // Campo que no debería estar en registro
    'company',
    'address',
    'city',
    'zip_code',
    'country',
    'age',
    'birthday',
    'gender',
    'occupation',
    'income',
    'interests',
    'newsletter',
    'terms_agreement',
    'privacy_policy',
    'marketing_consent',
    'spam_check',
    'human_verification',
    'captcha_response',
    'security_question',
    'verification_code',
    'otp_code',
    'two_factor',
    'biometric_data',
    'fingerprint',
    'device_id',
    'session_token',
    'csrf_token',
    'api_key',
    'secret_key',
    'password_confirmation',
    'confirm_password',
    'repeat_password',
    'password_again',
    'verify_password',
    'password_verify',
    'pwd_confirm',
    'pwd_repeat',
    'pwd_again',
    'pwd_verify',
    'pwd_check',
    'pwd_validation',
    'pwd_confirmation',
    'pwd_repeat_field',
    'pwd_again_field',
    'pwd_verify_field',
    'pwd_check_field',
    'pwd_validation_field',
    'pwd_confirmation_field',
    'pwd_repeat_input',
    'pwd_again_input',
    'pwd_verify_input',
    'pwd_check_input',
    'pwd_validation_input',
    'pwd_confirmation_input',
    'pwd_repeat_text',
    'pwd_again_text',
    'pwd_verify_text',
    'pwd_check_text',
    'pwd_validation_text',
    'pwd_confirmation_text',
    'pwd_repeat_field_input',
    'pwd_again_field_input',
    'pwd_verify_field_input',
    'pwd_check_field_input',
    'pwd_validation_field_input',
    'pwd_confirmation_field_input',
    'pwd_repeat_field_text',
    'pwd_again_field_text',
    'pwd_verify_field_text',
    'pwd_check_field_text',
    'pwd_validation_field_text',
    'pwd_confirmation_field_text',
  ],
  timeThreshold: 2000, // Mínimo 2 segundos para completar formulario
  maxFormTime: 300000, // Máximo 5 minutos para completar formulario
};

// Interfaz para datos del formulario
interface FormData {
  [key: string]: any;
}

// Interfaz para metadatos del formulario
interface FormMetadata {
  startTime: number;
  endTime: number;
  userAgent: string;
  ip: string;
  referer: string;
  origin: string;
  language: string;
  timezone: string;
  screenResolution: string;
  colorDepth: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string;
  fingerprint: string;
}

// Función para detectar bots usando honeypots
export function detectBotWithHoneypot(
  formData: FormData,
  metadata: FormMetadata
): { isBot: boolean; confidence: number; reasons: string[] } {
  const reasons: string[] = [];
  let confidence = 0;

  // 1. Verificar campos honeypot
  for (const fieldName of HONEYPOT_CONFIG.fieldNames) {
    if (formData[fieldName] && formData[fieldName].toString().trim() !== '') {
      reasons.push(`Honeypot field filled: ${fieldName}`);
      confidence += 0.8; // Alta confianza de bot
    }
  }

  // 2. Verificar tiempo de completado del formulario
  const formTime = metadata.endTime - metadata.startTime;
  
  if (formTime < HONEYPOT_CONFIG.timeThreshold) {
    reasons.push(`Form completed too quickly: ${formTime}ms < ${HONEYPOT_CONFIG.timeThreshold}ms`);
    confidence += 0.6; // Media confianza de bot
  }

  if (formTime > HONEYPOT_CONFIG.maxFormTime) {
    reasons.push(`Form completed too slowly: ${formTime}ms > ${HONEYPOT_CONFIG.maxFormTime}ms`);
    confidence += 0.3; // Baja confianza de bot
  }

  // 3. Verificar User-Agent
  if (!metadata.userAgent || metadata.userAgent.length < 10) {
    reasons.push('Invalid or missing User-Agent');
    confidence += 0.4;
  }

  // 4. Verificar referer
  if (!metadata.referer || !metadata.referer.includes('http')) {
    reasons.push('Invalid or missing Referer');
    confidence += 0.3;
  }

  // 5. Verificar JavaScript habilitado (si no hay datos del navegador)
  if (!metadata.screenResolution || !metadata.colorDepth) {
    reasons.push('JavaScript may be disabled or bot detected');
    confidence += 0.5;
  }

  // 6. Verificar fingerprint
  if (!metadata.fingerprint || metadata.fingerprint.length < 10) {
    reasons.push('Invalid or missing browser fingerprint');
    confidence += 0.4;
  }

  // 7. Verificar patrones de bot comunes
  if (metadata.userAgent.includes('bot') || 
      metadata.userAgent.includes('crawler') || 
      metadata.userAgent.includes('spider') ||
      metadata.userAgent.includes('scraper')) {
    reasons.push('Bot-like User-Agent detected');
    confidence += 0.9;
  }

  // 8. Verificar datos inconsistentes
  if (metadata.language && !metadata.language.includes('es') && !metadata.language.includes('en')) {
    reasons.push('Unusual language setting');
    confidence += 0.2;
  }

  // 9. Verificar timezone
  if (!metadata.timezone || metadata.timezone === 'UTC') {
    reasons.push('Default or missing timezone');
    confidence += 0.2;
  }

  // 10. Verificar cookies
  if (!metadata.cookieEnabled) {
    reasons.push('Cookies disabled');
    confidence += 0.3;
  }

  const isBot = confidence > 0.5; // Umbral de detección

  return {
    isBot,
    confidence: Math.min(confidence, 1.0),
    reasons,
  };
}

// Función para generar campos honeypot para el frontend
export function generateHoneypotFields(): { [key: string]: string } {
  const fields: { [key: string]: string } = {};
  
  // Generar 3-5 campos honeypot aleatorios
  const numFields = Math.floor(Math.random() * 3) + 3;
  const shuffledFields = [...HONEYPOT_CONFIG.fieldNames].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < numFields; i++) {
    const fieldName = shuffledFields[i];
    fields[fieldName] = ''; // Campo vacío
  }
  
  return fields;
}

// Función para validar datos del formulario
export function validateFormData(formData: FormData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Verificar que los campos requeridos estén presentes
  const requiredFields = ['name', 'email', 'dni', 'password'];
  for (const field of requiredFields) {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors.push(`Campo requerido faltante: ${field}`);
    }
  }
  
  // Verificar que los campos honeypot estén vacíos
  for (const fieldName of HONEYPOT_CONFIG.fieldNames) {
    if (formData[fieldName] && formData[fieldName].toString().trim() !== '') {
      errors.push(`Campo honeypot llenado: ${fieldName}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Función para generar fingerprint del navegador
export function generateBrowserFingerprint(metadata: FormMetadata): string {
  const components = [
    metadata.userAgent,
    metadata.language,
    metadata.timezone,
    metadata.screenResolution,
    metadata.colorDepth,
    metadata.platform,
    metadata.cookieEnabled.toString(),
    metadata.doNotTrack,
  ];
  
  const fingerprint = components.join('|');
  
  // Crear hash simple
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

// Función para detectar patrones de ataque
export function detectAttackPatterns(
  formData: FormData,
  metadata: FormMetadata,
  previousAttempts: number = 0
): { isAttack: boolean; pattern: string; confidence: number } {
  let confidence = 0;
  let pattern = '';

  // Patrón 1: Múltiples intentos rápidos
  if (previousAttempts > 5) {
    pattern = 'Multiple rapid attempts';
    confidence += 0.7;
  }

  // Patrón 2: Datos generados automáticamente
  if (formData.email && formData.email.includes('+') && formData.email.includes('@')) {
    pattern = 'Auto-generated email pattern';
    confidence += 0.6;
  }

  // Patrón 3: Nombres muy similares
  if (formData.name && formData.name.length < 3) {
    pattern = 'Suspicious name pattern';
    confidence += 0.4;
  }

  // Patrón 4: DNIs secuenciales
  if (formData.dni && /^\d{7,8}$/.test(formData.dni)) {
    const dniNum = parseInt(formData.dni);
    if (dniNum % 100 === 0 || dniNum % 1000 === 0) {
      pattern = 'Sequential DNI pattern';
      confidence += 0.5;
    }
  }

  // Patrón 5: Contraseñas muy simples
  if (formData.password && formData.password.length < 8) {
    pattern = 'Weak password pattern';
    confidence += 0.3;
  }

  // Patrón 6: Mismo fingerprint
  if (metadata.fingerprint && previousAttempts > 0) {
    pattern = 'Same browser fingerprint';
    confidence += 0.4;
  }

  return {
    isAttack: confidence > 0.5,
    pattern,
    confidence: Math.min(confidence, 1.0),
  };
}

// Función para logging de detección de bots
export function logBotDetection(
  isBot: boolean,
  confidence: number,
  reasons: string[],
  metadata: FormMetadata
): void {
  const timestamp = new Date().toISOString();
  const logLevel = confidence > 0.8 ? '🚨 CRITICAL' : confidence > 0.5 ? '⚠️ HIGH' : 'ℹ️ LOW';
  
  console.log(`${logLevel} [HONEYPOT] Bot detection:`, {
    timestamp,
    isBot,
    confidence,
    reasons,
    metadata: {
      ip: metadata.ip,
      userAgent: metadata.userAgent.substring(0, 100),
      formTime: metadata.endTime - metadata.startTime,
      fingerprint: metadata.fingerprint.substring(0, 20),
    },
  });
}

// Función para obtener configuración de honeypot
export function getHoneypotConfig(): HoneypotConfig {
  return { ...HONEYPOT_CONFIG };
}

// Función para validar si el honeypot está habilitado
export function isHoneypotEnabled(): boolean {
  return HONEYPOT_CONFIG.enabled;
}
