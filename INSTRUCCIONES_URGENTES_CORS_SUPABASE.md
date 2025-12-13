# 🚨 INSTRUCCIONES URGENTES: Arreglar CORS + Conexiones Supabase

**Fecha**: 2 diciembre 2025 18:13 UTC  
**Problema Actual**: Railway crashea por zombies Supabase + Frontend Vercel bloqueado por CORS

---

## ✅ PARTE 1: LIMPIAR SUPABASE (EJECUTAR AHORA - 2 MINUTOS)

### Paso 1: Abrir Supabase SQL Editor

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar proyecto → **SQL Editor** → **New Query**

### Paso 2: Ejecutar Script Limpieza

**Opción A - DIAGNÓSTICO (ejecutar primero)**:
```sql
-- Ver TODAS las conexiones actuales
SELECT 
    pid,
    usename,
    state,
    EXTRACT(EPOCH FROM (NOW() - state_change)) AS seconds_idle,
    query
FROM pg_stat_activity 
WHERE datname = 'postgres'
ORDER BY state_change ASC;

-- Contar por estado
SELECT state, COUNT(*) as total
FROM pg_stat_activity 
WHERE datname = 'postgres'
GROUP BY state;
```

**Opción B - LIMPIEZA ZOMBIES (ejecutar después)**:
```sql
-- TERMINAR conexiones IDLE por más de 60 segundos
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND state = 'idle'
  AND EXTRACT(EPOCH FROM (NOW() - state_change)) > 60
  AND pid <> pg_backend_pid();
```

**Opción C - EMERGENCIA (solo si fallan A y B)**:
```sql
-- TERMINAR TODAS las conexiones (excepto la tuya)
-- Versión 1: Devuelve resultado por cada conexión terminada
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT pid 
        FROM pg_stat_activity 
        WHERE datname = 'postgres' 
          AND pid <> pg_backend_pid()
    LOOP
        RAISE NOTICE 'Terminando conexión PID: %', r.pid;
        PERFORM pg_terminate_backend(r.pid);
    END LOOP;
END $$;

-- Versión 2: Más simple (copiar y pegar este si Versión 1 falla)
SELECT 
    pid,
    pg_terminate_backend(pid) as terminated
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND pid <> pg_backend_pid();
```

**⚠️ IMPORTANTE**: Si Supabase muestra error "permission denied", usa esta alternativa:
```sql
-- ALTERNATIVA para Supabase (requiere permisos admin)
SELECT 
    pg_cancel_backend(pid) -- Cancela query en vez de terminar conexión
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND pid <> pg_backend_pid()
  AND state = 'idle'
  AND state_change < NOW() - INTERVAL '2 minutes';
```

### Paso 3: Verificar Limpieza

```sql
-- Debe mostrar ≤ 2 conexiones
SELECT state, COUNT(*) as total
FROM pg_stat_activity 
WHERE datname = 'postgres'
GROUP BY state;
```

**Resultado esperado**:
- `active`: 1 (tu consulta actual)
- `idle`: 0-1

**⚠️ SI TODAVÍA VES CONEXIONES ZOMBIE (idle: 5+, null: 2+)**, ejecuta limpieza agresiva:

```sql
-- PASO EXTRA: Limpiar conexiones NULL + IDLE zombies
-- ⚠️ SI SUPABASE DA ERROR "permission denied", USA ESTA VERSIÓN:
-- pg_cancel_backend() funciona sin permisos SUPERUSER
SELECT 
    pid,
    state,
    usename,
    pg_cancel_backend(pid) as cancelled
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND pid <> pg_backend_pid()
  AND usename = current_user  -- Solo cancela TUS conexiones
  AND (
    state = 'idle' 
    OR state IS NULL
    OR state = 'idle in transaction'
  );
```

**Si `pg_cancel_backend()` no limpia suficientes conexiones**, espera 2 minutos y ejecuta:

