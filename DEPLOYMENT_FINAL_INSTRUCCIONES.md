# 🚀 DEPLOYMENT FINAL - Railway + Vercel

**Sistema Forense Automático - Mil Sabores Pastelería**  
**Fecha:** Diciembre 1, 2025  
**Commit Fix:** `5cc7f28` (logger.js + troubleshooting docs)

---

## ✅ PROBLEMAS RESUELTOS

### 1. ✅ Logback Railway Crash
- **Problema:** `ERROR: no conversion class registered for [clr]`
- **Fix:** Commit `9c71310` - Removido %clr y %wEx incompatibles
- **Status:** ✅ RESUELTO - Backend inicia correctamente

### 2. ✅ Frontend Logs No Se Envían a Railway
- **Problema:** `POST http://localhost:8080/api/logs ERR_CONNECTION_REFUSED`
- **Causa:** logger.js usaba `VITE_API_BASE_URL` (no existe)
- **Fix:** Commit `5cc7f28` - Cambiado a `VITE_API_URL`
- **Status:** ✅ RESUELTO - Logs se enviarán a Railway después de redeploy Vercel

### 3. ⚠️ Variantes: 0 / Imagenes: 0
- **Problema:** LazyInitializationException Railway bug
- **Railway Logs:** `[GET] /api/productos/1 - Variantes: 0, Imagenes: 0`
- **Fix:** Agregar variable `SPRING_JPA_OPEN_IN_VIEW=true`
- **Status:** ⚠️ PENDIENTE - Agregar variable y redeploy Railway

---

## 📋 VARIABLES DE ENTORNO - CONFIGURACIÓN FINAL

### 🔴 RAILWAY (Backend)

**Railway Dashboard → Variables → Agregar/Actualizar:**

#### ✅ Variables CRÍTICAS (Ya configuradas)

```bash
SPRING_PROFILES_ACTIVE=production
DATABASE_URL=jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:6543/postgres?user=postgres.dzbeucldelrjdjprfday&password=xxxxx
SUPABASE_URL=https://dzbeucldelrjdjprfday.supabase.co
SUPABASE_KEY=eyJhbGci...
JWT_SECRET=tu_clave_secreta_32_caracteres
ALLOWED_ORIGINS=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app
```

#### ⚡ Variables NUEVAS (Agregar AHORA)

```bash
# Fix Variantes: 0 (LazyInitializationException)
SPRING_JPA_OPEN_IN_VIEW=true

# HikariCP Optimizado (Pool Size correcto)
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=20
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=5
SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT=30000
SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT=600000
SPRING_DATASOURCE_HIKARI_MAX_LIFETIME=1800000
SPRING_DATASOURCE_HIKARI_LEAK_DETECTION_THRESHOLD=60000

# JVM Memory (Railway 512MB)
JAVA_TOOL_OPTIONS=-Xmx400m -Xms200m -XX:MaxMetaspaceSize=100m
```

**Redeploy Railway:**
- Automático: Railway detectará push `5cc7f28` (Backend no cambió, solo frontend)
- Manual: Railway Dashboard → Deployments → Trigger Deploy

---

### 🔵 VERCEL (Frontend)

**Vercel Dashboard → Settings → Environment Variables → Verificar:**

#### Production

```bash
# ⚠️ CRÍTICO: Verificar esta variable existe y es correcta
VITE_API_URL=https://pasteleriafullstackfinal-production.up.railway.app/api

# Habilitar logs en producción
VITE_ENABLE_LOGS=true

# Supabase (mismo que Railway)
VITE_SUPABASE_URL=https://dzbeucldelrjdjprfday.supabase.co
VITE_SUPABASE_KEY=eyJhbGci... (anon public key)
```

**Redeploy Vercel:**

```bash
# Opción 1: CLI (Recomendado)
cd Frontend
vercel --prod

# Opción 2: GitHub Integration
# Railway ya detectó push 5cc7f28, redesplegará automáticamente
```

---

## 🎯 PASOS DEPLOYMENT (ORDEN)

### Paso 1: Agregar Variables Railway

1. Railway Dashboard → `pasteleriafullstackfinal-production`
2. Variables → + New Variable
3. Agregar las 8 variables nuevas (ver sección arriba)
4. **NO hacer deploy manual todavía**

### Paso 2: Verificar Variables Vercel

1. Vercel Dashboard → `pasteleria-full-stack-final`
2. Settings → Environment Variables
3. Buscar `VITE_API_URL`
4. **Verificar valor:** `https://pasteleriafullstackfinal-production.up.railway.app/api`
5. Si no existe o es incorrecto: Editar → Guardar → Redeploy

### Paso 3: Redeploy Railway (Con Variables Nuevas)

Railway Dashboard → Deployments → Latest (commit `5cc7f28`)

**Método 1: Trigger Deploy Manual**
- Click en "..." → Redeploy

**Método 2: Agregar variable dummy (fuerza redeploy)**
- Variables → + New Variable → `REDEPLOY_TRIGGER=1`
- Guardar (Railway auto-despliega)

