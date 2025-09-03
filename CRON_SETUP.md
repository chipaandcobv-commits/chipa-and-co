# 🔄 Configuración de Limpieza Automática de Premios Vencidos

## 📋 Descripción

El sistema ahora incluye limpieza automática de premios vencidos que se ejecuta cada vez que se accede a la página de premios vencidos del administrador, y también puede ejecutarse automáticamente mediante cron jobs.

## 🚀 Funcionalidades Implementadas

### 1. Limpieza Automática en Tiempo Real
- **Trigger**: Cada vez que se accede a `/admin/expired-rewards`
- **Acción**: Marca premios PENDING vencidos como EXPIRED y elimina los EXPIRED antiguos
- **Frecuencia**: Automática en cada acceso

### 2. Endpoint de Cron Job
- **URL**: `/api/cron/cleanup`
- **Métodos**: GET y POST
- **Seguridad**: Token de autorización opcional
- **Uso**: Para cron jobs externos o servicios de monitoreo

### 3. Scripts de Limpieza
- **Manual**: `npm run cleanup-rewards`
- **Automático**: `npm run cleanup-rewards-auto` (cada 6 horas)

## ⚙️ Configuración

### Variables de Entorno (Opcional)
```bash
# .env.local
CRON_SECRET_TOKEN=tu_token_secreto_aqui
```

### Configuración de Cron Job (Linux/Mac)
```bash
# Editar crontab
crontab -e

# Ejecutar cada 6 horas
0 */6 * * * curl -X GET "https://tu-dominio.com/api/cron/cleanup" -H "Authorization: Bearer tu_token_secreto_aqui"

# O ejecutar cada día a las 2 AM
0 2 * * * curl -X GET "https://tu-dominio.com/api/cron/cleanup" -H "Authorization: Bearer tu_token_secreto_aqui"
```

### Configuración de Cron Job (Windows)
```batch
# Crear archivo .bat
@echo off
curl -X GET "https://tu-dominio.com/api/cron/cleanup" -H "Authorization: Bearer tu_token_secreto_aqui"

# Usar Programador de Tareas de Windows para ejecutar cada 6 horas
```

### Configuración de Cron Job (Vercel)
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

## 🔧 Uso Manual

### Desde el Panel de Administración
1. Ir a `/admin/expired-rewards`
2. La limpieza se ejecuta automáticamente
3. Ver estadísticas actualizadas

### Desde la Línea de Comandos
```bash
# Limpieza única
npm run cleanup-rewards

# Limpieza automática continua
npm run cleanup-rewards-auto
```

### Desde API
```bash
# GET - Limpieza automática
curl -X GET "https://tu-dominio.com/api/cron/cleanup"

# POST - Limpieza manual
curl -X POST "https://tu-dominio.com/api/cron/cleanup"

# Con autorización
curl -X GET "https://tu-dominio.com/api/cron/cleanup" \
  -H "Authorization: Bearer tu_token_secreto_aqui"
```

## 📊 Lógica de Limpieza

### Flujo de Vencimiento
1. **Premio Canjeado** → Status: PENDING, expiresAt: now + 24h
2. **24h Después** → Status cambia a EXPIRED automáticamente
3. **48h Adicionales** → Se elimina permanentemente (72h total)

### Transacciones de Base de Datos
- **Marcar Vencidos**: UPDATE RewardClaim SET status = 'EXPIRED'
- **Eliminar Antiguos**: DELETE FROM RewardClaim WHERE status = 'EXPIRED' AND expiresAt < now - 48h
- **Consistencia**: Todas las operaciones en una transacción

## 🛡️ Seguridad

### Endpoint de Cron
- **Token Opcional**: Si se configura CRON_SECRET_TOKEN
- **Autorización**: Header Authorization: Bearer {token}
- **Logs**: Todas las ejecuciones se registran en consola

### Validaciones
- **Fechas**: Verificación de expiresAt vs now
- **Estados**: Solo premios PENDING y EXPIRED
- **Transacciones**: Rollback automático en caso de error

## 📈 Monitoreo

### Logs del Sistema
```bash
# Ver logs en tiempo real
npm run dev

# Ver logs de producción
npm start
```

### Métricas Disponibles
- Premios marcados como vencidos
- Premios eliminados permanentemente
- Timestamp de última ejecución
- Estado de éxito/error

## 🔍 Troubleshooting

### Problemas Comunes
1. **Premios no se vencen**: Verificar que expiresAt esté configurado correctamente
2. **Limpieza no funciona**: Verificar logs del servidor
3. **Cron job falla**: Verificar URL y token de autorización

### Debugging
```bash
# Verificar estado de premios
curl "https://tu-dominio.com/api/admin/rewards/expire"

# Ejecutar limpieza manual
npm run cleanup-rewards

# Ver logs detallados
npm run cleanup-rewards-auto
```

## 📝 Notas Importantes

- **No Reversible**: La eliminación de premios vencidos es permanente
- **Frecuencia**: Se recomienda ejecutar cada 6 horas para mantener la base de datos limpia
- **Backup**: Los premios vencidos se eliminan, no se archivan
- **Performance**: La limpieza es eficiente y usa transacciones de base de datos

## 🎯 Estado Actual

✅ **Implementado**: Limpieza automática en tiempo real
✅ **Implementado**: Endpoint de cron job
✅ **Implementado**: Scripts de limpieza manual y automática
✅ **Implementado**: Seguridad con token opcional
✅ **Implementado**: Logs y monitoreo completo

El sistema está completamente funcional y listo para producción con limpieza automática de premios vencidos.
