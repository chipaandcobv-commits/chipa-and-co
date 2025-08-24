# 🏪 Contexto Completo - Sistema de Fidelización Chipa&Co

## 📋 RESUMEN EJECUTIVO
Sistema de fidelización basado en DNI para comercios físicos. Los clientes presentan su DNI al comprar, acumulan puntos automáticamente según el monto gastado, y pueden canjear premios. Los administradores gestionan todo el sistema desde un panel web.

---

## 🏗️ ARQUITECTURA TÉCNICA

### Stack Tecnológico:
- **Framework**: Next.js 14 (App Router) con TypeScript
- **Base de Datos**: PostgreSQL con Prisma ORM v5.12.0
- **Autenticación**: JWT con cookies httpOnly
- **Styling**: Tailwind CSS
- **Deploy**: Vercel ready
- **Runtime**: Node.js con Edge Runtime en middleware

### Estructura de Directorios:
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/             # Rutas administrativas
│   ├── (user routes)/     # Rutas de usuario
│   └── layout.tsx         # Layout global con AuthProvider
├── components/            # Componentes reutilizables
│   ├── AuthHeader.tsx     # Header principal con navegación contextual
│   ├── ui/               # Componentes base (Button, Input)
│   └── icons/            # Iconos SVG
├── lib/                  # Utilidades y helpers
├── middleware.ts         # Protección de rutas
└── scripts/             # Scripts de utilidades
```

---

## 🗄️ MODELO DE DATOS COMPLETO

### Schema Prisma:
```prisma
model User {
  id               String      @id @default(cuid())
  name            String
  email           String      @unique
  dni             String      @unique
  password        String
  puntos          Int         @default(0)        // Puntos actuales disponibles
  puntosHistoricos Int        @default(0)        // Puntos totales históricos
  role            Role        @default(USER)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  // Relaciones
  orders          Order[]     @relation("UserOrders")
  rewardClaims    RewardClaim[]
}

model Product {
  id          String      @id @default(cuid())
  name        String
  price       Float
  description String?
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relaciones
  orderItems  OrderItem[]
}

model Order {
  id           String      @id @default(cuid())
  totalAmount  Float
  totalPoints  Int
  clientDni    String                              // DNI del cliente
  createdAt    DateTime    @default(now())
  
  // Relaciones
  user         User        @relation("UserOrders", fields: [clientDni], references: [dni])
  items        OrderItem[]
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  unitPrice Float
  total     Float
  
  // Relaciones
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])
}

model Reward {
  id          String        @id @default(cuid())
  name        String
  description String?
  pointsCost  Int
  isActive    Boolean       @default(true)
  imageUrl    String?
  stock       Int?                                // null = ilimitado
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  // Relaciones
  claims      RewardClaim[]
}

model RewardClaim {
  id          String    @id @default(cuid())
  rewardId    String
  userId      String
  pointsSpent Int
  status      String    @default("PENDING")      // PENDING, APPROVED, REJECTED
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relaciones
  reward      Reward    @relation(fields: [rewardId], references: [id])
  user        User      @relation(fields: [userId], references: [id])
}