**Tiempo estimado:** 5-7 minutos

### Paso 4: Redeploy Vercel (Con logger.js Fix)

**Opción A: GitHub Integration (Automático)**
- Vercel detecta push `5cc7f28` → Auto-deploys
- Tiempo: 2-3 minutos

**Opción B: CLI Manual**
```bash
cd Frontend
vercel --prod
```

### Paso 5: Verificar Deployment Railway

**5.1 Health Check:**
```bash
curl https://pasteleriafullstackfinal-production.up.railway.app/actuator/health | jq .
```

**Expected Output:**
```json
{
  "status": "UP",
  "components": {
    "hibernate": {
      "status": "UP",
      "details": {
        "lazyLoadingWorking": true,   // ✅ DEBE SER true
        "testProductoId": 1,
        "variantesLoaded": 1,          // ✅ DEBE SER > 0
        "imagenesLoaded": 1            // ✅ DEBE SER > 0
      }
    }
  }
}
```

**Si `lazyLoadingWorking: false`:**
- Variable `SPRING_JPA_OPEN_IN_VIEW` no aplicada
- Redeploy Railway de nuevo
- Verificar Railway Logs: `Started BackendApplication`

**5.2 Test API Productos:**
```bash
curl https://pasteleriafullstackfinal-production.up.railway.app/api/productos/1 | jq .
```

**Expected:**
```json
{
  "id": 1,
  "nombre": "Torta Selva Negra",
  "variantes": [    // ✅ NO VACÍO
    {
      "id": 1,
      "precio": 42000,
      "cantidadPersonas": 8
    }
  ],
  "imagenes": [     // ✅ NO VACÍO
    {
      "id": 1,
      "url": "https://dzbeucldelrjdjprfday.supabase.co/..."
    }
  ]
}
```

**5.3 Railway Logs:**

Railway Dashboard → Logs → Buscar:

```log
✅ Started BackendApplication in X.XXX seconds
✅ HikariPool-1 - configuration: maximumPoolSize=20  (NO 2)
✅ [CONTROLLER] >>> ProductoController.obtenerProductoPorId()
✅ [GET] /api/productos/1 - Variantes: 1, Imagenes: 1  (NO 0)
```

### Paso 6: Verificar Deployment Vercel

**6.1 Abrir App:**
```
https://pasteleria-full-stack-final.vercel.app/
```

**6.2 Navegación Test:**
1. Home → Click "Productos"
2. Click primer producto (Torta Selva Negra)
3. Verificar variantes se muestran (no "Sin variantes disponibles")

**6.3 Browser Console (F12):**

**Expected Logs:**
```javascript
✅ [API CONFIG] Cliente API configurado correctamente
🚀 [APP INIT] Iniciando aplicación
🔗 [API] URL: https://pasteleriafullstackfinal-production.up.railway.app/api
✅ [ProductDetail] Producto cargado: {variantes: [...]}
   Variantes disponibles: 1  // ✅ NO 0
```

**❌ NO DEBE APARECER:**
```javascript
❌ POST http://localhost:8080/api/logs net::ERR_CONNECTION_REFUSED
```

**6.4 Verificar Logs en Railway:**

Railway Dashboard → Logs → Buscar `[FRONTEND]`:

```log
[FRONTEND] [correlationId=a1b2c3d4] [session=...] [url=https://pasteleria-full-stack-final.vercel.app/productos/1] INFO: Producto cargado exitosamente
```

**Si NO aparecen logs `[FRONTEND]`:**
- Vercel variable `VITE_API_URL` incorrecta
- Redeploy Vercel de nuevo
- Verificar variable en Settings → Environment Variables

---

## ⚠️ TROUBLESHOOTING

### 🔴 Variantes: 0 Persiste Después de Fix

**Diagnóstico:**
```bash
curl https://tu-railway-app.up.railway.app/actuator/health | jq '.components.hibernate.details.lazyLoadingWorking'
```

**Si responde `false`:**

1. **Verificar variable Railway:**
   - Dashboard → Variables → Buscar `SPRING_JPA_OPEN_IN_VIEW`
   - Valor debe ser: `true` (lowercase)

2. **Clear Railway Build Cache:**
   ```bash
   railway run --service backend bash
   # Dentro del contenedor:
   rm -rf /app/target
   exit
   # Redeploy
   ```

3. **Verificar logs startup:**
   Railway Logs → Buscar `open-in-view`
   ```log
   spring.jpa.open-in-view : true
   ```

