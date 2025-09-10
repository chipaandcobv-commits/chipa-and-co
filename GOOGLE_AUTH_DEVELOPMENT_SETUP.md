# Configuración de Google OAuth para Desarrollo

## Problema Identificado

El botón de "Continuar con Google" no funciona en desarrollo porque las variables de entorno de Google OAuth no están configuradas.

## Solución

### 1. Crear archivo `.env.local`

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secret_key_aqui
```

### 2. Obtener credenciales de Google

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita la **Identity Toolkit API**
4. Ve a "APIs & Services" > "Credentials"
5. Crea "OAuth 2.0 Client IDs"
6. Configura:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`

### 3. Configurar variables de entorno

Copia el `Client ID` y `Client Secret` de Google a tu archivo `.env.local`.

### 4. Reiniciar el servidor

Después de configurar las variables de entorno, reinicia el servidor de desarrollo:

```bash
npm run dev
```

## Estado Actual

- ✅ **Imagen del logo**: Solucionado (cambiado a `/chipa-logo.png`)
- ✅ **Botón de Google**: Implementado correctamente
- ❌ **Variables de entorno**: Necesitan configuración
- ✅ **Autenticación híbrida**: Funcionando correctamente

## Nota

Los errores 401 que aparecen en los logs son **normales** cuando no hay sesión activa. El sistema está funcionando correctamente.
