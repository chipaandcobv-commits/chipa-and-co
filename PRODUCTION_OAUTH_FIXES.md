# Soluciones para Problemas de OAuth en Producción

## Problemas Identificados y Solucionados

### 1. **Problema de Autenticación en Endpoints de API**
**Síntoma**: Los endpoints devuelven 401 (Unauthorized) aunque el usuario esté autenticado con Google.

**Causa**: Los endpoints solo verificaban autenticación JWT, no NextAuth.

**Solución Implementada**:
- Creado helper unificado `getCurrentUserUnified()` que soporta ambos sistemas de auth
- Actualizados todos los endpoints críticos para usar autenticación híbrida
- Endpoints actualizados: `/api/rewards/claim`, `/api/user/claims`, `/api/user/password`, `/api/user/profile`

### 2. **Problema de Actualización de Perfil**
**Síntoma**: Los cambios de perfil se guardan exitosamente pero no se reflejan en la interfaz.

**Causa**: La función `refetch` no estaba forzando la actualización de datos desde la base de datos.

**Solución Implementada**:
- Agregado parámetro `forceRefresh` al sistema de autenticación
- Implementado cache-busting con timestamps en las peticiones
- Mejorada la función `refetch` para obtener datos actualizados

### 3. **Problema de Logout con Google OAuth**
**Síntoma**: Después de cerrar sesión con Google, el usuario es redirigido de vuelta al cliente.

**Causa**: Las sesiones de NextAuth no se invalidaban correctamente.

**Solución Implementada**:
- Mejorado el endpoint `/api/auth/hybrid-logout` para eliminar tanto sesiones como tokens de NextAuth
- Agregado timestamp a la URL de redirección para evitar redirecciones automáticas
- Mejorado el middleware para detectar mejor las redirecciones post-logout

### 4. **Problema de Sincronización de Datos**
**Síntoma**: Los cambios en el perfil del usuario no se reflejan en producción.

**Causa**: El sistema de autenticación no actualizaba correctamente los datos del usuario.

**Solución Implementada**:
- Creado endpoint unificado `/api/user/me` que funciona con ambos sistemas de auth
- Mejorado el endpoint `/api/user/profile` para soportar usuarios de Google
- Agregada función `refetch` al contexto de autenticación
- Mejorado el cliente de autenticación para usar múltiples endpoints

## Configuraciones Necesarias en Producción

### Variables de Entorno Requeridas

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# NextAuth
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=tu_nextauth_secret_muy_seguro

# Base de datos
DATABASE_URL=tu_database_url
```

### Configuración de Google OAuth

1. **En Google Cloud Console**:
   - Ir a [Google Cloud Console](https://console.cloud.google.com/)
   - Seleccionar tu proyecto
   - Ir a "APIs & Services" > "Credentials"
   - Editar tu OAuth 2.0 Client ID
   - Agregar a "Authorized redirect URIs":
     ```
     https://tu-dominio.com/api/auth/callback/google
     ```

2. **Verificar Dominio**:
   - Asegúrate de que tu dominio esté verificado en Google Cloud Console
   - Si usas un subdominio, configúralo correctamente

### Configuración de Cookies

Las cookies de autenticación deben configurarse correctamente para producción:

```javascript
// En los endpoints de logout
response.cookies.set(cookieName, "", {
  path: "/",
  expires: new Date(0),
  httpOnly: true,
  secure: true, // IMPORTANTE: true en producción
  sameSite: "lax",
});
```

### Verificaciones Post-Deploy

1. **Probar Login con Google**:
   - Verificar que el login con Google funcione
   - Verificar que se redirija correctamente después del login

2. **Probar Logout**:
   - Verificar que el logout funcione correctamente
   - Verificar que no redirija de vuelta al cliente
   - Verificar que las cookies se limpien correctamente

3. **Probar Actualización de Perfil**:
   - Verificar que se puedan editar los datos del perfil
   - Verificar que los cambios se reflejen inmediatamente
   - Verificar que funcione tanto para usuarios normales como de Google

## Archivos Modificados

### Backend
- `src/lib/auth-helper.ts` - Nuevo helper para autenticación unificada
- `src/app/api/auth/hybrid-logout/route.ts` - Mejorado logout híbrido
- `src/app/api/user/profile/route.ts` - Soporte para usuarios de Google + autenticación híbrida
- `src/app/api/user/me/route.ts` - Nuevo endpoint unificado
- `src/app/api/rewards/claim/route.ts` - Autenticación híbrida
- `src/app/api/user/claims/route.ts` - Autenticación híbrida
- `src/app/api/user/password/route.ts` - Autenticación híbrida

### Frontend
- `src/lib/auth/context.tsx` - Agregada función refetch con forceRefresh
- `src/lib/auth/client.ts` - Mejorado cliente de autenticación con cache-busting
- `src/middleware.ts` - Mejorada detección de logout

## Testing en Producción

### Checklist de Verificación

- [ ] Login con Google funciona correctamente
- [ ] Logout redirige a `/login` y no vuelve al cliente
- [ ] Las cookies se limpian correctamente después del logout
- [ ] Los datos del perfil se actualizan correctamente
- [ ] Los cambios se reflejan inmediatamente en la UI
- [ ] Funciona tanto para usuarios normales como de Google

### Comandos de Debug

```bash
# Verificar cookies en el navegador
# Abrir DevTools > Application > Cookies
# Verificar que se limpien las cookies de auth después del logout

# Verificar logs del servidor
# Buscar logs de "[HYBRID LOGOUT]" y "[AUTH CLIENT]"
```

## Troubleshooting

### Si el logout sigue redirigiendo al cliente:
1. Verificar que las variables de entorno estén configuradas correctamente
2. Verificar que el dominio esté configurado en Google OAuth
3. Limpiar cookies manualmente y probar de nuevo

### Si los datos no se actualizan:
1. Verificar que el endpoint `/api/user/me` esté funcionando
2. Verificar que la función `refetch` se esté llamando después de actualizar
3. Verificar los logs del servidor para errores

### Si el login con Google falla:
1. Verificar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
2. Verificar que `NEXTAUTH_URL` esté configurado correctamente
3. Verificar que el dominio esté en las URIs autorizadas de Google