```sql
-- PASO ALTERNATIVO: Forzar timeout en conexiones idle
-- Esto las DESCONECTARÁ automáticamente después de 30 segundos
ALTER DATABASE postgres SET idle_in_transaction_session_timeout = '30s';
ALTER DATABASE postgres SET statement_timeout = '60s';

-- Recargar configuración
SELECT pg_reload_conf();
```

**LUEGO ESPERA 60 SEGUNDOS** y verifica:

```sql
SELECT state, COUNT(*) as total
FROM pg_stat_activity 
WHERE datname = 'postgres'
GROUP BY state;
```

**Debe quedar**:
- `active`: 1-2 (bajará automáticamente después del timeout)
- `idle`: 0-1
- `null`: 0

**⚠️ IMPORTANTE**: Si las conexiones zombie persisten después de 2 minutos, el problema es que **Railway está crasheando en loop** intentando conectar cada 30 seg. 

**SOLUCIÓN DEFINITIVA**: 
1. **Pausar/Detener** servicio Railway temporalmente
2. Limpiar conexiones Supabase (quedará en 1)
3. **Reactivar** Railway → Debe conectar correctamente

---

## ✅ PARTE 2: ARREGLAR CORS EN RAILWAY (EJECUTAR AHORA - 3 MINUTOS)

### Problema Identificado

Los logs Vercel muestran:
```
Access to fetch at 'https://pasteleriafullstackfinal-production.up.railway.app/api/logs' 
from origin 'https://pasteleria-full-stack-final-61kamoyg5-tomasvaldivia20s-projects.vercel.app' 
has been blocked by CORS policy
```

**Causa**: `FRONTEND_URL` en Railway NO incluye el dominio de preview Vercel.

### Solución

1. **Ir a Railway Dashboard**
   - https://railway.app/dashboard
   - Seleccionar proyecto → **Backend Service**

2. **Abrir Variables → Buscar `FRONTEND_URL`**

   **CONFIGURACIÓN ACTUAL (probablemente)**:
   ```
   FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app
   ```

   **CAMBIAR A (múltiples dominios separados por coma)**:
   ```
   FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://pasteleria-full-stack-final-61kamoyg5-tomasvaldivia20s-projects.vercel.app
   ```

   **O MEJOR (wildcard para TODOS los previews)**:
   ```
   FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app
   ```

3. **Guardar variable** → Railway redesplegará automáticamente (2-3 min)

### Verificar CORS después de desplegar

Abrir consola navegador (F12) en Vercel preview y ejecutar:

```javascript
// Test 1: Verificar endpoint existe
fetch('https://pasteleriafullstackfinal-production.up.railway.app/api/logs/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test 2: Enviar log (POST con CORS)
fetch('https://pasteleriafullstackfinal-production.up.railway.app/api/logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ logs: [{ level: 'info', message: 'Test CORS', timestamp: Date.now() }] })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Resultado esperado**:
- Test 1: `{ status: "UP", service: "Frontend Logging", maxBatchSize: 50 }`
- Test 2: `{ status: "success", logsReceived: 1, logsProcessed: 1 }`

---

## ✅ PARTE 3: VERIFICAR BACKEND RAILWAY (EJECUTAR DESPUÉS - 5 MINUTOS)

### Paso 1: Esperar Despliegue

Después de limpiar Supabase + actualizar `FRONTEND_URL`:
- **Esperar 5 minutos** para que Railway complete despliegue
- Railway detecta cambio de variable → Redespliega automáticamente

### Paso 2: Verificar Logs Railway

1. **Ir a Railway Dashboard** → Backend Service → **Deployments** → Click último despliegue
2. **Buscar en logs**:

**✅ Configuración HikariCP (debe mostrar valores hardcodeados)**:
```
maximumPoolSize.................2
minimumIdle.....................1
connectionTimeout...............20000
maxLifetime.....................1200000
leakDetectionThreshold..........15000
```

**✅ Conexión Supabase exitosa (buscar esta línea)**:
```
HikariPool-1 - Start completed.
```

**❌ SI TODAVÍA APARECE (limpiar Supabase de nuevo)**:
```
FATAL: Max client connections reached
HikariPool-1 - Exception during pool initialization
```

### Paso 3: Verificar CORS en logs

**Buscar línea**:
```
🌍 [CORS] Orígenes permitidos: [https://pasteleria-full-stack-final.vercel.app, https://*.vercel.app]
```

**Debe incluir**:
- Dominio producción Vercel
- **Y** patrón `https://*.vercel.app` o URL preview específica

---

## ✅ PARTE 4: HEALTH CHECKS FINALES

### Backend (Railway)

**Endpoint health**:
```bash
# PowerShell
Invoke-RestMethod https://pasteleriafullstackfinal-production.up.railway.app/actuator/health
```

**Resultado esperado**:
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" }
  }
}
```

### Frontend (Vercel)

**Probar desde consola navegador (F12)**:
```javascript
// Verificar API carga productos (sin CORS error)
fetch('https://pasteleriafullstackfinal-production.up.railway.app/api/productos')
  .then(r => r.json())
  .then(d => console.log('✅ Productos:', d.length))
  .catch(e => console.error('❌ Error:', e));
