# 🚀 INSTRUCCIONES DEPLOYMENT FINAL - RAILWAY + VERCEL

**Fecha**: 2025-12-01  
**Commit Fix**: `8c3edf4`  
**Status**: ✅ Código corregido - ⚠️ Requiere configuración manual Railway

---

## 📋 RESUMEN EJECUTIVO

Se corrigieron **2 errores críticos** que impedían el funcionamiento del deployment:

1. ✅ **Railway Backend Crash**: Propiedad HikariCP corregida (`preparedStatementCacheSizeMib`)
2. ⚠️ **Vercel CORS Error**: **Requiere acción manual** (agregar variable `FRONTEND_URL` en Railway)

**Commit aplicado**: `8c3edf4` - Railway auto-deploy en progreso (~3-5 min)

---

## 🎯 ACCIÓN MANUAL REQUERIDA (CRÍTICA)

### ⚠️ Configurar Variable FRONTEND_URL en Railway

**Sin este paso el CORS error de Vercel PERSISTIRÁ**.

#### Pasos:

1. **Railway Dashboard**: https://railway.app
2. **Proyecto**: `pasteleriafullstackfinal-production`
3. **Variables** (ícono 🔧 en sidebar)
4. **+ New Variable**:
   - **Name**: `FRONTEND_URL`
   - **Value**: `https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app`
5. **Add** → Railway **redeploy automático** (~2-3 min)

#### Explicación del Valor:
```bash
https://pasteleria-full-stack-final.vercel.app  # URL producción Vercel (principal)
,
https://*.vercel.app  # Wildcard para preview deployments (ej. pasteleria-abc123.vercel.app)
```

**Separados por coma** para permitir **múltiples orígenes CORS**.

---

## 🔍 PROBLEMA 1: Railway Backend Crash (✅ RESUELTO)

### Error Original
```
APPLICATION FAILED TO START
Failed to bind properties under 'spring.datasource.hikari'
Property: spring.datasource.hikari.data-source-properties.preparedstatementcachesizemib
Reason: IllegalStateException: The configuration of the pool is sealed once started
```

### Causa Raíz
Error de **capitalización** en propiedad HikariCP:
- ❌ `preparedStatementCacheSizeMiB` (letra `B` mayúscula - INCORRECTO)
- ✅ `preparedStatementCacheSizeMib` (letra `b` minúscula - CORRECTO)

PostgreSQL driver espera `Mib` según su API interna.

### Solución Aplicada
**Archivo**: `Backend/src/main/resources/application.properties` (línea 69)

```diff
- spring.datasource.hikari.data-source-properties.preparedStatementCacheSizeMiB=0
+ spring.datasource.hikari.data-source-properties.preparedStatementCacheSizeMib=0
```

**Status**: ✅ **CORREGIDO** - Commit `8c3edf4` incluye el fix
**Railway**: Auto-deploy en progreso desde push

---

## 🔍 PROBLEMA 2: Vercel CORS Error (⚠️ REQUIERE ACCIÓN)

### Error Original
```
Access to XMLHttpRequest at 'https://pasteleriafullstackfinal-production.up.railway.app/api/categorias' 
from origin 'https://pasteleria-full-stack-final-5wzdlvi15-tomasvaldivia20s-projects.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

### Causa Raíz
Railway **NO tiene configurada** la variable `FRONTEND_URL`.

**Código Backend** (`SecurityConfig.java`):
```java
@Value("${FRONTEND_URL:http://localhost:5173}")
private String frontendUrl;  // ❌ Sin variable Railway = localhost

// CORS configuration
configuration.setAllowedOriginPatterns(Arrays.asList(frontendUrl.split(",")));
```

**Sin variable**: Railway usa valor por defecto `http://localhost:5173` → **Rechaza peticiones de Vercel**.

### Solución
**Status**: ⚠️ **REQUIERE ACCIÓN MANUAL** (ver sección anterior "Configurar Variable FRONTEND_URL")

---

## 📊 VERIFICACIÓN DEPLOYMENT

### 1. Verificar Railway Deployment (Backend)

**Esperar**: ~3-5 min desde push para build + deploy completo

#### Health Check
```bash
# PowerShell
Invoke-RestMethod https://pasteleriafullstackfinal-production.up.railway.app/actuator/health

# Resultado esperado
status      : UP
components  : @{db=...; hikaricp=...}
```

#### Railway Logs (Dashboard → Logs)
**✅ Logs exitosos**:
```
Started BackendApplication in X.XXX seconds
HikariPool-1 - Start completed
Tomcat started on port 8080 (http)
🌍 [CORS] Orígenes permitidos: [https://pasteleria-full-stack-final.vercel.app, https://*.vercel.app]
```

**❌ NO DEBE APARECER**:
```
❌ IllegalStateException: The configuration of the pool is sealed
❌ Failed to bind properties under 'spring.datasource.hikari'
❌ preparedstatementcachesizemib  (error persistente = build viejo, clear cache)
```

---

### 2. Verificar Vercel + CORS (Frontend)

**Prerequisito**: Variable `FRONTEND_URL` agregada en Railway (paso manual previo)

#### Browser Test
1. **Abrir**: https://pasteleria-full-stack-final.vercel.app
2. **F12** → **Console**
3. **Navegar**: Home → Productos

**✅ Logs esperados**:
```javascript
[API CONFIG] Cliente API configurado correctamente
🔗 [API] URL: https://pasteleriafullstackfinal-production.up.railway.app/api
📚 [dataLoader] Cargando categorías...
✅ [Categorias] 5 categorías cargadas
```

**❌ NO DEBE APARECER**:
```javascript
❌ Access to XMLHttpRequest blocked by CORS policy
❌ No 'Access-Control-Allow-Origin' header
```

