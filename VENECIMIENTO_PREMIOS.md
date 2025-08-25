# Sistema de Vencimiento de Premios

## Descripción General

El sistema de vencimiento de premios implementa un mecanismo automático para gestionar el ciclo de vida de los premios canjeados por los usuarios. Los premios tienen un tiempo limitado para ser reclamados y luego son eliminados automáticamente de la base de datos.

## Flujo del Sistema

### 1. Canje de Premio
- Cuando un usuario canjea un premio, se crea un registro en `RewardClaim` con:
  - `status: "PENDING"`
  - `expiresAt: fecha_actual + 24_horas`
  - `createdAt: fecha_actual`

### 2. Ventana de Confirmación
- Al seleccionar un premio, se muestra un modal de confirmación que incluye:
  - Imagen del premio
  - Puntos requeridos
  - Descripción del premio
  - **Advertencia de 24 horas**: Informa al usuario que tiene 24 horas para reclamar el premio

### 3. Proceso de Vencimiento
- **24 horas después del canje**: El premio cambia automáticamente de `PENDING` a `EXPIRED`
- **48 horas después del canje**: El premio se elimina permanentemente de la base de datos

## Componentes Implementados

### 1. Base de Datos
- **Campo `expiresAt`**: Agregado a la tabla `RewardClaim` para almacenar la fecha de vencimiento
- **Migración**: `20250825175734_add_expiration_to_reward_claims`

### 2. API de Reclamación (`/api/rewards/claim`)
- Establece automáticamente `expiresAt` a 24 horas desde el momento del canje
- Verifica que el usuario no tenga premios pendientes o vencidos del mismo tipo

### 3. API de Gestión de Vencimientos (`/api/admin/rewards/expire`)
- **POST**: Ejecuta la limpieza automática de premios vencidos
- **GET**: Obtiene estadísticas de premios vencidos

### 4. Script de Limpieza (`src/scripts/cleanup-expired-rewards.ts`)
- Marca premios pendientes expirados como vencidos
- Elimina premios vencidos con más de 48 horas
- Se puede ejecutar manualmente con: `npm run cleanup-rewards`

### 5. Modal de Confirmación (`src/components/RewardConfirmationModal.tsx`)
- Muestra información completa del premio
- Incluye advertencia de 24 horas
- Valida puntos suficientes del usuario

### 6. Panel de Administración (`/admin/expired-rewards`)
- Interfaz para gestionar premios vencidos
- Estadísticas en tiempo real
- Ejecución manual de limpieza

## Estados de los Premios

1. **PENDING**: Premio canjeado, pendiente de reclamación (0-24 horas)
2. **EXPIRED**: Premio vencido, no reclamado a tiempo (24-72 horas)
3. **COMPLETED**: Premio reclamado exitosamente
4. **Eliminado**: Premio eliminado permanentemente (después de 72 horas)

## Comandos Disponibles

```bash
# Ejecutar limpieza manual de premios vencidos
npm run cleanup-rewards

# Generar cliente de Prisma (después de cambios en schema)
npx prisma generate

# Aplicar migraciones
npx prisma migrate dev
```

## Configuración Automática

Para implementar la limpieza automática en producción, se recomienda:

1. **Cron Job**: Configurar un cron job que ejecute el script cada hora
2. **Vercel Cron**: Si usas Vercel, configurar un cron job en `vercel.json`
3. **Base de datos**: Usar triggers de PostgreSQL para limpieza automática

### Ejemplo de Cron Job (Linux/Mac)
```bash
# Ejecutar cada hora
0 * * * * cd /path/to/app && npm run cleanup-rewards
```

### Ejemplo de Vercel Cron
```json
{
  "crons": [
    {
      "path": "/api/admin/rewards/expire",
      "schedule": "0 * * * *"
    }
  ]
}
```

## Seguridad

- Solo administradores pueden ejecutar la limpieza manual
- Las transacciones de base de datos aseguran consistencia
- Validaciones previenen canjes duplicados
- Logs detallados para auditoría

## Monitoreo

El sistema proporciona estadísticas en tiempo real:
- Premios pendientes por vencer
- Premios listos para eliminar
- Total de premios vencidos

Estas estadísticas están disponibles en el panel de administración y a través de la API.

## Consideraciones de Rendimiento

- Las consultas están optimizadas con índices apropiados
- Las transacciones previenen bloqueos
- La limpieza se ejecuta en lotes para evitar timeouts
- Los logs ayudan a monitorear el rendimiento

## Troubleshooting

### Problemas Comunes

1. **Premios no se marcan como vencidos**
   - Verificar que el script se ejecute correctamente
   - Revisar logs de la aplicación

2. **Error en migración**
   - Ejecutar `npx prisma migrate reset --force`
   - Regenerar el cliente: `npx prisma generate`

3. **API no responde**
   - Verificar permisos de administrador
   - Revisar logs del servidor

### Logs Útiles

```bash
# Ver logs del script de limpieza
npm run cleanup-rewards

# Ver logs de la aplicación
npm run dev
```