model SystemConfig {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

---

## 🔄 FLUJOS DE NEGOCIO DETALLADOS

### 🛒 Flujo de Compra (Administrador):
1. **Cliente llega con productos** → Presenta DNI
2. **Admin busca cliente** → Input DNI en `/admin/orders`
3. **Sistema busca usuario** → API `/api/admin/orders` con parámetro `dni`
4. **Admin agrega productos** → Selecciona de lista de productos activos
5. **Cálculo automático** → `totalAmount = suma(productos)`, `totalPoints = totalAmount * pointsPerPeso`
6. **Confirmación** → POST a `/api/admin/orders` 
7. **Actualización BD** → Transacción que crea Order + OrderItems + actualiza User.puntos y User.puntosHistoricos
8. **UI refresh** → `fetchData()` actualiza tabla de órdenes recientes

### 🎁 Flujo de Canje de Premios (Usuario):
1. **Usuario ve premios** → GET `/api/rewards` (solo activos)
2. **Selecciona premio** → Verifica puntos suficientes en cliente
3. **Confirma canje** → POST `/api/rewards/claim`
4. **Validación servidor** → Verifica puntos, stock, estado del premio
5. **Transacción** → Crea RewardClaim + decrementa User.puntos (NO puntosHistoricos)
6. **Estado inicial** → RewardClaim.status = "PENDING"
7. **Notificación** → Usuario ve "Pendiente de validación"

### 🔍 Flujo de Validación de Premios (Administrador):
1. **Admin ve pendientes** → GET `/api/admin/rewards/validate`
2. **Revisa detalles** → Usuario, premio, puntos gastados, fecha
3. **Decisión** → Botones "Aprobar", "Rechazar"
4. **Actualización** → PATCH `/api/admin/rewards/validate` con nuevo status y notas
5. **Estados finales** → APPROVED (aprobado), REJECTED (rechazado)

---

## 🔐 SISTEMA DE AUTENTICACIÓN Y AUTORIZACIÓN

### Estructura de Auth:
```typescript
// AuthContext.tsx - Estado global
interface User {
  id: string;
  name: string;
  email: string;
  dni: string;
  puntos: number;
  puntosHistoricos: number;
  role: "USER" | "ADMIN";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}
```

### Middleware de Protección:
```typescript
// middleware.ts
const adminRoutes = ["/admin"];           // Solo admins
const userOnlyRoutes = ["/dashboard", "/rewards", "/history"]; // Solo usuarios
const protectedRoutes = [...adminRoutes, ...userOnlyRoutes];   // Requiere auth
```

### Flujo de Login:
1. **Credenciales** → POST `/api/auth/login`
2. **Validación** → bcrypt + Prisma lookup
3. **JWT Generation** → Payload: `{ userId, role }`
4. **Cookie Setting** → httpOnly, secure, sameSite
5. **Response** → `{ user: {...}, success: true }`
6. **Client Update** → AuthContext.setUser()
7. **Redirect** → Admin → `/admin`, User → `/dashboard`

---

## 🛡️ SEGURIDAD Y VALIDACIONES

### Protección de API:
```typescript
// lib/auth.ts
export async function requireAuth() {
  const token = cookies().get("token")?.value;
  if (!token) throw new Error("No autorizado");
  const payload = jwt.verify(token, JWT_SECRET);
  return await prisma.user.findUnique({ where: { id: payload.userId }});
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user?.role !== "ADMIN") throw new Error("Se requiere rol de administrador");
  return user;
}
```

### Validaciones de Negocio:
- **Puntos suficientes** → `user.puntos >= reward.pointsCost`
- **Stock disponible** → `reward.stock === null || reward.stock > 0`
- **Premio activo** → `reward.isActive === true`
- **Usuario único** → `dni` y `email` únicos en DB
- **Precios válidos** → `price > 0`, `pointsCost > 0`

---

## 📊 SISTEMA DE PUNTOS Y MÉTRICAS

### Lógica de Puntos:
```typescript
// Al crear orden
const totalPoints = Math.floor(totalAmount * pointsPerPeso);
await prisma.user.update({
  where: { dni: clientDni },
  data: {
    puntos: { increment: totalPoints },           // Puntos disponibles
    puntosHistoricos: { increment: totalPoints }  // Histórico (nunca decrece)
  }
});

// Al canjear premio
await prisma.user.update({
  where: { id: userId },
  data: {
    puntos: { decrement: pointsSpent }            // Solo decrementa puntos actuales
    // puntosHistoricos NO se toca
  }
});
```

### Analytics Disponibles:
- **Ventas**: Total órdenes, monto total, promedio por orden
- **Puntos**: Otorgados, canjeados, disponibles, históricos
- **Usuarios**: Total, nuevos por período, más activos
- **Productos**: Más vendidos, ingresos por producto
- **Premios**: Más canjeados, ratio de validación

---

## 🎨 INTERFAZ DE USUARIO Y NAVEGACIÓN

### Header Contextual (AuthHeader.tsx):
```typescript
// Para USER
<Link href="/rewards">🎁 Ver Premios</Link>
<Link href="/history">📋 Mis Premios</Link>

// Para ADMIN  
<Link href="/admin">📊 Panel</Link>
<Link href="/admin/orders">🛒 Órdenes</Link>
<Link href="/admin/users">👥 Usuarios</Link>
<Link href="/admin/rewards">🎯 Premios</Link>
<Link href="/admin/ranking">🏆 Ranking</Link>
<Link href="/admin/validate">✅ Validar</Link>
<Link href="/admin/config">⚙️ Config</Link>
```

### Diseño Visual:
- **Color primario**: Orange-500 (#f97316)
- **Degradados**: from-orange-50 to-white
- **Iconos**: Emojis + SVG para acciones
- **Estados**: Loading spinners, success/error alerts
- **Responsive**: Mobile-first con Tailwind breakpoints

---

## 🔌 API ENDPOINTS COMPLETOS

### Autenticación:
- `POST /api/auth/login` → Iniciar sesión
- `POST /api/auth/register` → Registrar usuario
- `POST /api/auth/logout` → Cerrar sesión
- `GET /api/auth/me` → Obtener usuario actual

### Usuario:
- `GET /api/user/history` → Historial de compras y canjes
- `GET /api/rewards` → Premios disponibles
- `POST /api/rewards/claim` → Canjear premio

### Administración:
- `GET /api/admin/analytics` → Estadísticas del sistema
- `GET /api/admin/users` → Lista de usuarios
- `PATCH /api/admin/users` → Cambiar rol de usuario
- `GET /api/admin/orders` → Buscar usuario por DNI
- `POST /api/admin/orders` → Crear nueva orden
- `GET /api/admin/products` → Lista de productos
- `POST /api/admin/products` → Crear producto
- `PUT /api/admin/products/[id]` → Actualizar producto
- `GET /api/admin/rewards` → Lista de premios
- `POST /api/admin/rewards` → Crear premio
- `PUT /api/admin/rewards/[id]` → Actualizar premio
- `GET /api/admin/rewards/validate` → Premios pendientes de validación
- `PATCH /api/admin/rewards/validate` → Validar premio
- `GET /api/admin/ranking` → Ranking de usuarios por puntos históricos
- `GET /api/admin/config` → Configuración del sistema
- `POST /api/admin/config` → Actualizar configuración

---

## 🚀 PATRONES DE DESARROLLO Y MEJORES PRÁCTICAS

### Manejo de Estado:
```typescript
// Patrón de fetch con loading
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

const fetchData = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/endpoint');
    const result = await response.json();
    if (result.success) setData(result.data);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};
```

### Transacciones de Base de Datos:
```typescript
// Para operaciones críticas
await prisma.$transaction(async (tx) => {
  // Crear orden
  const order = await tx.order.create({...});
  // Crear items
  await tx.orderItem.createMany({...});
  // Actualizar puntos usuario
  await tx.user.update({...});
});
```

### Gestión de Errores:
- **Client-side**: Try-catch con feedback visual
- **Server-side**: Respuestas estructuradas `{ success: boolean, error?: string, data?: any }`
- **Validación**: Joi/Zod schemas en endpoints críticos

---

## 📋 CONFIGURACIONES DEL SISTEMA

### Variables de Entorno:
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="secret-key"
NEXTAUTH_SECRET="nextauth-secret"
NODE_ENV="development|production"
```

### Configuraciones Dinámicas (SystemConfig):
- `pointsPerPeso`: "1" → 1 peso = 1 punto
- `systemName`: "Chipa&Co Fidelización"
- `welcomeMessage`: "¡Bienvenido a nuestro sistema de puntos!"

---

## 🐛 DEBUGGING Y TROUBLESHOOTING

### Problemas Comunes:
1. **Header no actualiza** → Verificar AuthContext.checkAuth()
2. **Rutas protegidas fallan** → Revisar middleware.ts y cookies
3. **Puntos no se actualizan** → Verificar transacciones en órdenes
4. **Premios no aparecen** → Verificar isActive y stock
5. **Build errors** → Imports faltantes, tipos incorrectos

### Logs Importantes:
- Errores de autenticación en consola del navegador
- Errores de Prisma en terminal del servidor
- Network requests fallidos en DevTools

---

## 🎯 CASOS DE USO ESPECÍFICOS

### Caso 1: Cliente Nuevo
1. Admin crea orden con DNI no registrado → Error
2. Redirect a registro manual o automático
3. Crear User → Crear Order → Asignar puntos

### Caso 2: Premio Sin Stock
1. Usuario intenta canjear → Validación client-side
2. Si pasa → Server valida stock en transacción
3. Error controlado si stock insuficiente

### Caso 3: Admin Valida Premio
1. RewardClaim en PENDING → Admin ve en lista
2. Admin decide: APPROVED/REJECTED
3. Usuario ve estado actualizado en tiempo real

---

## 📈 MÉTRICAS DE PERFORMANCE

### Objetivos:
- **Carga inicial**: < 2 segundos
- **API responses**: < 500ms promedio
- **DB queries**: Optimizadas con índices
- **Bundle size**: Optimizado con tree-shaking

### Monitoreo:
- Next.js Analytics para Core Web Vitals
- Prisma query logging en desarrollo
- Error boundary para crashes de React

---

## 🔮 ROADMAP Y EXTENSIBILIDAD

### Funcionalidades Futuras:
- Notificaciones push para validaciones
- Códigos QR para premios
- Integración con sistemas de punto de venta
- Dashboard de métricas en tiempo real
- API REST para integraciones externas

### Arquitectura Escalable:
- Microservicios para separar concerns
- Redis para caching de sesiones
- WebSockets para actualizaciones en tiempo real
- CDN para assets estáticos

---

**🎯 ESTADO ACTUAL**: Sistema completamente funcional con todas las características implementadas. Puntos históricos, validación de premios, y navegación contextual por roles funcionando correctamente. Sin barras superiores duplicadas. Interfaz limpia y responsive.
