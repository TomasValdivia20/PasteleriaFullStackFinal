# 🚂 RAILWAY - INSTRUCCIONES DE DEPLOYMENT FINAL

## 📋 PROBLEMA RESUELTO
**Fecha**: 2025-12-02  
**Commit Fix**: `855608a`  
**Issue**: Railway crasheando con `FATAL: Max client connections reached`  
**Causa Raíz**: Variables de entorno `SPRING_DATASOURCE_HIKARI_*` NO aplicadas (precedencia incorrecta)  
**Solución**: Valores HikariCP hardcodeados en `application-production.properties`

---

## ⚡ PASOS URGENTES (AHORA)

### 1️⃣ LIMPIAR CONEXIONES SUPABASE (MIENTRAS RAILWAY REDEPLOYA)

Railway detectó el commit `855608a` y está auto-deployando. Mientras tanto, limpia conexiones zombie en Supabase:

#### a) Abrir Supabase SQL Editor
1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Proyecto: `dzbeucldelrjdjprfday`
3. Menú lateral → **SQL Editor** → **New Query**

#### b) Ejecutar Script de Limpieza
```sql
-- PASO 1: Ver conexiones actuales (diagnóstico)
SELECT 
    pid,
    usename,
    state,
    EXTRACT(EPOCH FROM (NOW() - state_change)) AS seconds_idle,
    query
FROM pg_stat_activity
WHERE datname = 'postgres'
ORDER BY state_change ASC;

-- PASO 2: Terminar conexiones IDLE (zombies de Railway)
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND state = 'idle'
  AND EXTRACT(EPOCH FROM (NOW() - state_change)) > 60
  AND pid <> pg_backend_pid();

-- PASO 3: Verificar limpieza
SELECT state, COUNT(*) 
FROM pg_stat_activity
WHERE datname = 'postgres'
GROUP BY state;
```

**Archivo completo**: `SUPABASE_LIMPIEZA_CONEXIONES.sql` (en raíz del proyecto)

---

### 2️⃣ ESPERAR AUTO-DEPLOY RAILWAY (3-5 MINUTOS)

Railway detectó el push del commit `855608a` y está rebuildeando:
- **Build**: Maven con flag `-U` (nixpacks.toml)
- **Deploy**: Spring Boot con `maximumPoolSize=2` hardcodeado
- **Logs**: Verificar línea `maximumPoolSize.................2` (NO 10)

