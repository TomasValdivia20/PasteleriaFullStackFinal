# 🚀 INSTRUCCIONES RAILWAY Y VERCEL - Configuración Definitiva

> **Guía completa para configurar variables de entorno y deployment en Railway (Backend) y Vercel (Frontend)**

---

## 📋 TABLA DE CONTENIDOS

1. [Railway - Backend Spring Boot](#railway-backend-spring-boot)
2. [Vercel - Frontend React](#vercel-frontend-react)
3. [Supabase - Database y Storage](#supabase-database-y-storage)
4. [Verificación Final](#verificación-final)

---

## 🚂 RAILWAY - Backend Spring Boot

### 📍 Acceder a Railway Dashboard

1. Ir a: https://railway.app/dashboard
2. Iniciar sesión con GitHub
3. Seleccionar proyecto: **PasteleriaFullStackFinal**
4. Click en servicio: **Backend**

### ⚙️ Configurar Variables de Entorno

**Ubicación**: Backend → **Variables** (pestaña)

#### 1️⃣ Database (Supabase Connection)

```bash
SUPABASE_DB_PASSWORD=PasteleriaMilSabores123!
```

**Descripción**: Contraseña para conectar con PostgreSQL en Supabase  
**Uso**: `application-production.properties` usa esta variable

---

#### 2️⃣ Storage (Supabase Storage)

```bash
SUPABASE_URL=https://dzbeucldelrjdjprfday.supabase.co
```

**Descripción**: URL base del proyecto Supabase  
**Uso**: ImagenProductoService para subir/eliminar imágenes

```bash
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6YmV1Y2xkZWxyamRqcHJmZGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3NTYzODMsImV4cCI6MjA0ODMzMjM4M30.pR-sVEKd9qmI6V8TYrY96KwQq8r3e_IXVBi-kQ_Tl1Y
```

**Descripción**: API Key pública (anon) de Supabase  
**Uso**: Autenticación para Storage API

```bash
SUPABASE_BUCKET=pasteles
```

**Descripción**: Nombre del bucket de Storage  
**Uso**: Carpeta donde se guardan imágenes de productos

---

#### 3️⃣ Security (JWT)

```bash
JWT_SECRET=milsabores-secret-key-super-secure-2024-production-final
```

**Descripción**: Clave secreta para firmar tokens JWT  
**⚠️ IMPORTANTE**: Cambiar en producción real por clave más robusta

```bash
JWT_EXPIRATION=86400000
```

**Descripción**: Tiempo de expiración del token (en milisegundos)  
**Valor**: 86400000 ms = 24 horas

---

#### 4️⃣ CORS (Frontend Access)

```bash
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app
```

**Descripción**: URLs permitidas para peticiones CORS  
**Formato**: Separadas por comas, soporta wildcards  
**Uso**: `SecurityConfig.java` permite estas origins

---

#### 5️⃣ Spring Profile

```bash
SPRING_PROFILES_ACTIVE=production
```

**Descripción**: Activa perfil de producción  
**Efecto**: Spring usa `application-production.properties`

---

#### 6️⃣ JVM Options (Railway Memory Limit)

```bash
JAVA_TOOL_OPTIONS=-Xmx400m -Xms200m -XX:MaxMetaspaceSize=100m -XX:+UseG1GC
```

**Descripción**: Configuración JVM para Railway (512MB plan)  
**Breakdown**:
- `-Xmx400m`: Heap máximo 400MB
- `-Xms200m`: Heap inicial 200MB
- `-XX:MaxMetaspaceSize=100m`: Metaspace máximo 100MB
- `-XX:+UseG1GC`: Garbage Collector G1 (mejor para baja latencia)

---

### 🔧 Configurar Deployment

**Ubicación**: Backend → **Settings** → **Deploy**

#### Root Directory
```
/Backend
```

**Descripción**: Carpeta donde está el código Spring Boot

#### Build Command
```bash
mvn clean package -DskipTests
```

**Descripción**: Compila y empaqueta JAR sin ejecutar tests

#### Start Command
```bash
java $JAVA_TOOL_OPTIONS -jar target/backend-0.0.1-SNAPSHOT.jar
```

**Descripción**: Ejecuta JAR con opciones JVM configuradas

---

### 🌐 Configurar Networking

**Ubicación**: Backend → **Settings** → **Networking**

#### Public Networking
- **Habilitado**: ✅ ON
- **Generate Domain**: Click para generar dominio público

#### URL generada:
```
https://pasteleriafullstackfinal-production.up.railway.app
```

**Copiar esta URL** → Se usará en Vercel como `VITE_API_BASE_URL`

---

### 📝 Resumen Railway Variables

| Variable | Valor | Uso |
|----------|-------|-----|
| `SUPABASE_DB_PASSWORD` | `PasteleriaMilSabores123!` | Database connection |
| `SUPABASE_URL` | `https://dzbeucldelrjdjprfday.supabase.co` | Storage API |
| `SUPABASE_KEY` | `eyJhbGci...` | Storage auth |
| `SUPABASE_BUCKET` | `pasteles` | Storage folder |
| `JWT_SECRET` | `milsabores-secret-key...` | JWT signing |
| `JWT_EXPIRATION` | `86400000` | Token expiry (24h) |
| `FRONTEND_URL` | `https://pasteleria-full-stack-final.vercel.app,...` | CORS |
| `SPRING_PROFILES_ACTIVE` | `production` | Spring profile |
| `JAVA_TOOL_OPTIONS` | `-Xmx400m -Xms200m ...` | JVM config |

**Total**: **9 variables**

---

## ▲ VERCEL - Frontend React

### 📍 Acceder a Vercel Dashboard

1. Ir a: https://vercel.com/dashboard
2. Iniciar sesión con GitHub
3. Seleccionar proyecto: **pasteleria-full-stack-final**

### ⚙️ Configurar Variables de Entorno

**Ubicación**: pasteleria-full-stack-final → **Settings** → **Environment Variables**

#### 1️⃣ Backend API URL

```bash
VITE_API_BASE_URL=https://pasteleriafullstackfinal-production.up.railway.app
```

**Descripción**: URL del backend desplegado en Railway  
**Uso**: `src/api.js` usa esta variable como base para todas las peticiones

**⚠️ IMPORTANTE**:
- **SIN** barra final `/`
- Debe coincidir con el dominio de Railway
- Vite requiere prefijo `VITE_` para variables expuestas al cliente

---

#### 2️⃣ Environment

```bash
VITE_ENVIRONMENT=production
```

**Descripción**: Indica entorno de producción  
**Uso**: Condicionales en código (ej: habilitar/deshabilitar logs)

---

### 🔧 Configurar Build Settings

**Ubicación**: pasteleria-full-stack-final → **Settings** → **General**

#### Framework Preset
```
Vite
```

**Descripción**: Vercel detecta automáticamente Vite

#### Root Directory
```
Frontend
```

**Descripción**: Carpeta donde está `package.json`

#### Build Command
```bash
npm run build
```

**Descripción**: Ejecuta `vite build` (configurado en `package.json`)

#### Output Directory
```
dist
```

**Descripción**: Carpeta generada por Vite con archivos optimizados

#### Install Command
```bash
npm install
```

**Descripción**: Instala dependencias (por defecto)

---

### 🌐 Configurar Dominio

**Ubicación**: pasteleria-full-stack-final → **Settings** → **Domains**

#### Dominio principal:
```
https://pasteleria-full-stack-final.vercel.app
```

**Este dominio debe estar en**:
- Railway variable `FRONTEND_URL` (para CORS)

---

### 📝 Resumen Vercel Variables

| Variable | Valor | Uso |
|----------|-------|-----|
| `VITE_API_BASE_URL` | `https://pasteleriafullstackfinal-production.up.railway.app` | Backend API |
| `VITE_ENVIRONMENT` | `production` | Environment flag |

**Total**: **2 variables**

---

## 🗄️ SUPABASE - Database y Storage

### 📍 Información de Conexión

**Project**: dzbeucldelrjdjprfday  
**Region**: US East (Ohio)

### 🔌 Database Connection

**⚠️ IMPORTANTE**: Usar **Session Pooler** (NO Transaction Pooler)

#### Connection String (Session Pooler):
```
postgresql://postgres.dzbeucldelrjdjprfday:PasteleriaMilSabores123!@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

#### Desglose:
- **Host**: `aws-0-us-east-1.pooler.supabase.com`
- **Port**: `5432` ✅ (Session Pooler - CORRECTO)
- **Database**: `postgres`
- **User**: `postgres.dzbeucldelrjdjprfday`
- **Password**: `PasteleriaMilSabores123!`

#### ❌ NO USAR Transaction Pooler:
```
Port 6543 (Transaction Pooler) → Causa LazyInitializationException
```

**Razón**: Transaction Pooler cierra conexión antes de que Jackson serialice entidades

---

### 📦 Storage Configuration

#### Bucket Name:
```
pasteles
```

#### Public URL Base:
```
https://dzbeucldelrjdjprfday.supabase.co/storage/v1/object/public/pasteles/
```

#### Ejemplo URL completa:
```
https://dzbeucldelrjdjprfday.supabase.co/storage/v1/object/public/pasteles/productos/torta-selva-negra.jpg
```

---

### 📋 Schema Database

**Tablas principales**:
- `usuarios`
- `productos`
- `variantes_producto` ⚠️ (Debe tener 58 registros)
- `imagen_producto`
- `categorias`
- `ordenes`
- `detalle_orden`
- `contacto`

---

## ✅ VERIFICACIÓN FINAL

### 1️⃣ Verificar Railway

#### Health Check:
```powershell
Invoke-RestMethod -Uri "https://pasteleriafullstackfinal-production.up.railway.app/actuator/health"
```

**Resultado esperado**:
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP"
    }
  }
}
```

#### Test Endpoint:
```powershell
Invoke-RestMethod -Uri "https://pasteleriafullstackfinal-production.up.railway.app/api/productos/1"
```

**Resultado esperado**:
```json
{
  "id": 1,
  "nombre": "Torta Selva Negra",
  "precio": 42000,
  "variantes": [
    {"id": 164, "nombre": "6 porciones", "precio": 7000},
    {"id": 165, "nombre": "10 porciones", "precio": 10000},
    ...
  ]
}
```

---

### 2️⃣ Verificar Vercel

#### Abrir Frontend:
```
https://pasteleria-full-stack-final.vercel.app
```

#### Test conectividad:
1. Navegar a: **Categorías** → **Bizcochuelo** → **Torta Selva Negra**
2. Verificar:
   - ✅ Selector de tamaños visible
   - ✅ 7 opciones disponibles
   - ✅ Precios correctos
   - ✅ Botón "Agregar al carrito" funciona

---

### 3️⃣ Verificar CORS

#### Desde navegador (Console):
```javascript
fetch('https://pasteleriafullstackfinal-production.up.railway.app/api/productos')
  .then(r => r.json())
  .then(d => console.log('CORS OK:', d.length, 'productos'))
  .catch(e => console.error('CORS ERROR:', e));
```

**Resultado esperado**: `CORS OK: 18 productos`

---

### 4️⃣ Script PowerShell Completo

```powershell
.\verificar_sistema.ps1
```

**Output esperado**:
```
========================================
VERIFICACION COMPLETA - VARIANTES
========================================

PASO 1: Probando Backend Railway...
   OK - Respuesta recibida correctamente
   Variantes encontradas: 7

PASO 2: Verificando Health Check...
   OK - Health Check: UP
   OK - Database: UP

PASO 3: Verificando lista completa...
   OK - Total productos: 18
   Productos con variantes: 9

========================================
RESUMEN FINAL
========================================

OK - Backend Railway: FUNCIONANDO
OK - Variantes: FUNCIONANDO
OK - Health Check: UP
```

---

## 🔄 REDEPLOY (Si es necesario)

### Railway

1. Dashboard → Backend → **Deployments**
2. Click en **⋮** (menú) → **Redeploy**
3. Esperar 5-7 minutos

### Vercel

1. Dashboard → pasteleria-full-stack-final → **Deployments**
2. Click en **⋮** (menú) → **Redeploy**
3. Esperar 2-3 minutos

---

## 📊 DIAGRAMA DE CONFIGURACIÓN

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL (Frontend)                       │
│  Variables:                                                 │
│  - VITE_API_BASE_URL → Railway URL                          │
│  - VITE_ENVIRONMENT=production                              │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    RAILWAY (Backend)                        │
│  Variables:                                                 │
│  - SUPABASE_DB_PASSWORD → Database                          │
│  - SUPABASE_URL → Storage                                   │
│  - SUPABASE_KEY → Storage Auth                              │
│  - SUPABASE_BUCKET → Folder                                 │
│  - JWT_SECRET → Token signing                               │
│  - JWT_EXPIRATION → 24h                                     │
│  - FRONTEND_URL → CORS                                      │
│  - SPRING_PROFILES_ACTIVE=production                        │
│  - JAVA_TOOL_OPTIONS → JVM config                           │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             │ Session Pooler             │ Storage API
             │ Port 5432                  │
             ▼                            ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│   SUPABASE DATABASE      │  │   SUPABASE STORAGE           │
│   - variantes_producto   │  │   - Bucket: pasteles         │
│   - productos            │  │   - Public URL               │
│   - usuarios             │  │                              │
└──────────────────────────┘  └──────────────────────────────┘
```

---

## 🎯 CHECKLIST CONFIGURACIÓN

### Railway (Backend):
- [ ] 9 variables de entorno configuradas
- [ ] Root Directory: `/Backend`
- [ ] Build Command: `mvn clean package -DskipTests`
- [ ] Start Command: `java $JAVA_TOOL_OPTIONS -jar target/...`
- [ ] Public Domain habilitado
- [ ] GitHub webhook activo (auto-deploy)

### Vercel (Frontend):
- [ ] 2 variables de entorno configuradas
- [ ] Framework Preset: Vite
- [ ] Root Directory: `Frontend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] GitHub integration activa (auto-deploy)

### Supabase:
- [ ] Session Pooler configurado (puerto 5432)
- [ ] Bucket `pasteles` creado
- [ ] Bucket público habilitado
- [ ] SQL ejecutado (58 variantes insertadas)

### Verificación:
- [ ] Health check UP
- [ ] Endpoint `/api/productos/1` retorna 7 variantes
- [ ] Frontend muestra selector de tamaños
- [ ] CORS funcionando
- [ ] Agregar al carrito funciona

---

## 🆘 TROUBLESHOOTING

### Railway retorna 500 Internal Server Error

**Ver logs**:
1. Railway Dashboard → Backend → **View Logs**
2. Buscar línea con `ERROR` o `Exception`

**Errores comunes**:
- `HikariPool-1 - Exception during pool initialization` → Verificar `SUPABASE_DB_PASSWORD`
- `LazyInitializationException` → Verificar commit deployado tiene `FetchType.EAGER`
- `OutOfMemoryError` → Verificar `JAVA_TOOL_OPTIONS` configurado

---

### Vercel muestra página blanca

**Abrir consola navegador** (F12):
- Error CORS → Verificar `FRONTEND_URL` en Railway
- Error 404 en API → Verificar `VITE_API_BASE_URL` en Vercel
- Otros errores → Ver **Deployment Logs** en Vercel

---

### Backend retorna `variantes: []`

**Ejecutar**:
```powershell
.\ejecutar_carga_variantes.ps1
```

Este script carga las 58 variantes en Supabase.

---

## 📚 DOCUMENTACIÓN ADICIONAL

- `CONFIGURACION_RAILWAY_VERCEL.md` - Guía extendida
- `RAILWAY_TROUBLESHOOTING.md` - Troubleshooting completo
- `SOLUCION_FINAL_VARIANTES.md` - Explicación técnica LAZY vs EAGER
- `RESUMEN_FINAL.md` - Auditoría completa

---

**Última actualización**: 2025-12-13  
**Autor**: GitHub Copilot  
**Repositorio**: https://github.com/TomasValdivia20/PasteleriaFullStackFinal
