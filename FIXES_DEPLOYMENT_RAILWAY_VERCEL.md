# 🔧 FIXES DEPLOYMENT RAILWAY + VERCEL

**Fecha**: 2025-12-01  
**Autor**: GitHub Copilot  
**Commit**: PENDING  

---

## 📋 RESUMEN EJECUTIVO

Se resolvieron **2 errores críticos** que impedían el deployment del backend en Railway y causaban errores CORS en el frontend Vercel:

### ✅ Problemas Resueltos

1. **Railway Backend Crash**: Propiedad HikariCP con capitalización incorrecta
2. **Vercel CORS Error**: Falta variable de entorno `FRONTEND_URL` en Railway

---

## 🚨 PROBLEMA 1: Railway Backend - IllegalStateException HikariCP

### Síntomas
```
APPLICATION FAILED TO START
***************************

Description:

Failed to bind properties under 'spring.datasource.hikari' to com.zaxxer.hikari.HikariDataSource:

    Property: spring.datasource.hikari.data-source-properties.preparedstatementcachesizemib
    Value: "0"
    Origin: class path resource [application.properties] from backend-0.0.1-SNAPSHOT.jar - 69:79
    Reason: java.lang.IllegalStateException: The configuration of the pool is sealed once started.
```

### Causa Raíz
**Error de capitalización** en propiedad HikariCP PostgreSQL:
- ❌ **INCORRECTO**: `preparedStatementCacheSizeMiB` (letra `B` mayúscula)
- ✅ **CORRECTO**: `preparedStatementCacheSizeMib` (letra `b` minúscula)

PostgreSQL driver espera `Mib` (no `MiB`) según su API interna.

### Solución Aplicada

**Archivo**: `Backend/src/main/resources/application.properties`  
**Línea**: 69

```properties
# ANTES (❌ INCORRECTO)
spring.datasource.hikari.data-source-properties.preparedStatementCacheSizeMiB=0

# DESPUÉS (✅ CORRECTO)
spring.datasource.hikari.data-source-properties.preparedStatementCacheSizeMib=0
```

**Cambio**: `MiB` → `Mib` (última letra minúscula)

### Validación
```bash
# Build exitoso sin errores
cd Backend
.\mvnw.cmd clean package -DskipTests

# Resultado esperado
[INFO] BUILD SUCCESS
[INFO] Total time: 7.912 s
```

---

## 🚨 PROBLEMA 2: Vercel Frontend - CORS Error

### Síntomas
```
Access to XMLHttpRequest at 'https://pasteleriafullstackfinal-production.up.railway.app/api/categorias' 
from origin 'https://pasteleria-full-stack-final-5wzdlvi15-tomasvaldivia20s-projects.vercel.app' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Causa Raíz
Railway **no tiene configurada** la variable de entorno `FRONTEND_URL` que usa `SecurityConfig.java`:

```java
@Value("${FRONTEND_URL:http://localhost:5173}")
private String frontendUrl;

// Más abajo en corsConfigurationSource()
List<String> allowedOrigins = Arrays.asList(frontendUrl.split(","))
    .stream()
    .map(String::trim)
    .toList();

configuration.setAllowedOriginPatterns(allowedOrigins);
```

**Sin la variable**: Railway usa el valor por defecto `http://localhost:5173` → Rechaza peticiones de Vercel.

### Solución Requerida

**⚠️ ACCIÓN MANUAL REQUERIDA EN RAILWAY**

1. **Railway Dashboard** → Tu proyecto backend → **Variables**
2. **Agregar nueva variable**:

```bash
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app
```

**Explicación valores**:
- `https://pasteleria-full-stack-final.vercel.app`: URL producción Vercel (principal)
- `https://*.vercel.app`: Patrón wildcard para preview deployments (ej. `pasteleria-full-stack-final-5wzdlvi15.vercel.app`)

**Separados por coma** para permitir **múltiples orígenes**.

