# 🚀 Instrucciones de Deployment Railway + Vercel

**Sistema Forense Automático - Mil Sabores Pastelería**

> **✅ FIX APLICADO:** Logback Railway-compatible + Logger frontend fix (Diciembre 2025)  
> Commits: `9c71310` (fix Logback) + `315a1da` (docs) + `PENDIENTE` (logger.js fix)

> **🔥 PROBLEMA CRÍTICO DETECTADO:**  
> - ❌ Vercel logs no se envían a Railway: `POST http://localhost:8080/api/logs ERR_CONNECTION_REFUSED`  
> - ❌ Variantes: 0 detectado en Railway logs  
> - ✅ **SOLUCIONADO:** logger.js ahora usa `VITE_API_URL` (no `VITE_API_BASE_URL`)

---

## 📋 Tabla de Contenidos

1. [Variables de Entorno Railway (Backend)](#1-variables-de-entorno-railway-backend)
2. [Variables de Entorno Vercel (Frontend)](#2-variables-de-entorno-vercel-frontend)
3. [Deployment Backend Railway](#3-deployment-backend-railway)
4. [Deployment Frontend Vercel](#4-deployment-frontend-vercel)
5. [Verificación Post-Deployment](#5-verificación-post-deployment)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Variables de Entorno Railway (Backend)

Railway Dashboard → Tu proyecto → **Variables**

### ✅ Requeridas (CRITICAL)

```bash
# Spring Boot Profile
SPRING_PROFILES_ACTIVE=production

# PostgreSQL Database (Supabase)
DATABASE_URL=jdbc:postgresql://aws-0-us-west-1.pooler.supabase.com:6543/postgres?user=postgres.xxxxx&password=xxxxx

# Supabase Storage
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Authentication
JWT_SECRET=tu_clave_secreta_super_segura_minimo_32_caracteres_alfanumericos
JWT_EXPIRATION=86400000

# CORS (actualizar con tu URL Vercel)
ALLOWED_ORIGINS=https://tu-app.vercel.app,http://localhost:5173
```

**⚠️ IMPORTANTE:**
- `DATABASE_URL`: Copiar desde **Supabase → Settings → Database → Connection String (JDBC)**
- `SUPABASE_KEY`: Usar la clave `anon` public (NO `service_role`)
- `JWT_SECRET`: Generar con `openssl rand -base64 32`
- `ALLOWED_ORIGINS`: **Sin trailing slash** (`/` al final)

### ⚡ Optimizadas (PERFORMANCE)

```bash
# HikariCP Connection Pool
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=20
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=5
SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT=30000
SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT=600000
SPRING_DATASOURCE_HIKARI_MAX_LIFETIME=1800000
SPRING_DATASOURCE_HIKARI_LEAK_DETECTION_THRESHOLD=60000

# JVM Memory (Railway 512MB)
JAVA_TOOL_OPTIONS=-Xmx400m -Xms200m -XX:MaxMetaspaceSize=100m

# ⚠️ FIX VARIANTES: 0 (Railway Bug LazyInitializationException)
# Agregar SOLO si /actuator/health muestra lazyLoadingWorking: false
SPRING_JPA_OPEN_IN_VIEW=true
```

### 🔧 Debugging (OPCIONAL - Solo desarrollo)

```bash
# Activar SOLO si necesitas logs detallados
LOGGING_LEVEL_COM_MILSABORES_BACKEND=DEBUG
SPRING_JPA_SHOW_SQL=true
```

---

## 2. Variables de Entorno Vercel (Frontend)

Vercel Dashboard → Tu proyecto → **Settings** → **Environment Variables**

### ✅ Production

```bash
# Backend API URL (actualizar con tu URL Railway)
VITE_API_URL=https://pasteleriafullstackfinal-production.up.railway.app/api

# Habilitar logs en producción
VITE_ENABLE_LOGS=true

# Supabase (mismo que Railway)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 🛠️ Preview & Development

```bash
# Local development
VITE_API_URL=http://localhost:8080/api
VITE_ENABLE_LOGS=true
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE:**
- Reemplazar `xxxxx` con tus valores reales de Supabase
- Actualizar `VITE_API_URL` con tu URL Railway generada

---

## 3. Deployment Backend Railway

### Método 1: GitHub Integration (RECOMENDADO)

**1. Conectar GitHub a Railway:**

```bash
Railway Dashboard → New Project → Deploy from GitHub repo
```

Seleccionar: `TomasValdivia20/PasteleriaFullStackFinal`

**2. Configurar Build:**

Railway detecta automáticamente Maven. Si no:

```bash
# Settings → Build
Build Command: ./mvnw clean package -DskipTests
Start Command: java -jar target/backend-0.0.1-SNAPSHOT.jar
Root Directory: /Backend
```

**3. Agregar Variables de Entorno:**

Copiar todas las variables de la sección 1.

**4. Deploy Automático:**

Railway despliega automáticamente cuando:
- Push a rama `master`
- Pull request merged

**⏱️ Tiempo esperado:** 5-7 minutos

---

### Método 2: Railway CLI (Manual)

**1. Instalar Railway CLI:**

```powershell
npm install -g @railway/cli
```

**2. Login:**

```bash
railway login
```

**3. Link Project:**

```bash
cd Backend
railway link
```

**4. Deploy:**

```bash
railway up
```

---

## 4. Deployment Frontend Vercel

### Método 1: GitHub Integration (RECOMENDADO)

**1. Conectar GitHub a Vercel:**

```bash
Vercel Dashboard → Add New → Import Project
```

Seleccionar: `TomasValdivia20/PasteleriaFullStackFinal`

**2. Configurar Framework:**

```
Framework Preset: Vite
Root Directory: Frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**3. Agregar Variables de Entorno:**

Copiar todas las variables de la sección 2 en:

```
Settings → Environment Variables → Add
```

**Importante:** Seleccionar **Production**, **Preview**, y **Development** para cada variable.

**4. Deploy:**

```bash
Vercel → Deploy
```

**⏱️ Tiempo esperado:** 2-3 minutos

---

### Método 2: Vercel CLI (Manual)

**1. Instalar Vercel CLI:**

```powershell
npm install -g vercel
```

**2. Login:**

```bash
vercel login
```

**3. Deploy:**

```bash
cd Frontend
vercel --prod
```

Responder interactivamente:
- Framework: `Vite`
- Build: `npm run build`
- Output: `dist`

---

## 5. Verificación Post-Deployment

### ✅ Checklist Backend (Railway)

**1. Health Check Básico:**

```powershell
curl https://tu-app.up.railway.app/actuator/health
```

**Esperado:**
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" },
    "hibernate": {
      "status": "UP",
      "details": {
        "lazyLoadingWorking": true  // ✅ CRITICAL
      }
    }
  }
}
```

**❌ Si `lazyLoadingWorking: false`** → Ver [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md#2-variantes-0---lazyinitializationexception)

---

**2. Test API Productos:**

```powershell
curl https://tu-app.up.railway.app/api/productos/1
```

**Esperado:**
```json
{
  "id": 1,
  "nombre": "Torta de Chocolate",
  "variantes": [    // ✅ DEBE TENER contenido
    {
      "id": 1,
      "precio": 15000,
      "cantidadPersonas": 8
    }
  ],
  "imagenes": [     // ✅ DEBE TENER contenido
    {
      "id": 1,
      "url": "https://xxxxx.supabase.co/storage/..."
    }
  ]
}
```

**❌ Si variantes/imagenes están vacías** → Ver [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md#2-variantes-0---lazyinitializationexception)

---

**3. Verificar Logs Railway:**

Railway Dashboard → **Deployments** → Latest → **View Logs**

**Buscar:**
```
✅ Started BackendApplication in X.XXX seconds
✅ Tomcat started on port(s): 8080
✅ Logging system initialized
```

**❌ Si ves errores Logback** → Ver [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md#1-crash-logback-configuration-error)

---

### ✅ Checklist Frontend (Vercel)

**1. Navegación Básica:**

Abrir: `https://tu-app.vercel.app`

**Verificar:**
- ✅ Página carga sin errores
- ✅ Productos se muestran con imágenes
- ✅ Navegación funciona (Home → Catálogo → Producto Detail)
- ✅ No hay errores CORS en consola (F12)

---

**2. Test Conectividad Backend:**

```javascript
// Vercel app → F12 → Console
fetch('https://tu-app.up.railway.app/api/productos')
  .then(r => r.json())
  .then(d => console.log('Productos:', d.length))
```

**Esperado:** `Productos: X` (número > 0)

**❌ Si falla** → Ver [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md#5-frontend-no-conecta-con-backend)

---

**3. Verificar Logging Frontend:**

Vercel app → Realizar acción (ej: agregar producto al carrito)

Railway logs debería mostrar:
```
[FRONTEND] [correlationId=a1b2c3d4] [session=...] [url=https://...] User added product to cart
```

✅ Logging end-to-end funcionando

---

## 6. Troubleshooting

### 🔴 Railway Crashea con "Logback configuration error"

**Síntoma:**
```log
ERROR in ch.qos.logback.core.pattern.parser.Compiler - There is no conversion class registered for [clr]
```

**Fix:**
✅ **YA APLICADO** en commit `9c71310`

Si persiste:
```bash
git pull origin master
railway up --force
```

Ver: [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md#1-crash-logback-configuration-error)

---

### 🔴 Variantes/Imágenes Vacías (Variantes: 0)

**Síntoma:**
```json
{ "variantes": [], "imagenes": [] }
```

**Fix rápido:**

**Opción 1:** Agregar variable Railway
```bash
SPRING_JPA_OPEN_IN_VIEW=true
```

**Opción 2:** Clear Railway Build Cache
```
Railway Dashboard → Settings → Clear Build Cache → Redeploy
```

Ver: [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md#2-variantes-0---lazyinitializationexception)

---

### 🔴 Frontend No Conecta con Backend

**Síntoma:**
```
Failed to fetch
ERR_CONNECTION_REFUSED
```

**Checklist:**

1. **CORS habilitado** en backend:
   ```bash
   # Railway variable
   ALLOWED_ORIGINS=https://tu-app.vercel.app
   ```

2. **URL correcta** en Vercel:
   ```bash
   # Vercel variable
   VITE_API_URL=https://tu-app.up.railway.app/api
   ```

3. **Railway NO sleeping:**
   - Configurar UptimeRobot: https://uptimerobot.com
   - URL: `https://tu-app.up.railway.app/actuator/health`
   - Interval: 5 minutos

Ver: [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md#5-frontend-no-conecta-con-backend)

---

### 🔴 Frontend Logs No Se Envían a Railway

**Síntoma:**
```log
Vercel console:
POST http://localhost:8080/api/logs net::ERR_CONNECTION_REFUSED
[Logger] Failed to send logs to backend
```

**Causa:** `logger.js` usaba variable incorrecta `VITE_API_BASE_URL` (no existe)

**Fix:**

1. **Verificar fix aplicado en logger.js:**
```javascript
// ✅ CORRECTO
backendUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
```

2. **Verificar variable Vercel:**
```bash
VITE_API_URL=https://pasteleriafullstackfinal-production.up.railway.app/api
```

3. **Redeploy Vercel:**
```bash
vercel --prod
```

**Validación:**
- Abrir Vercel app → F12 Console
- Buscar `POST https://tu-railway-app.up.railway.app/api/logs` (NO localhost)
- Railway logs deben mostrar `[FRONTEND]` categoría

---

### 🔴 Variantes: 0 / Imagenes: 0

**Síntoma:**
```log
Railway:
📦 [GET] /api/productos/1 - Variantes: 0, Imagenes: 0

Frontend:
✅ Producto cargado: {variantes: [], imagenes: []}
```

**Causa:** Railway bug LazyInitializationException (cache no respeta `@Fetch(EAGER)`)

**Fix:**

1. **Health check verificación:**
```bash
curl https://tu-railway-app.up.railway.app/actuator/health | jq .
```

Expected: `"lazyLoadingWorking": false`

2. **Agregar variable Railway:**
```bash
SPRING_JPA_OPEN_IN_VIEW=true
```

3. **Redeploy Railway:** Push a GitHub o Railway CLI

**Validación:**
```bash
# Test API
curl https://tu-railway-app.up.railway.app/api/productos/1 | jq '.variantes | length'
# Expected: > 0 (no vacío)

# Health check
curl https://tu-railway-app.up.railway.app/actuator/health | jq '.components.hibernate.details.lazyLoadingWorking'
# Expected: true
```

Ver detalles: [RAILWAY_TROUBLESHOOTING.md - Variantes 0](./RAILWAY_TROUBLESHOOTING.md#2-variantes-0---lazyinitializationexception)

---

### 🔴 Connection Pool Exhausted

**Síntoma:**
```log
HikariPool - Connection is not available, request timed out
```

**Fix:**

Railway variables:
```bash
HIKARI_MAX_POOL_SIZE=20
HIKARI_LEAK_DETECTION_THRESHOLD=60000
```

Ver: [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md#3-database-connection-pool-exhausted)

---

### 🔴 Memory Leak / Out of Memory

**Síntoma:**
```log
java.lang.OutOfMemoryError: Java heap space
```

**Fix:**

Railway variable:
```bash
JAVA_TOOL_OPTIONS=-Xmx400m -Xms200m -XX:MaxMetaspaceSize=100m
```

Ver: [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md#4-memory-leak---out-of-memory)

---

## 📚 Recursos Adicionales

### Documentación

- **[RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md)** - Guía troubleshooting completa
- **[RAILWAY_CONFIGURACION_FINAL.md](./RAILWAY_CONFIGURACION_FINAL.md)** - Variables detalladas + checklist
- **[DEBUGGING_RAILWAY.md](./DEBUGGING_RAILWAY.md)** - Sistema de logging profundo
- **[RESUMEN_LOGGING_SISTEMA.md](./RESUMEN_LOGGING_SISTEMA.md)** - Arquitectura forense

### Comandos Útiles

**Railway Logs (CLI):**
```bash
railway logs --tail 100
railway logs | Select-String "ERROR"
railway logs | Select-String "correlationId=a1b2c3d4"
```

**Vercel Logs (CLI):**
```bash
vercel logs
vercel logs --follow
```

**Health Check Continuo:**
```bash
# PowerShell
while ($true) { 
  $status = (curl https://tu-app.up.railway.app/actuator/health).StatusCode
  Write-Host "$(Get-Date) - Status: $status"
  Start-Sleep -Seconds 30
}
```

### Enlaces

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Spring Boot Actuator**: https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html
- **Logback Manual**: https://logback.qos.ch/manual/

---

## 🆘 Soporte

**Si ninguna solución funciona:**

1. **Descarga logs completos:**
   - Railway: Dashboard → Logs → Download
   - Vercel: CLI → `vercel logs > vercel.log`

2. **Verifica Health Check:**
   ```bash
   curl https://tu-app.up.railway.app/actuator/health | jq .
   ```

3. **Consulta troubleshooting:**
   - [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md)

4. **Contacto:**
   - Railway Discord: https://discord.gg/railway
   - Vercel Support: https://vercel.com/support

---

**Sistema Forense Automático - Mil Sabores Pastelería**  
**Última actualización:** Diciembre 2025  
**Status:** ✅ Production Ready
