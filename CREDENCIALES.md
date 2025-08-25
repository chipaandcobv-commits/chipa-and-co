# 🔐 Credenciales de Acceso - Sistema de Fidelización Chipa&Co

## 🚀 URLs de Acceso

- **Aplicación Principal**: http://localhost:3001
- **Panel de Administración**: http://localhost:3001/admin
- **Panel del Cliente**: http://localhost:3001/cliente

---

## 👨‍💼 ADMINISTRADOR

**Email**: `admin@chipa.com`  
**Contraseña**: `admin123`  
**URL**: http://localhost:3001/admin

### Funcionalidades del Administrador:
- ✅ Dashboard con estadísticas
- ✅ Gestión de productos
- ✅ Gestión de premios
- ✅ Gestión de usuarios
- ✅ Creación de órdenes
- ✅ Validación de premios
- ✅ Gestión de premios vencidos
- ✅ Configuración del sistema
- ✅ Ranking de usuarios

---

## 👤 CLIENTE

**Email**: `cliente@test.com`  
**Contraseña**: `cliente123`  
**URL**: http://localhost:3001/cliente

### Datos del Cliente:
- **Nombre**: Cliente de Prueba
- **Puntos Actuales**: 2,500
- **Puntos Históricos**: 3,500
- **DNI**: 12345678

### Funcionalidades del Cliente:
- ✅ Ver puntos disponibles
- ✅ Canjear premios
- ✅ Modal de confirmación con advertencia de 24h
- ✅ Historial de canjes
- ✅ Perfil de usuario

---

## 🎁 PREMIOS DISPONIBLES

| Premio | Puntos | Stock | Descripción |
|--------|--------|-------|-------------|
| Chipa Clásica | 100 | 50 | Deliciosa chipa tradicional recién horneada |
| Chipa con Queso | 150 | 30 | Chipa especial con queso derretido por dentro |
| Chipa Rellena | 200 | 25 | Chipa rellena con jamón y queso |
| Chipa Gigante | 300 | 20 | Chipa extra grande para compartir |
| Combo Familiar | 500 | 15 | Pack de 6 chipas + bebida |
| Descuento 20% | 800 | 10 | Descuento del 20% en tu próxima compra |
| Descuento 50% | 1,500 | 5 | Descuento del 50% en tu próxima compra |
| Comida Gratis | 2,000 | 3 | ¡Una comida completamente gratis! |

---

## 🛍️ PRODUCTOS DISPONIBLES

| Producto | Precio | Descripción |
|----------|--------|-------------|
| Chipa Clásica | $500 | Chipa tradicional de almidón de mandioca |
| Chipa con Queso | $700 | Chipa con queso derretido |
| Chipa Rellena | $900 | Chipa rellena con jamón y queso |
| Chipa Gigante | $1,200 | Chipa extra grande |
| Coca Cola | $300 | Bebida gaseosa 500ml |
| Agua Mineral | $200 | Agua mineral 500ml |

---

## ⏰ Sistema de Vencimiento de Premios

### Flujo del Sistema:
1. **Canje**: Usuario canjea premio → Estado: PENDING
2. **24 horas**: Premio vence → Estado: EXPIRED
3. **48 horas**: Premio se elimina → Eliminado permanentemente

### Comandos Útiles:
```bash
# Ejecutar limpieza manual de premios vencidos
npm run cleanup-rewards

# Crear datos de prueba (si es necesario)
npm run create-sample-data

# Generar cliente Prisma
npx prisma generate
```

---

## 🔧 Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir Prisma Studio (base de datos)
npx prisma studio

# Ejecutar migraciones
npx prisma migrate dev

# Resetear base de datos
npx prisma migrate reset --force
```

---

## 📱 Pruebas del Sistema

### 1. Probar Modal de Confirmación:
1. Inicia sesión como cliente
2. Selecciona cualquier premio
3. Verifica que aparezca el modal con:
   - Imagen del premio
   - Puntos requeridos
   - Descripción
   - Advertencia de 24 horas

### 2. Probar Sistema de Vencimiento:
1. Canjea un premio
2. Espera 24 horas (o modifica la fecha en la BD)
3. Ejecuta `npm run cleanup-rewards`
4. Verifica que el premio cambie a estado "vencido"

### 3. Probar Panel de Administración:
1. Inicia sesión como administrador
2. Navega a "Premios Vencidos"
3. Ejecuta la limpieza manual
4. Verifica las estadísticas

---

## 🚨 Notas Importantes

- **Puerto**: La aplicación corre en el puerto 3001 (no 3000)
- **Base de datos**: PostgreSQL con Prisma
- **Autenticación**: JWT con cookies httpOnly
- **Vencimiento**: Los premios tienen 24h para reclamarse
- **Eliminación**: Los premios vencidos se eliminan después de 48h adicionales

---

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que el servidor esté corriendo
2. Revisa la consola del navegador
3. Verifica los logs del servidor
4. Ejecuta `npm run cleanup-rewards` si hay problemas con premios vencidos