4. **Última opción - Annotate Controllers:**
   Ver: [RAILWAY_TROUBLESHOOTING.md - Sección 2 - Solución 2](./RAILWAY_TROUBLESHOOTING.md#2-variantes-0---lazyinitializationexception)

---

### 🔴 Frontend Logs Aún Intentan localhost

**Diagnóstico:**

Vercel app → F12 Console → Network tab → Buscar `/api/logs`

**Si aparece `http://localhost:8080/api/logs`:**

1. **Verificar logger.js desplegado:**
   - Vercel Dashboard → Deployments → Latest
   - Commit debe ser `5cc7f28` o posterior
   - Build logs: `✓ built in XXms`

2. **Verificar variable Vercel:**
   ```bash
   # Desde CLI
   vercel env ls
   # Debe mostrar: VITE_API_URL (Production, Preview)
   ```

3. **Hard refresh browser:**
   - Ctrl + Shift + R (Chrome/Edge)
   - Cmd + Shift + R (Mac)
   - Clear cache + reload

4. **Verificar build logs Vercel:**
   ```log
   Building...
   ✓ Generated static site in /dist
   ✓ Copying public assets
   ```

---

### 🔴 HikariCP Pool Size Sigue en 2

**Diagnóstico:**

Railway Logs → Buscar `HikariPool-1 - configuration`:

```log
maximumPoolSize.................2  ❌ INCORRECTO
```

**Fix:**

1. **Verificar prefijo variable:**
   Railway Dashboard → Variables
   
   **❌ INCORRECTO:**
   ```bash
   HIKARI_MAX_POOL_SIZE=20
   ```
   
   **✅ CORRECTO:**
   ```bash
   SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=20
   ```

2. **Eliminar variables viejas:**
   - Buscar variables con prefijo `HIKARI_` (sin `SPRING_DATASOURCE_`)
   - Eliminar todas
   - Agregar solo con prefijo correcto

3. **Redeploy Railway**

4. **Verificar logs:**
   ```log
   maximumPoolSize.................20  ✅ CORRECTO
   ```

---

## 📊 CHECKLIST POST-DEPLOYMENT

### Railway (Backend)

- [ ] Health check `/actuator/health` → `status: UP`
- [ ] `lazyLoadingWorking: true` en health check
- [ ] API `/api/productos/1` → `variantes.length > 0`
- [ ] Railway logs muestran `maximumPoolSize=20`
- [ ] Railway logs muestran `Started BackendApplication` sin errores
- [ ] Railway logs NO muestran `ERROR in ch.qos.logback`
- [ ] Railway logs muestran `[CONTROLLER]` y `[SERVICE]` tags
- [ ] Correlation ID visible en logs: `[correlationId=...]`

### Vercel (Frontend)

- [ ] App carga correctamente en `https://pasteleria-full-stack-final.vercel.app`
- [ ] Productos se muestran con variantes
- [ ] Browser console NO muestra `ERR_CONNECTION_REFUSED`
- [ ] Browser console muestra API URL Railway (NO localhost)
- [ ] Railway logs muestran categoría `[FRONTEND]`
- [ ] Correlation ID matching entre frontend y backend logs

### Conectividad

- [ ] Frontend → Backend: Productos cargan correctamente
- [ ] Frontend → Backend: Logs se envían (Railway muestra `[FRONTEND]`)
- [ ] Frontend → Supabase: Imágenes cargan desde Storage
- [ ] Backend → Supabase: Database queries exitosas
- [ ] CORS configurado correctamente (no errors en console)

---

## 🎉 DEPLOYMENT EXITOSO

**Cuando TODOS los checkboxes están marcados:**

1. **Test end-to-end:**
   - Navegar app completa
   - Agregar producto al carrito
   - Completar checkout (test)
   - Verificar logs en Railway con correlation ID

2. **Monitoreo continuo:**
   - UptimeRobot: https://uptimerobot.com
   - Monitor: `https://tu-railway-app.up.railway.app/actuator/health`
   - Interval: 5 minutos
   - Alert: Email/Discord si DOWN

3. **Logs review semanal:**
   - Railway logs: Buscar `ERROR` o `WARN`
   - HikariCP: Connection leaks
   - Performance: SLOW EXECUTION warnings

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **[RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md)** - 5 problemas comunes Railway
- **[INSTRUCCIONES_RAILWAY_VERCEL.md](./INSTRUCCIONES_RAILWAY_VERCEL.md)** - Guía completa deployment
- **[SISTEMA_FORENSE_COMPLETO.md](./SISTEMA_FORENSE_COMPLETO.md)** - Resumen implementación
- **[RAILWAY_CONFIGURACION_FINAL.md](./RAILWAY_CONFIGURACION_FINAL.md)** - Variables detalladas

---

## 🆘 SOPORTE

**Si problemas persisten:**

1. **Logs completos:**
   - Railway: Dashboard → Logs → Download
   - Vercel: `vercel logs > vercel.log`

2. **Health check JSON:**
   ```bash
   curl https://tu-railway-app.up.railway.app/actuator/health > health.json
   ```

3. **Consultar:**
   - [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md)
   - Railway Discord: https://discord.gg/railway
   - Vercel Support: https://vercel.com/support

---

**✅ SISTEMA FORENSE AUTOMÁTICO - DEPLOYMENT COMPLETO**  
**Commits aplicados:** `9c71310` (Logback fix) + `315a1da` (docs) + `8a33f08` (consolidado) + `5cc7f28` (logger.js fix)  
**Status:** ✅ Railway deploying, ⚠️ Vercel pendiente redeploy  
**Próximo paso:** Agregar variables Railway + Redeploy ambos servicios