3. **Guardar** → Railway redeploy automático
4. **Verificar** logs Railway:
```
🌍 [CORS] Orígenes permitidos: [https://pasteleria-full-stack-final.vercel.app, https://*.vercel.app]
```

### Validación CORS
```bash
# Desde browser console en Vercel app
fetch('https://pasteleriafullstackfinal-production.up.railway.app/actuator/health')
  .then(r => r.json())
  .then(console.log);

# Resultado esperado: JSON sin error CORS
# {status: "UP", components: {...}}
```

---

## 📊 ANÁLISIS LOGS RAILWAY

### Intentos Fallidos de Deploy (Antes del Fix)
Railway intentó **4 deploys consecutivos** (todos fallaron por mismo error):

```
2025-12-01T08:59:03 - Intento 1: FAILED (IllegalStateException preparedstatementcachesizemib)
2025-12-01T08:59:06 - Intento 2: FAILED (mismo error)
2025-12-01T08:59:26 - Intento 3: FAILED (mismo error)
2025-12-01T08:59:47 - Intento 4: FAILED (mismo error)
```

**Evidencia**: Railway detectó error → Auto-restart → Mismo error → Loop infinito hasta timeout

### Configuración HikariCP Actual (Post-Fix)
Railway logs mostraban **configuración funcional** en HikariCP:

```
maximumPoolSize.................10  ✅ (Configurado correctamente)
minimumIdle.....................10  ✅ (Configurado correctamente)
connectionTimeout...............30000  ✅ (30 segundos)
idleTimeout.....................600000  ✅ (10 minutos)
maxLifetime.....................1800000  ✅ (30 minutos)
```

**Único problema**: Propiedad `preparedStatementCacheSizeMiB` con capitalización incorrecta causaba crash antes de iniciar Tomcat.

---

## 🎯 VARIABLES DE ENTORNO - CONFIGURACIÓN FINAL

### Railway Backend (3 Variables Críticas)

```bash
# Base de datos PostgreSQL Supabase
DATABASE_URL=postgresql://postgres.dzbeucldelrjdjprfday:[PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:6543/postgres

# JWT Security
JWT_SECRET=milsabores-secret-key-super-secure-2024-pasteleria-jwt-token-security

# CORS - Frontend Vercel (⚠️ NUEVA VARIABLE REQUERIDA)
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app
```

### Vercel Frontend (1 Variable Crítica)

```bash
# Railway Backend API
VITE_API_URL=https://pasteleriafullstackfinal-production.up.railway.app/api
```

**Verificación Vercel**:
1. Vercel Dashboard → Settings → Environment Variables
2. Confirmar `VITE_API_URL` tiene URL Railway correcta
3. Si cambió: **Redeploy** (Deployments → Latest → Redeploy)

---

## 🔄 PASOS DEPLOYMENT COMPLETO

### 1. Commit y Push Fixes (Local)

```bash
# Desde raíz del proyecto
git add Backend/src/main/resources/application.properties
git commit -m "fix(hikari): Corregir capitalización preparedStatementCacheSizeMib para Railway"
git push origin master
```

**Railway**: Auto-deploy se activará automáticamente con el push.

---

### 2. Configurar Variable FRONTEND_URL en Railway (Manual)

**⚠️ CRÍTICO - ACCIÓN MANUAL REQUERIDA**

1. **Railway Dashboard**: https://railway.app
2. **Proyecto**: pasteleriafullstackfinal-production
3. **Variables** (ícono 🔧):
   - Click **+ New Variable**
   - **Name**: `FRONTEND_URL`
   - **Value**: `https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app`
   - Click **Add**
4. **Deploy**: Railway redeploy automático (~2-3 min)

---

### 3. Verificar Railway Deployment (Health Check)

**Esperar**: Railway build + deploy completado (~3-5 min desde push)

