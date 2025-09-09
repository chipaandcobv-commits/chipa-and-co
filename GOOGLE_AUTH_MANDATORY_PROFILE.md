# Autenticación con Google - Perfil Obligatorio

## Resumen de Cambios

Se ha implementado un sistema **obligatorio** de completado de perfil para usuarios que se registran o loguean con Google. Los usuarios **NO pueden acceder** a la aplicación hasta completar todos los datos requeridos.

## Campos Obligatorios

- **DNI**: Debe tener entre 7 y 8 dígitos
- **Contraseña**: Mínimo 6 caracteres
- **Confirmación de contraseña**: Debe coincidir

## Flujo de Autenticación

### 1. Registro/Login con Google
```
Usuario hace clic en "Iniciar con Google"
↓
Google OAuth redirige a /auth-callback
↓
Se crea/actualiza usuario con needsProfileCompletion: true
↓
Redirige a /complete-profile (OBLIGATORIO)
```

### 2. Completado de Perfil
```
Usuario en /complete-profile
↓
Debe llenar DNI, contraseña y confirmación
↓
Validación en frontend y backend
↓
Si válido: needsProfileCompletion = false
↓
Redirige a /cliente o /admin según rol
```

### 3. Protecciones Implementadas

#### Middleware (src/middleware.ts)
- Verifica `needsProfileCompletion` en tokens NextAuth
- Redirige automáticamente a `/complete-profile` si es `true`
- Bloquea acceso a rutas protegidas

#### ProfileCompletionGuard (src/components/ProfileCompletionGuard.tsx)
- Componente de protección adicional
- Verifica estado de completado de perfil
- Redirige si es necesario

#### API Endpoints
- `/api/user/complete-profile`: Validación estricta de campos obligatorios
- `/api/auth/google-complete`: No genera token si perfil incompleto

## Archivos Modificados

1. **src/lib/auth-config.ts**
   - Comentario actualizado en createUser event
   - Mantiene `needsProfileCompletion: true` para usuarios Google

2. **src/middleware.ts**
   - Verificación obligatoria de `needsProfileCompletion`
   - Redirección automática a `/complete-profile`

3. **src/app/complete-profile/page.tsx**
   - Mensaje más claro sobre obligatoriedad
   - Advertencia visual sobre no poder acceder sin completar

4. **src/app/api/user/complete-profile/route.ts**
   - Mensajes de error más estrictos
   - Validación obligatoria mejorada

5. **src/app/api/auth/google-complete/route.ts**
   - Verificación adicional de DNI
   - No genera token si perfil incompleto

6. **src/components/ProfileCompletionGuard.tsx** (NUEVO)
   - Componente de protección
   - Redirección automática

7. **src/app/cliente/layout.tsx**
   - Integración del ProfileCompletionGuard

## Comportamiento del Sistema

### ✅ Usuario Completa Perfil
- Acceso normal a la aplicación
- Token JWT generado correctamente
- Redirección según rol (cliente/admin)

### ❌ Usuario NO Completa Perfil
- **NO puede acceder** a rutas protegidas
- Redirección automática a `/complete-profile`
- Mensajes claros sobre obligatoriedad
- No se genera token JWT

### 🔒 Protecciones Múltiples
1. **Middleware**: Primera línea de defensa
2. **ProfileCompletionGuard**: Protección a nivel de componente
3. **API Validation**: Validación en backend
4. **Token Generation**: Solo si perfil completo

## Testing

Para probar el flujo:

1. Registrarse con Google
2. Verificar redirección a `/complete-profile`
3. Intentar acceder a `/cliente` directamente (debe redirigir)
4. Completar perfil con datos válidos
5. Verificar acceso normal a la aplicación

## Notas Importantes

- Los usuarios existentes con `needsProfileCompletion: true` también serán redirigidos
- No hay forma de "saltarse" el completado de perfil
- El sistema es completamente obligatorio y no opcional
- Se mantiene compatibilidad con usuarios existentes que ya completaron su perfil

