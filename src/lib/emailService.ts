import crypto from 'crypto';

// Configuración del servicio de email
const EMAIL_CONFIG = {
  // En producción, usar servicios como SendGrid, AWS SES, etc.
  provider: process.env.EMAIL_PROVIDER || 'console', // 'console', 'sendgrid', 'ses'
  fromEmail: process.env.FROM_EMAIL || 'noreply@chipaco.com',
  fromName: process.env.FROM_NAME || 'Chipá&Co',
};

// Interfaz para el contenido del email
interface EmailContent {
  to: string;
  subject: string;
  html: string;
  text?: string;
}



// Función principal para enviar emails
async function sendEmail(emailContent: EmailContent): Promise<boolean> {
  try {
    switch (EMAIL_CONFIG.provider) {
      case 'console':
        // En desarrollo, solo mostrar en consola
        console.log('📧 [EMAIL] Enviando email:');
        console.log('To:', emailContent.to);
        console.log('Subject:', emailContent.subject);
        console.log('HTML Preview:', emailContent.html.substring(0, 200) + '...');
        return true;
        
      case 'sendgrid':
        return await sendWithSendGrid(emailContent);
        
      case 'ses':
        return await sendWithSES(emailContent);
        
      default:
        console.error('❌ [EMAIL] Provider no soportado:', EMAIL_CONFIG.provider);
        return false;
    }
  } catch (error) {
    console.error('❌ [EMAIL] Error enviando email:', error);
    return false;
  }
}

// Implementación para SendGrid (futuro)
async function sendWithSendGrid(emailContent: EmailContent): Promise<boolean> {
  // TODO: Implementar SendGrid
  console.log('📧 [EMAIL] SendGrid no implementado aún, usando consola');
  return await sendEmail({ ...emailContent, to: 'console' });
}

// Implementación para AWS SES (futuro)
async function sendWithSES(emailContent: EmailContent): Promise<boolean> {
  // TODO: Implementar AWS SES
  console.log('📧 [EMAIL] AWS SES no implementado aún, usando consola');
  return await sendEmail({ ...emailContent, to: 'console' });
}

// Función para validar formato de email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