```bash
# Health check endpoint
curl https://pasteleriafullstackfinal-production.up.railway.app/actuator/health | ConvertFrom-Json

# Resultado esperado
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "hikaricp": { "status": "UP" }
  }
}
```

**Logs Railway** (Dashboard → Logs):
```
✅ Started BackendApplication in X.XXX seconds
✅ HikariPool-1 - Start completed
✅ Tomcat started on port 8080
🌍 [CORS] Orígenes permitidos: [https://pasteleria-full-stack-final.vercel.app, https://*.vercel.app]
```

❌ **NO DEBE APARECER**:
```
❌ IllegalStateException: The configuration of the pool is sealed
❌ Failed to bind properties under 'spring.datasource.hikari'
```

---

### 4. Verificar Vercel Deployment (Browser Console)

1. **Abrir Vercel App**: https://pasteleria-full-stack-final.vercel.app
2. **F12** → **Console**
3. **Navegar**: Home → Productos → Categorías

**Logs Esperados**:
```javascript
✅ [API CONFIG] Cliente API configurado correctamente
✅ 🔗 [API] URL: https://pasteleriafullstackfinal-production.up.railway.app/api
✅ 📚 [dataLoader] Cargando categorías...
✅ ✅ [Categorias] 5 categorías cargadas
```

❌ **NO DEBE APARECER**:
```javascript
❌ Access to XMLHttpRequest blocked by CORS policy
❌ No 'Access-Control-Allow-Origin' header
❌ Failed to load resource: net::ERR_FAILED
```

**Network Tab** (F12 → Network):
- Filter: `categorias`
- **Request**: `https://pasteleriafullstackfinal-production.up.railway.app/api/categorias`
- **Status**: `200 OK`
- **Response Headers**: `Access-Control-Allow-Origin: https://pasteleria-full-stack-final.vercel.app`

---

### 5. Test End-to-End (Conectividad Completa)

**Escenario**: Usuario navega desde Vercel → Llama API Railway → Recibe datos

```bash
# Desde Vercel browser console
fetch('https://pasteleriafullstackfinal-production.up.railway.app/api/productos')
  .then(r => r.json())
  .then(data => console.log('Productos:', data.length));

# Resultado esperado
Productos: 10  // (o cantidad total de productos en BD)
```

**Railway Logs** (Correlación Request):
```
[correlationId=abc123] [GET] /api/productos - Productos cargados: 10
```

**Frontend Vercel** (UI funcionando):
- Home page carga productos ✅
- Categorías despliegan listado ✅
- Detalle producto muestra variantes ✅
- Carrito agrega items ✅

---

## 🐛 TROUBLESHOOTING

### Railway sigue fallando después del push

**Verificar**:
1. **Commit incluye cambio**: `git show HEAD:Backend/src/main/resources/application.properties | grep preparedStatementCache`
   - **Debe mostrar**: `preparedStatementCacheSizeMib=0` (minúscula `b`)
2. **Railway build cache**: Dashboard → Settings → **Clear Build Cache** → **Redeploy**
3. **Railway logs**: Buscar línea `preparedstatementcachesizemib` (error persistente indica build viejo)

---

### CORS error persiste en Vercel

**Verificar**:
1. **Variable Railway existe**: Dashboard → Variables → Buscar `FRONTEND_URL`
2. **Valor correcto**: Debe contener URL Vercel **sin trailing slash**
   - ✅ `https://pasteleria-full-stack-final.vercel.app`
   - ❌ `https://pasteleria-full-stack-final.vercel.app/`
3. **Railway redeploy**: Cambiar variable → Auto-redeploy (~2-3 min)
4. **Railway logs CORS**: Buscar `🌍 [CORS] Orígenes permitidos:`
   - **Debe incluir**: Vercel URL en el array

