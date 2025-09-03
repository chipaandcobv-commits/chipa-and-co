# 🚀 Población de Datos de Prueba

Este script permite poblar la base de datos con datos realistas para simular un mes de uso de la aplicación de fidelización.

## 📊 Datos Generados

### **Usuarios**
- **Cantidad**: 1,500 usuarios
- **Distribución**: 50 usuarios por día durante 30 días
- **Nombres**: Combinaciones realistas de nombres y apellidos argentinos
- **Emails**: Generados automáticamente con dominios comunes
- **DNIs**: Únicos de 8 dígitos
- **Puntos**: 50-550 puntos iniciales por usuario
- **Contraseña**: `123456` para todos los usuarios

### **Productos**
- **Cantidad**: 20 productos
- **Tipos**: Bebidas, comidas, postres, snacks
- **Precios**: $500 - $2,800 (pesos argentinos)
- **Descripciones**: Detalladas y realistas

### **Premios**
- **Cantidad**: 8 tipos de premios
- **Costos**: 80 - 800 puntos
- **Tipos**: Descuentos, productos gratis, comidas completas
- **Stock**: Limitado para simular escasez

### **Órdenes**
- **Cantidad**: 1,500 órdenes (una por usuario)
- **Items**: 1-3 productos por orden
- **Fechas**: Distribuidas en el último mes
- **Puntos**: 1 punto por cada $100 gastado

### **Reclamos de Premios**
- **Cantidad**: ~450 reclamos (30% de usuarios)
- **Estados**: Pendientes, vencidos, aprobados, rechazados
- **Fechas**: Distribuidas para simular diferentes estados
- **Expiración**: 24 horas después del reclamo

## 🛠️ Cómo Usar

### **1. Ejecutar el Script**
```bash
npm run populate-test-data
```

### **2. Esperar la Completación**
El script mostrará el progreso en tiempo real:
```
🚀 Iniciando población de datos de prueba...
🧹 Limpiando datos existentes...
✅ Datos existentes eliminados
📦 Creando productos...
✅ 20 productos creados
👥 Creando usuarios...
👥 100/1500 usuarios creados
👥 200/1500 usuarios creados
...
🎉 ¡Población de datos completada exitosamente!
```

### **3. Acceder a la Aplicación**
- **Usuario normal**: Cualquier email generado / `123456`
- **Administrador**: `admin@cafe.com` / `admin123`

## ⚠️ Consideraciones Importantes

### **⚠️ Datos Existentes**
- **El script ELIMINA todos los datos existentes** antes de crear los nuevos
- **Si tienes datos importantes, haz backup antes de ejecutar**
- **Para mantener datos existentes, edita el script y comenta las líneas de limpieza**

### **🔄 Reversibilidad**
- **No hay forma de revertir** la población de datos
- **Siempre haz backup** de tu base de datos antes de ejecutar
- **Usa solo en entornos de desarrollo/testing**

### **⏱️ Tiempo de Ejecución**
- **Duración estimada**: 2-5 minutos
- **Depende de**: Velocidad de la base de datos y conexión
- **Progreso visible**: Se muestra cada 100 usuarios/órdenes

## 🔧 Personalización

### **Modificar Cantidades**
```typescript
// Cambiar número de usuarios
const totalUsers = 500; // En lugar de 1500

// Cambiar porcentaje de reclamos
const usersWithClaims = users.filter(() => Math.random() < 0.5); // 50% en lugar de 30%
```

### **Modificar Productos/Premios**
```typescript
// Agregar más productos
const products = [
  // ... productos existentes
  { name: "Nuevo Producto", price: 2000, description: "Descripción" }
];

// Modificar premios
const rewards = [
  // ... premios existentes
  { name: "Nuevo Premio", description: "Descripción", pointsCost: 400, stock: 25 }
];
```

### **Modificar Fechas**
```typescript
// Cambiar período de tiempo
const oneMonthAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 días en lugar de 30
```

## 📈 Casos de Uso

### **1. Testing de Funcionalidades**
- **Dashboard del admin**: Ver estadísticas realistas
- **Ranking de usuarios**: Probar ordenamiento y paginación
- **Validación de premios**: Probar diferentes estados
- **Backup de órdenes**: Generar Excel con datos reales

### **2. Demostración**
- **Clientes**: Mostrar la aplicación con datos realistas
- **Stakeholders**: Presentar métricas y estadísticas
- **Desarrollo**: Probar en condiciones similares a producción

### **3. Performance Testing**
- **Base de datos**: Probar consultas con volumen real
- **API endpoints**: Medir tiempos de respuesta
- **Interfaz**: Probar paginación y filtros

## 🚨 Solución de Problemas

### **Error: "Connection refused"**
```bash
# Verificar que la base de datos esté corriendo
npm run dev
# O verificar variables de entorno en .env
```

### **Error: "Permission denied"**
```bash
# Verificar permisos de la base de datos
# O ejecutar como administrador
```

### **Error: "Table doesn't exist"**
```bash
# Ejecutar migraciones primero
npx prisma migrate deploy
npx prisma generate
```

### **Script se cuelga**
```bash
# Presionar Ctrl+C y verificar logs
# Verificar conexión a la base de datos
# Revisar si hay transacciones bloqueadas
```

## 📝 Notas Adicionales

- **Los datos son completamente ficticios** y no representan usuarios reales
- **Las fechas se distribuyen uniformemente** en el último mes
- **Los puntos se calculan automáticamente** basados en las compras
- **El script es idempotente** (puede ejecutarse múltiples veces)
- **Se mantiene la integridad referencial** entre todas las tablas

## 🎯 Próximos Pasos

Después de ejecutar el script:
1. **Verificar el dashboard del admin** para confirmar estadísticas
2. **Probar todas las funcionalidades** con datos reales
3. **Verificar la limpieza automática** de premios vencidos
4. **Probar el backup de órdenes** con datos reales
5. **Verificar la responsividad** en diferentes dispositivos

¡Ahora tienes una base de datos completa para testear todas las funcionalidades de la aplicación!