```

**Resultado esperado**:
- ✅ Productos: 10-50 (sin errores CORS)

### Supabase Conexiones

**Ejecutar en SQL Editor**:
```sql
SELECT state, COUNT(*) as total
FROM pg_stat_activity 
WHERE datname = 'postgres'
GROUP BY state;
```

**Resultado esperado**:
- `active`: 1-2
- `idle`: 0-1
- **Total ≤ 3** (Railway usa max 2 + tu consulta)

---

## 🔧 RESUMEN VARIABLES RAILWAY

### Variables OBLIGATORIAS (MANTENER)

```env
# Base de datos Supabase
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:6543/postgres?prepareThreshold=0
SPRING_DATASOURCE_USERNAME=postgres.dzbeucldelrjdjprfday
SPRING_DATASOURCE_PASSWORD=<TU_PASSWORD_SUPABASE>

# JWT
JWT_SECRET=<TU_SECRET_JWT_64_CHARS>
JWT_EXPIRATION=86400000

# CORS (ACTUALIZAR CON WILDCARD)
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app

# JVM (Railway Free Tier)
JAVA_TOOL_OPTIONS=-Xmx400m -Xms200m -XX:MaxMetaspaceSize=100m

# Spring Profile
SPRING_PROFILES_ACTIVE=production
```

### Variables ELIMINAR (ahora hardcodeadas en código)

```env
# ELIMINAR ESTAS - Ya están en application-production.properties
❌ SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=2
❌ SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=1
❌ SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT=20000
❌ SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT=600000
❌ SPRING_DATASOURCE_HIKARI_MAX_LIFETIME=1200000
❌ SPRING_DATASOURCE_HIKARI_LEAK_DETECTION_THRESHOLD=15000
```

---

## 🚨 SI RAILWAY SIGUE CRASHEANDO DESPUÉS DE 10 MINUTOS

### Opción 1: Clear Build Cache + Redeploy

1. Railway Dashboard → Backend Service → **Settings**
2. Scroll down → **Clear Build Cache**
3. Click botón **Clear Cache**
4. Regresar a **Deployments** → Click **Redeploy** en último deployment
5. **Esperar 5-7 minutos** para rebuild completo

### Opción 2: Verificar Git Commits

**Verificar commit más reciente incluye hardcoded values**:
```bash
# PowerShell (en carpeta proyecto)
cd E:\PROYECTOSPROGRAMACION\PasteleriaFullStackFinal
git log --oneline -5

