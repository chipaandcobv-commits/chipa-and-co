# Configuración de Cloudinary

## Pasos para configurar Cloudinary

### 1. Crear cuenta en Cloudinary
1. Ve a [cloudinary.com](https://cloudinary.com)
2. Crea una cuenta gratuita
3. Una vez en el dashboard, encontrarás tus credenciales

### 2. Configurar variables de entorno
Agrega las siguientes variables a tu archivo `.env.local`:

```env
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
```

### 3. Obtener las credenciales
En el dashboard de Cloudinary:
- **Cloud Name**: Se encuentra en la parte superior del dashboard
- **API Key**: En la sección "Product Environment Credentials"
- **API Secret**: En la misma sección (manténlo privado)

### 4. Características implementadas
- ✅ Carga de imágenes a Cloudinary
- ✅ Validación de tipos de archivo (JPEG, PNG, WebP)
- ✅ Validación de tamaño (máximo 5MB)
- ✅ Optimización automática de imágenes
- ✅ Redimensionamiento automático (máximo 800x600)
- ✅ Almacenamiento en carpeta "rewards"
- ✅ Preview de imagen antes de subir
- ✅ Interfaz drag & drop

### 5. Uso
1. En la gestión de premios, haz clic en "Nuevo Premio"
2. Completa los campos requeridos
3. En la sección "Imagen del Premio", haz clic para seleccionar un archivo
4. Una vez seleccionado, haz clic en "Subir Imagen"
5. La imagen se subirá automáticamente a Cloudinary
6. Guarda el premio

### 6. Límites de la cuenta gratuita
- 25 GB de almacenamiento
- 25 GB de ancho de banda por mes
- 25,000 transformaciones por mes

### 7. Seguridad
- Las imágenes se almacenan en una carpeta específica ("rewards")
- Se aplican transformaciones automáticas para optimización
- Validación estricta de tipos y tamaños de archivo