#### CORS Test Directo
```javascript
// Desde browser console en Vercel
fetch('https://pasteleriafullstackfinal-production.up.railway.app/api/productos')
  .then(r => r.json())
  .then(data => console.log('Productos:', data.length));

// Resultado esperado: Número de productos (sin error CORS)
```

---

## 🐛 TROUBLESHOOTING

### Railway sigue fallando después del push

**Posibles causas**:

1. **Build cache viejo**:
   - Railway Dashboard → Settings → **Clear Build Cache**
   - Click **Redeploy**

2. **Commit no incluye fix**:
   ```bash
   # Verificar cambio en GitHub
   # https://github.com/TomasValdivia20/PasteleriaFullStackFinal/commit/8c3edf4
   # Buscar línea: preparedStatementCacheSizeMib=0 (minúscula b)
   ```

3. **Railway logs**:
   - Buscar `preparedstatementcachesizemib` (lowercase completo)
   - Si aparece = **build viejo**, clear cache y redeploy

---

### CORS error persiste en Vercel

**Verificación checklist**:

- [ ] Variable `FRONTEND_URL` existe en Railway Dashboard → Variables
- [ ] Valor correcto: `https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app`
- [ ] Railway redeployó después de agregar variable (~2-3 min)
- [ ] Railway logs muestran: `🌍 [CORS] Orígenes permitidos: [...]`

**Test CORS directo** (PowerShell):
```powershell
# Simular preflight OPTIONS desde Vercel origin
curl.exe -X OPTIONS `
  https://pasteleriafullstackfinal-production.up.railway.app/api/categorias `
  -H "Origin: https://pasteleria-full-stack-final.vercel.app" `
  -H "Access-Control-Request-Method: GET" `
  -v 2>&1 | Select-String "Access-Control"

# Resultado esperado:
# Access-Control-Allow-Origin: https://pasteleria-full-stack-final.vercel.app
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
```

Si **NO aparecen** headers CORS:
1. Verificar variable `FRONTEND_URL` Railway tiene valor exacto
2. Redeploy Railway manualmente (Dashboard → Redeploy)
3. Esperar 2-3 min y probar nuevamente

---

### Vercel preview deployments con CORS error

**Causa**: Preview deployments usan URLs dinámicas (ej. `pasteleria-abc123.vercel.app`)

**Solución**: Ya configurada con wildcard `https://*.vercel.app` en `FRONTEND_URL`.

**Test**:
1. Hacer cambio mínimo en frontend → Push
2. Vercel crea preview deployment
3. Abrir preview URL → F12 Console
4. Verificar peticiones API Railway → **NO** debe haber error CORS

---

## ✅ CHECKLIST POST-DEPLOYMENT

### Railway Backend
- [ ] Push commit `8c3edf4` completado ✅
- [ ] Railway auto-deploy iniciado (Dashboard → Activity)
- [ ] Variable `FRONTEND_URL` agregada en Railway (⚠️ **ACCIÓN MANUAL**)
- [ ] Health check retorna `status: UP`
- [ ] Logs muestran `🌍 [CORS] Orígenes permitidos: [...]`
- [ ] **NO** hay errores `IllegalStateException` en logs

### Vercel Frontend
- [ ] App carga sin error 404
- [ ] Console muestra `[API CONFIG] Cliente API configurado`
- [ ] Peticiones API Railway status `200 OK`
- [ ] **NO** hay errores `CORS policy` en console
- [ ] Network tab muestra `Access-Control-Allow-Origin` en responses

### Conectividad End-to-End
- [ ] Home page carga productos desde Railway
- [ ] Categorías despliegan listado
- [ ] Detalle producto muestra variantes
- [ ] Carrito funciona correctamente

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **FIXES_DEPLOYMENT_RAILWAY_VERCEL.md**: Troubleshooting detallado + análisis logs
- **DEPLOYMENT_FINAL_INSTRUCCIONES.md**: Guía paso a paso completa (documento previo)
- **INSTRUCCIONES_RAILWAY_VERCEL.md**: Variables de entorno detalladas

---

## 🎉 RESULTADO ESPERADO

### Railway Backend Logs
```
2025-12-01 09:20:00.123  INFO  Started BackendApplication in 8.456 seconds
2025-12-01 09:20:00.234  INFO  HikariPool-1 - Start completed
2025-12-01 09:20:00.345  INFO  Tomcat started on port 8080 (http)
2025-12-01 09:20:00.456  INFO  🌍 [CORS] Orígenes permitidos: 
  [https://pasteleria-full-stack-final.vercel.app, https://*.vercel.app]
```

### Vercel Frontend Console
```javascript
[API CONFIG] Cliente API configurado correctamente
🔗 [API] URL: https://pasteleriafullstackfinal-production.up.railway.app/api
📚 [dataLoader] Cargando categorías...
✅ [Categorias] 5 categorías cargadas
```

### Health Check Response
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "hikaricp": { 
      "status": "UP",
      "details": { "active": 0, "idle": 10, "total": 10, "max": 10 }
    }
  }
}
```

---

## 📞 SOPORTE

Si después de seguir estos pasos persisten errores:

1. **Railway Logs**: Dashboard → Logs → Copiar últimas 50 líneas desde "Started BackendApplication"
2. **Vercel Console**: F12 → Console → Copiar errores completos (incluir stack traces)
3. **Variables Railway**: Dashboard → Variables → Screenshot con nombres (NO valores sensibles)
4. **Compartir**: Con evidencia completa para análisis

---

**🚀 DEPLOYMENT EN PROGRESO** - Sigue checklist post-deployment para validar ✅