# Debe mostrar commits recientes:
# 3cc9bf8 docs: Agregar script limpieza Supabase e instrucciones Railway finales
# 855608a fix(hikari): Forzar valores hardcodeados para evitar precedencia variables Railway
```

**Si NO aparece commit 855608a** (values no hardcodeados):
```bash
# Re-hacer commit y push
git add Backend/src/main/resources/application-production.properties
git commit -m "fix(hikari): Force hardcoded HikariCP values (maximumPoolSize=2, minimumIdle=1)"
git push origin master
```

### Opción 3: Revisar Logs Build

Railway Dashboard → Deployments → Click último → **Build Logs**

**Buscar**:
- ✅ `BUILD SUCCESS` (Maven compiló correctamente)
- ✅ `backend-0.0.1-SNAPSHOT.jar` (archivo .jar generado)
- ❌ `BUILD FAILURE` (error compilación - reportar stacktrace)

---

## 📊 CHECKLIST FINAL

**Antes de presentar (verificar TODO ✅)**:

- [ ] **Supabase**: Conexiones activas ≤ 3
- [ ] **Railway Backend**: Logs muestran `HikariPool-1 - Start completed`
- [ ] **Railway Backend**: Logs muestran `maximumPoolSize=2, minimumIdle=1`
- [ ] **Railway CORS**: Logs muestran `https://*.vercel.app` en orígenes permitidos
- [ ] **Health Check**: `/actuator/health` retorna `status: UP`
- [ ] **Frontend Vercel**: NO errores CORS en consola navegador (F12)
- [ ] **Frontend Vercel**: API `/api/productos` retorna datos
- [ ] **Frontend Vercel**: POST `/api/logs` retorna `status: success`

---

## 🆘 TROUBLESHOOTING RÁPIDO

### Problema: "Still crashing after 10 minutes"

**Acciones**:
1. Ejecutar Supabase limpieza PASO C (EMERGENCY - terminar TODAS)
2. Railway → Clear Build Cache
3. Esperar 7 minutos
4. Si persiste → Contactar soporte Railway (probablemente límite IP Supabase)

### Problema: "CORS error persists after updating FRONTEND_URL"

**Acciones**:
1. Verificar Railway desplegó después de cambiar variable (ver timestamp deployment)
2. Verificar logs Railway muestran nuevo valor `FRONTEND_URL`
3. Si desplegó pero CORS falla → Hard refresh frontend (Ctrl+Shift+R)
4. Si persiste → Verificar Vercel URL exacta (copiar de navegador)

### Problema: "Supabase connections keep coming back"

**Acciones**:
1. Verificar Railway desplegó después de limpiar Supabase
2. Si backend sigue intentando conectar cada 30seg → Railway crashloop
3. Solución: Clear Build Cache + Redeploy + Limpiar Supabase DESPUÉS del redeploy

---

## 📝 VARIABLES VERCEL (Frontend)

**Verificar configuración**:

1. Vercel Dashboard → Proyecto → **Settings** → **Environment Variables**

**Variable OBLIGATORIA**:
```env
VITE_API_URL=https://pasteleriafullstackfinal-production.up.railway.app
```

**⚠️ IMPORTANTE**: NO incluir `/api` al final (el código ya lo agrega).

---

## 🎯 TIEMPO ESTIMADO TOTAL

- **Limpiar Supabase**: 2 minutos
- **Actualizar FRONTEND_URL**: 1 minuto
- **Esperar despliegue Railway**: 5 minutos
- **Verificar health checks**: 2 minutos

**TOTAL**: ~10 minutos para tener sistema funcionando completamente.

---

## 📞 PRÓXIMOS PASOS DESPUÉS DE ARREGLAR

1. **Presentación**: Sistema debe estar 100% funcional
2. **Post-presentación**: Migrar a Supabase Tier con más conexiones (Free Tier = 15 conexiones límite)
3. **Optimización**: Considerar reducir `idleTimeout` a 300000 (5 min) para liberar zombies más rápido
4. **Monitoreo**: Configurar alertas Railway para crashloops (si vuelve a pasar)

---

**Última actualización**: 2025-12-02 18:13 UTC