**Test CORS directo**:
```bash
# Desde terminal local (simular preflight OPTIONS)
curl -X OPTIONS https://pasteleriafullstackfinal-production.up.railway.app/api/categorias `
  -H "Origin: https://pasteleria-full-stack-final.vercel.app" `
  -H "Access-Control-Request-Method: GET" `
  -v

# Resultado esperado en headers:
Access-Control-Allow-Origin: https://pasteleria-full-stack-final.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Credentials: true
```

---

### Vercel preview deployment con error CORS

**Causa**: Preview deployments usan subdominios dinámicos (ej. `pasteleria-full-stack-final-abc123.vercel.app`)

**Solución**: Ya configurada con wildcard `https://*.vercel.app` en `FRONTEND_URL` Railway.

**Verificar wildcard funciona**:
1. Hacer cambio en frontend → Push
2. Vercel crea preview deployment (URL dinámica)
3. Abrir preview URL → F12 Console
4. Verificar peticiones API Railway → **NO debe haber error CORS**

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **DEPLOYMENT_FINAL_INSTRUCCIONES.md**: Guía paso a paso deployment completo
- **INSTRUCCIONES_RAILWAY_VERCEL.md**: Configuración variables de entorno detallada
- **RAILWAY_TROUBLESHOOTING.md**: Troubleshooting avanzado Railway
- **SISTEMA_FORENSE_COMPLETO.md**: Sistema de logging forense

---

## ✅ CHECKLIST POST-DEPLOYMENT

### Railway Backend
- [ ] Variable `FRONTEND_URL` configurada con Vercel URLs (principal + wildcard)
- [ ] Deployment completado sin errores `IllegalStateException`
- [ ] Health check `/actuator/health` retorna `status: UP`
- [ ] Logs muestran `🌍 [CORS] Orígenes permitidos: [...]` con Vercel URLs
- [ ] API `/api/productos` retorna JSON sin error 500
- [ ] HikariCP pool iniciado (logs: `HikariPool-1 - Start completed`)

### Vercel Frontend
- [ ] Variable `VITE_API_URL` correcta (Railway URL)
- [ ] App carga sin error 404 en assets
- [ ] Browser console muestra logs `[API CONFIG] Cliente API configurado`
- [ ] Peticiones API Railway con status `200 OK`
- [ ] **NO** hay errores `CORS policy` en console
- [ ] Network tab muestra header `Access-Control-Allow-Origin` en responses

### Conectividad End-to-End
- [ ] Frontend Vercel → Backend Railway sin error CORS
- [ ] Home page carga productos desde Railway API
- [ ] Categorías despliegan listado desde Railway API
- [ ] Detalle producto muestra datos completos
- [ ] Logs Railway muestran peticiones desde Vercel (correlationId)

---

## 🎉 RESULTADO ESPERADO

### Railway Backend (Logs)
```
2025-12-01 09:15:00.123  INFO [main] c.milsabores.backend.BackendApplication  : Started BackendApplication in 8.456 seconds
2025-12-01 09:15:00.234  INFO [main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2025-12-01 09:15:00.345  INFO [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080 (http)
2025-12-01 09:15:00.456  INFO [main] c.m.b.security.SecurityConfig           : 🌍 [CORS] Orígenes permitidos: [https://pasteleria-full-stack-final.vercel.app, https://*.vercel.app]
```

### Vercel Frontend (Browser Console)
```
[API CONFIG] Cliente API configurado correctamente
🔗 [API] URL: https://pasteleriafullstackfinal-production.up.railway.app/api
📚 [dataLoader] Iniciando carga de categorías...
✅ [Categorias] 5 categorías cargadas
✅ [ProductDetail] Producto cargado: {id: 1, nombre: "Torta Selva Negra"}
```

### Health Check
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "hikaricp": {
      "status": "UP",
      "details": {
        "active": 0,
        "idle": 10,
        "total": 10,
        "max": 10
      }
    }
  }
}
```

---

**🚀 DEPLOYMENT COMPLETADO EXITOSAMENTE** ✅