#### Cómo verificar:
1. Abrir [Railway Dashboard](https://railway.app/)
2. Proyecto → Backend Service → **Deployments**
3. Buscar deployment con commit hash `855608a` o posterior
4. Click → **View Logs**

---

### 3️⃣ VERIFICAR LOGS RAILWAY (DESPUÉS DE DEPLOYMENT)

**Buscar en logs de Railway:**

✅ **CORRECTO** (maximumPoolSize=2):
```
HikariPool-1 - configuration:
maximumPoolSize.................2
minimumIdle.....................1
connection-timeout..............20000
```

❌ **INCORRECTO** (si aún muestra 10):
```
maximumPoolSize.................10
minimumIdle.....................10
```

**Si SIGUE mostrando 10**:
1. Ir a Railway → Settings → **Clear Build Cache**
2. Redeploy manual: **Deploy** → **Redeploy**
3. Esperar 3-5 minutos
4. Verificar logs nuevamente

---

## 🔧 CONFIGURACIÓN RAILWAY

### Variables de Entorno OBLIGATORIAS

Railway Dashboard → Backend Service → **Variables**:

```bash
# ===================================================================
# SUPABASE DATABASE (OBLIGATORIO)
# ===================================================================
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:6543/postgres?prepareThreshold=0
SPRING_DATASOURCE_USERNAME=postgres.dzbeucldelrjdjprfday
SPRING_DATASOURCE_PASSWORD=PasteleriaMilSabores123!

# ===================================================================
# JWT SECURITY (OBLIGATORIO)
# ===================================================================
JWT_SECRET=milsabores-secret-key-super-secure-2024-pasteleria-jwt-token-security-production
JWT_EXPIRATION=86400000

# ===================================================================
# CORS FRONTEND (OBLIGATORIO)
# ===================================================================
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app

# ===================================================================
# SPRING PROFILE (OBLIGATORIO)
# ===================================================================
SPRING_PROFILES_ACTIVE=production

# ===================================================================
# SUPABASE STORAGE (OBLIGATORIO)
# ===================================================================
SUPABASE_URL=https://dzbeucldelrjdjprfday.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6YmV1Y2xkZWxyamRqcHJmZGF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQ3MDk2NCwiZXhwIjoyMDgwMDQ2OTY0fQ.0XDnf8MC6C8h8uaQvkst0IOYXGwsApCJJluPLGfKwD4
SUPABASE_BUCKET=pasteles

# ===================================================================
# JVM OPTIMIZATION (OBLIGATORIO - Railway Free Tier)
# ===================================================================
JAVA_TOOL_OPTIONS=-Xmx400m -Xms200m -XX:MaxMetaspaceSize=100m

# ===================================================================
# FLYWAY (OBLIGATORIO)
# ===================================================================
FLYWAY_ENABLED=false

# ===================================================================
# JPA CONFIGURATION (OBLIGATORIO)
# ===================================================================
SPRING_JPA_OPEN_IN_VIEW=true
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false
SPRING_JPA_PROPERTIES_HIBERNATE_FORMAT_SQL=false
```

### ⚠️ VARIABLES HIKARI REMOVIDAS (NO USAR)

**NO agregar estas variables** (ahora hardcodeadas en código):
```bash
# ❌ NO USAR - Causaban precedencia incorrecta
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=2
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=1
SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT=20000
SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT=600000
SPRING_DATASOURCE_HIKARI_MAX_LIFETIME=1200000
SPRING_DATASOURCE_HIKARI_LEAK_DETECTION_THRESHOLD=15000
```

**Razón**: Spring Boot en Railway NO aplicaba estas variables correctamente. Valores ahora hardcodeados en `application-production.properties` (commit `855608a`).

---

## 🧪 HEALTH CHECK (VERIFICACIÓN POST-DEPLOYMENT)

### 1. Backend Railway Health
Ejecutar en terminal:
```powershell
Invoke-RestMethod https://TU-BACKEND.railway.app/actuator/health
```

**Respuesta esperada**:
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

### 2. Verificar CORS
Desde frontend Vercel, abrir DevTools → Console:
```javascript
fetch('https://TU-BACKEND.railway.app/api/productos')
  .then(r => r.json())
  .then(data => console.log('✅ CORS OK:', data.length + ' productos'))
  .catch(err => console.error('❌ CORS FAIL:', err));
```

### 3. Verificar Conexiones Supabase
Ejecutar en Supabase SQL Editor:
```sql
SELECT state, COUNT(*) 
FROM pg_stat_activity
WHERE datname = 'postgres'
GROUP BY state;
```

**Resultado esperado** (después del fix):
```
state           | count
----------------|------
active          | 1-2
idle            | 0-1
```

**❌ Si count > 5**: Volver a ejecutar script de limpieza (`SUPABASE_LIMPIEZA_CONEXIONES.sql`)

---

## 📊 TROUBLESHOOTING

### Problema: Railway sigue crasheando después de deployment

**Solución 1**: Verificar commit hash en Railway Deployments
```bash
# Debe mostrar commit 855608a o posterior
# Si muestra commit anterior (ej: cf49aad), redeploy manual
```

**Solución 2**: Clear Build Cache
1. Railway → Settings → **Clear Build Cache**
2. Railway → Deployments → **Redeploy**
3. Esperar 5 minutos
4. Verificar logs: `maximumPoolSize.................2`

**Solución 3**: Verificar Supabase tiene <5 conexiones
```sql
-- Ejecutar en Supabase SQL Editor
SELECT COUNT(*) FROM pg_stat_activity WHERE datname = 'postgres';
```
- Si count > 10: Ejecutar `SUPABASE_LIMPIEZA_CONEXIONES.sql` PASO 3 OPCIÓN B

**Solución 4**: Verificar variables de entorno Railway
- NO debe haber variables `SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE` (conflicto)
- DEBE haber variables obligatorias (ver sección anterior)

---

### Problema: Logs muestran `maximumPoolSize=10` después del fix

**Causa**: Railway usó build cache antiguo antes de commit `855608a`

**Solución NUCLEAR** (último recurso):
1. Railway → Settings → **Clear Build Cache**
2. Railway → Deployments → Buscar deployment con commit `855608a`
3. Click → **Redeploy**
4. Esperar rebuild completo (5-7 minutos)
5. Verificar logs: debe mostrar `maximumPoolSize=2`

Si SIGUE mostrando 10:
- Verificar `application-production.properties` en GitHub (debe tener valores hardcodeados sin `${}`)
- Verificar Railway está usando rama `master` (no otras ramas)

---

### Problema: Frontend Vercel no conecta (CORS error)

**Verificar variable Railway**:
```bash
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app
```

**Verificar variable Vercel**:
```bash
VITE_API_URL=https://TU-BACKEND.railway.app
# ⚠️ SIN /api al final
```

**Test rápido**:
```powershell
# Desde terminal Windows
Invoke-WebRequest https://TU-BACKEND.railway.app/api/productos -Headers @{"Origin"="https://pasteleria-full-stack-final.vercel.app"}
```
- Si status `200`: CORS OK
- Si status `403`/`500`: Variable `FRONTEND_URL` incorrecta en Railway

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **Fix HikariCP**: Este documento
- **Variables Railway completas**: `RAILWAY_VARIABLES_OBLIGATORIAS.md`
- **Deployment consolidado**: `DEPLOYMENT_FINAL.md`
- **Limpieza Supabase**: `SUPABASE_LIMPIEZA_CONEXIONES.sql`
- **Nixpacks config**: `Backend/nixpacks.toml`

---

## 🎯 CHECKLIST FINAL

Después del deployment de commit `855608a`:

- [ ] Railway logs muestran `maximumPoolSize=2` (NO 10)
- [ ] Railway logs muestran `minimumIdle=1` (NO 10)
- [ ] Health check `/actuator/health` responde `status: UP`
- [ ] Supabase tiene <5 conexiones activas
- [ ] Frontend Vercel carga sin errores CORS
- [ ] Backend responde en `https://TU-BACKEND.railway.app/api/productos`
- [ ] No hay errores `Max client connections reached` en logs

**Si TODAS las tareas OK**: ✅ Deployment exitoso  
**Si ALGUNA falla**: Revisar sección Troubleshooting

---

## 🔄 CAMBIOS APLICADOS (COMMIT 855608a)

### Archivo: `Backend/src/main/resources/application-production.properties`

**ANTES** (valores con variables de entorno):
```properties
spring.datasource.hikari.maximum-pool-size=${SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE:2}
spring.datasource.hikari.minimum-idle=${SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE:1}
```

**DESPUÉS** (valores hardcodeados):
```properties
spring.datasource.hikari.maximum-pool-size=2
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.max-lifetime=1200000
spring.datasource.hikari.leak-detection-threshold=15000
```

**Razón**: Railway NO aplicaba variables de entorno con prefijo `SPRING_DATASOURCE_HIKARI_*` correctamente. Fix temporal hardcodeando valores conservadores (2/1) hasta resolver precedencia.

---

## ⏱️ TIMELINE ESPERADO

1. **T+0min**: Push commit `855608a` → GitHub
2. **T+1min**: Railway detecta push → Auto-build inicia
3. **T+3min**: Maven rebuild con `-U` flag → Compila .jar nuevo
4. **T+5min**: Railway deploy completo → Logs disponibles
5. **T+6min**: Health check OK → Backend funcionando
6. **T+7min**: Frontend Vercel conecta → Sin errores CORS

**Tiempo total**: ~7 minutos desde push hasta deployment completo

---

## 📞 SOPORTE

Si después de seguir TODOS los pasos el deployment sigue fallando:

1. Capturar screenshot de:
   - Railway logs (últimas 100 líneas)
   - Variables de entorno Railway
   - Supabase conexiones activas (query count)

2. Verificar commit hash en Railway Deployments:
   - DEBE ser `855608a` o posterior
   - Si es anterior: Clear Build Cache + Redeploy

3. Último recurso:
   - Ejecutar `SUPABASE_LIMPIEZA_CONEXIONES.sql` PASO 4 (terminar TODAS las conexiones)
   - Clear Build Cache Railway
   - Redeploy manual
   - Esperar 7 minutos

---

**Última actualización**: 2025-12-02  
**Commit de referencia**: `855608a`  
**Estado**: CRÍTICO - Fix deployment blocker
