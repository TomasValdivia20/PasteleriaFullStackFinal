# 🚀 Guía Completa de Deployment - Pastelería Mil Sabores

## 📋 Tabla de Contenidos
1. [Backend - Railway](#backend---railway)
2. [Frontend - Vercel](#frontend---vercel)
3. [Configuración Post-Deploy](#configuración-post-deploy)
4. [Verificación y Testing](#verificación-y-testing)

---

## 🔧 Backend - Railway

### Paso 1: Preparar el Repositorio

Asegúrate de que todos los cambios estén commiteados:

```bash
cd Backend
git add .
git commit -m "feat: configuración para deployment en Railway"
git push
```

### Paso 2: Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Inicia sesión con GitHub
3. Click en **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Elige el repositorio del proyecto
6. Railway detectará automáticamente que es un proyecto Maven/Spring Boot

### Paso 3: Configurar Base de Datos MySQL

1. En tu proyecto de Railway, click en **"New"** → **"Database"** → **"Add MySQL"**
2. Railway creará automáticamente una instancia MySQL
3. Anota las credenciales que se generan automáticamente

### Paso 4: Configurar Variables de Entorno

En la sección **Variables** del servicio backend, agrega:

```bash
# Perfil de Spring Boot
SPRING_PROFILES_ACTIVE=production

# Base de Datos (Railway las provee automáticamente al agregar MySQL)
DATABASE_URL=jdbc:mysql://${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=${MYSQLUSER}
DB_PASSWORD=${MYSQLPASSWORD}

# Frontend URL (actualizar después de desplegar en Vercel)
FRONTEND_URL=https://tu-app.vercel.app

# Puerto (Railway lo asigna automáticamente)
PORT=${{PORT}}
```

**IMPORTANTE**: Reemplaza las variables `${MYSQL*}` con los valores reales que Railway generó para tu base de datos MySQL, o usa directamente las variables de referencia de Railway.

### Paso 5: Configurar Build

Railway configurará automáticamente:

```bash
Build Command: ./mvnw clean package -DskipTests
Start Command: java -Dserver.port=$PORT -Dspring.profiles.active=production -jar target/backend-0.0.1-SNAPSHOT.jar
```

Si Railway no detecta esto automáticamente, puedes configurarlo manualmente en **Settings** → **Build** y **Deploy**.

### Paso 6: Deploy

1. Railway comenzará el build automáticamente
2. El proceso toma ~5-7 minutos la primera vez
3. Una vez completado, Railway te dará una URL pública: `https://tu-backend.railway.app`

### Paso 7: Verificar Backend

```bash
# Health check de categorías
curl https://tu-backend.railway.app/api/categorias

# Health check de productos  
curl https://tu-backend.railway.app/api/productos
```

---

## 🎨 Frontend - Vercel

### Paso 1: Preparar el Repositorio

```bash
cd Frontend
git add .
git commit -m "feat: configuración para deployment en Vercel"
git push
```

### Paso 2: Importar Proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con GitHub
3. Click en **"Add New Project"**
4. Selecciona el repositorio del frontend
5. Vercel detectará automáticamente que es un proyecto Vite

### Paso 3: Configurar Build Settings

Vercel configurará automáticamente:

```bash
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x o superior
```

### Paso 4: Configurar Variables de Entorno

En la sección **Environment Variables**, agrega:

```bash
VITE_API_URL=https://tu-backend.railway.app/api
```

**IMPORTANTE**: 
- Reemplaza `tu-backend.railway.app` con la URL real de tu backend en Railway
- La variable DEBE llamarse exactamente `VITE_API_URL`
- DEBE incluir `/api` al final

**Configuración por Ambiente** (opcional):

- **Production**: `https://tu-backend.railway.app/api`
- **Preview**: `https://tu-backend-staging.railway.app/api` (si tienes ambiente staging)
- **Development**: No es necesario configurar (usa `.env.local`)

### Paso 5: Deploy

1. Click en **"Deploy"**
2. Vercel comenzará el build automáticamente
3. El proceso toma ~2-3 minutos
4. Una vez completado, Vercel te dará una URL: `https://tu-app.vercel.app`

---

## ⚙️ Configuración Post-Deploy

### Actualizar CORS en Backend

Una vez que tengas la URL de Vercel, debes actualizar la variable de entorno en Railway:

1. Ve a tu proyecto Backend en Railway
2. En **Variables**, actualiza:

```bash
FRONTEND_URL=https://tu-app-real.vercel.app
```

3. Railway hará re-deploy automáticamente

### Verificar Conectividad

Abre tu app en Vercel y verifica en la consola del navegador:

```javascript
// Deberías ver estos logs
🚀 [APP INIT] Iniciando aplicación
📍 [ROUTING] BasePath: /
🌍 [ENV] MODE: production
🔗 [API] URL: https://tu-backend.railway.app/api

// Al navegar a categorías/productos
📤 [REQUEST] ...
📥 [RESPONSE SUCCESS] ...
```

---

## ✅ Verificación y Testing

### Backend (Railway)

```bash
# Test de endpoints
curl -X GET https://tu-backend.railway.app/api/categorias
curl -X GET https://tu-backend.railway.app/api/productos
curl -X GET https://tu-backend.railway.app/api/productos/1
curl -X GET https://tu-backend.railway.app/api/productos/categoria/1

# Verificar CORS
curl -H "Origin: https://tu-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS https://tu-backend.railway.app/api/categorias
```

### Frontend (Vercel)

Navega a:
- `https://tu-app.vercel.app/` - Home
- `https://tu-app.vercel.app/categorias` - Categorías
- `https://tu-app.vercel.app/productos` - Productos
- `https://tu-app.vercel.app/producto/1` - Detalle de producto

---

## 🔄 Re-Deploy

### Backend (Railway)

Railway hace re-deploy automático cuando:
- Haces push a la rama principal
- Cambias variables de entorno

Para forzar re-deploy:
1. Ve a **Deployments**
2. Click en los tres puntos del último deployment
3. Selecciona **"Redeploy"**

### Frontend (Vercel)

Vercel hace re-deploy automático cuando:
- Haces push a la rama principal (production)
- Haces push a cualquier rama (preview)
- Cambias variables de entorno

Para forzar re-deploy:
1. Ve a **Deployments**
2. Click en los tres puntos del último deployment
3. Selecciona **"Redeploy"**

---

## 🐛 Troubleshooting

### Error: Backend no responde (502/503)

**Posibles causas:**
- El backend está iniciando (espera 2-3 minutos)
- Error en el build (revisa logs en Railway)
- Base de datos no conectada (verifica variables de entorno)

**Solución:**
1. Ve a Railway → **Deployments** → **View Logs**
2. Busca errores de conexión a BD o startup
3. Verifica que todas las variables de entorno estén configuradas

### Error: CORS en producción

**Síntoma:** Frontend no puede hacer peticiones al backend

**Solución:**
1. Verifica que `FRONTEND_URL` en Railway contenga la URL exacta de Vercel
2. No incluyas `/` al final de `FRONTEND_URL`
3. Fuerza re-deploy del backend en Railway

### Error: Variables de entorno no funcionan

**Frontend (Vercel):**
- Las variables DEBEN empezar con `VITE_`
- Después de cambiarlas, debes hacer re-deploy
- Verifica en build logs que se están cargando

**Backend (Railway):**
- Después de cambiarlas, Railway hace re-deploy automático
- Verifica en logs que se están leyendo correctamente

### Error: Assets no cargan (404)

**Solución:**
- Verifica que las imágenes estén en `Frontend/public/assets/img/`
- Los paths en el código deben ser: `/assets/img/nombre.jpg`
- Haz re-deploy del frontend

---

## 📊 Monitoreo

### Railway (Backend)

- **Logs en tiempo real**: Railway → Deployments → View Logs
- **Métricas**: Railway → Metrics (CPU, RAM, Network)
- **Base de datos**: Railway → MySQL → Metrics

### Vercel (Frontend)

- **Analytics**: Vercel → Analytics (visitas, performance)
- **Logs**: Vercel → Deployments → Functions Logs
- **Performance**: Vercel → Speed Insights

---

## 🔐 Seguridad Post-Deploy

### Backend

✅ CORS configurado solo para dominios específicos
✅ Variables sensibles en variables de entorno
✅ HTTPS habilitado por Railway
✅ Error stack traces deshabilitados en producción

### Frontend

✅ Variables de entorno seguras (solo `VITE_*` expuestas)
✅ HTTPS habilitado por Vercel
✅ Headers de seguridad configurados en `vercel.json`
✅ Console.logs eliminados en build de producción

---

## 📝 Resumen de URLs

Después del deployment, tendrás:

- **Backend API**: `https://tu-backend.railway.app/api`
- **Frontend**: `https://tu-app.vercel.app`
- **MySQL**: Interno en Railway (no expuesto públicamente)

**Endpoints disponibles:**

- `GET /api/categorias` - Listar categorías
- `GET /api/categorias/{id}` - Obtener categoría
- `POST /api/categorias` - Crear categoría
- `PUT /api/categorias/{id}` - Actualizar categoría
- `DELETE /api/categorias/{id}` - Eliminar categoría
- `GET /api/productos` - Listar productos
- `GET /api/productos/{id}` - Obtener producto
- `GET /api/productos/categoria/{id}` - Productos por categoría
- `POST /api/productos` - Crear producto
- `PUT /api/productos/{id}` - Actualizar producto
- `DELETE /api/productos/{id}` - Eliminar producto

---

## 🎉 ¡Listo!

Tu aplicación full stack está ahora desplegada y lista para usar en producción.

**Próximos pasos:**
1. Configurar dominio personalizado (opcional)
2. Configurar monitoreo y alertas
3. Implementar CI/CD automático
4. Configurar backups de base de datos
