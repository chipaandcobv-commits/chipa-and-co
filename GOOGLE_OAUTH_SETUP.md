# Configuración de Google OAuth

Este documento explica cómo configurar la autenticación con Google para el sistema de fidelización de Chipa&Co.

## 1. Crear un proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Identity Toolkit API** (recomendado) o **Google Identity API**

## 2. Habilitar Identity Toolkit API

1. Ve a "APIs & Services" > "Library"
2. Busca "Identity Toolkit API"
3. Haz clic en "Identity Toolkit API" y luego en "Enable"
4. (Opcional) También puedes habilitar "Google Identity API" para compatibilidad

## 3. Configurar OAuth 2.0

1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "OAuth 2.0 Client IDs"
3. Selecciona "Web application"
4. Configura las URIs autorizadas:
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (para desarrollo)
     - `https://tu-dominio.com` (para producción)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (para desarrollo)
     - `https://tu-dominio.com/api/auth/callback/google` (para producción)

## 4. Configurar variables de entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secret_super_seguro_aqui
```

## 5. Generar NEXTAUTH_SECRET

Puedes generar un secret seguro usando:

```bash
openssl rand -base64 32
```

O usando Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 6. Flujo de autenticación

### Registro con Google:
1. Usuario hace clic en "Registrarse con Google"
2. Se redirige a Google para autenticación
3. Google redirige de vuelta a `/complete-profile`
4. Usuario completa su DNI
5. Se crea la cuenta y se redirige a `/cliente`

### Login con Google:
1. Usuario hace clic en "Continuar con Google"
2. Se redirige a Google para autenticación
3. Google redirige de vuelta a la aplicación
4. Si el usuario ya tiene DNI, se redirige directamente a `/cliente`
5. Si no tiene DNI, se redirige a `/complete-profile`

## 7. Verificación

Para verificar que todo funciona:

1. Inicia el servidor de desarrollo: `npm run dev`
2. Ve a `http://localhost:3000/login`
3. Haz clic en "Continuar con Google"
4. Completa el flujo de autenticación

## 8. Notas importantes

- Los usuarios de Google no necesitan contraseña
- El DNI es obligatorio para completar el registro
- Los usuarios de Google se identifican con el flag `isGoogleUser: true`
- El sistema mantiene compatibilidad con el registro tradicional (email/password)

## 9. Troubleshooting

### Error: "redirect_uri_mismatch"
- Verifica que las URIs en Google Cloud Console coincidan exactamente
- Asegúrate de incluir tanto HTTP (desarrollo) como HTTPS (producción)

### Error: "invalid_client"
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén correctos
- Asegúrate de que las variables estén en `.env.local`

### Error: "access_denied"
- Verifica que el proyecto tenga habilitada la **Identity Toolkit API**
- Asegúrate de que el dominio esté autorizado en Google Cloud Console
- Verifica que la API esté habilitada en "APIs & Services" > "Library"
