# 🚀 INSTRUCCIONES RAILWAY - CONFIGURACIÓN DEFINITIVA

## 📋 RESUMEN EJECUTIVO

**Problema identificado:** Supabase Free Tier permite MAX 20 conexiones concurrentes. Railway con HikariCP configurado a 3 conexiones + crash loops = saturación del pool PostgreSQL.

**Solución implementada:** 
- ✅ HikariCP reducido a **1 conexión única**
- ✅ Timeouts agresivos (reciclar cada 60 segundos)
- ✅ Flyway deshabilitado (migraciones ya aplicadas)
- ✅ Profile production con optimizaciones específicas

---

## ⚡ PASOS OBLIGATORIOS (ORDEN EXACTO)

### PASO 1: LIMPIAR CONEXIONES ZOMBIES EN SUPABASE

**Ir a:** Supabase Dashboard → SQL Editor

**Ejecutar SQL:**

```sql
-- 🔴 EMERGENCIA: Terminar TODAS las conexiones zombies
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'postgres' 
  AND pid <> pg_backend_pid()
  AND state IN ('idle', 'idle in transaction', 'idle in transaction (aborted)', 'disabled');

-- Verificar limpieza (debe retornar 1)
SELECT count(*) as conexiones_activas 
FROM pg_stat_activity 
WHERE datname = 'postgres';
```

**Resultado esperado:** `conexiones_activas: 1` (solo la sesión SQL actual)

---

### PASO 2: CONFIGURAR VARIABLES DE ENTORNO EN RAILWAY

**Ir a:** Railway Dashboard → Tu servicio → **Variables** → Raw Editor

**Pegar configuración completa:**

```env
# ===================================================================
# DATABASE - SUPABASE CONNECTION POOLER
# ===================================================================
DATABASE_URL=jdbc:postgresql://aws-0-us-west-1.pooler.supabase.com:6543/postgres?user=postgres.dzbeucldelrjdjprfday&password=TuPasswordSupabase2024

# ⚠️ IMPORTANTE: Reemplazar con TU password de Supabase
# Formato: postgres.TU_PROJECT_REF

# ===================================================================
# JWT - AUTENTICACION
# ===================================================================
JWT_SECRET=milsabores_secret_jwt_key_2024_super_seguro_no_compartir
JWT_EXPIRATION=86400000

# ===================================================================
# CORS - FRONTEND VERCEL
# ===================================================================
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app

# ===================================================================
# 🔴 HIKARICP - OPTIMIZADO PARA SUPABASE FREE TIER 🔴
# ===================================================================
HIKARI_MAX_POOL_SIZE=1
# ⚠️ CRÍTICO: Solo 1 conexión máxima
# Razón: Supabase Free = 20 conexiones totales
# Evita saturación del pool

HIKARI_MIN_IDLE=0
# ⚠️ No mantener conexiones idle
# Ahorra recursos cuando no hay tráfico

HIKARI_CONNECTION_TIMEOUT=5000
# 5 segundos timeout conexión

HIKARI_IDLE_TIMEOUT=30000
# 30 segundos → Cerrar conexión idle

HIKARI_MAX_LIFETIME=60000
# 60 segundos → Reciclar conexión cada minuto
# Previene conexiones zombies

HIKARI_LEAK_DETECTION_THRESHOLD=10000
# 10 segundos → Detectar leaks

# ===================================================================
# FLYWAY - DESHABILITADO
# ===================================================================
FLYWAY_ENABLED=false
# ⚠️ Migraciones YA aplicadas (V7 exitoso)
# Flyway consume 1 conexión que no libera en crash loops

# ===================================================================
# SPRING BOOT - PROFILE PRODUCTION
# ===================================================================
SPRING_PROFILES_ACTIVE=production
# Activa application-production.properties con optimizaciones

# ===================================================================
# LOGGING (OPCIONAL)
# ===================================================================
SHOW_SQL=false
# No mostrar queries SQL en logs (reduce noise)
```

**Guardar cambios** → Railway detectará automáticamente y preparará redeploy

---

### PASO 3: VERIFICAR CONFIGURACIÓN RAILWAY

**Railway Settings → Deploy:**

- ✅ **Build Command:** (detectado automáticamente de Maven)
- ✅ **Start Command:** `java -jar target/backend-0.0.1-SNAPSHOT.jar`
- ✅ **Port:** Detecta `$PORT` automáticamente
- ✅ **Health Check Path:** `/api/health` (opcional pero recomendado)

**Railway Settings → Networking:**

- ✅ **Generate Domain:** Activado (genera URL tipo `backend-production-xyz.up.railway.app`)

---

### PASO 4: FORZAR REDEPLOY EN RAILWAY

**Opción A - Desde Railway Dashboard:**
1. Ir a **Deployments** tab
2. Click en **Deploy** → **Deploy Latest**
3. Esperar logs de compilación

**Opción B - Desde Git (RECOMENDADO):**

```bash
# En tu terminal local
cd e:\PROYECTOSPROGRAMACION\PasteleriaFullStackFinal

# Verificar cambios
git status

# Agregar archivos modificados
git add Backend/src/main/resources/application-production.properties
git add Instrucciones/SOLUCION_DEFINITIVA_RAILWAY_SUPABASE.md
git add Instrucciones/INSTRUCCIONES_RAILWAY_VARIABLES.md

# Commit con mensaje descriptivo
git commit -m "fix: Optimizar HikariCP para Supabase Free Tier (1 conexión máxima)"

# Push a main (trigger Railway auto-deploy)
git push origin main
```

Railway detectará el push y desplegará automáticamente.

---

### PASO 5: MONITOREAR LOGS DE RAILWAY

**Railway Dashboard → Deployments → Click en deployment actual → Logs**

**✅ Logs exitosos (debe mostrar):**

```log
[INFO] HikariPool-1 - Starting...
[INFO] HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@...
[INFO] HikariPool-1 - Start completed.
[INFO] HikariPool-1 - Pool stats (total=1, active=0, idle=1, waiting=0)
[INFO] Started BackendApplication in 12.345 seconds (process running for 13.456)
```

**❌ Logs con error (VOLVER A PASO 1):**

```log
ERROR: Exception during pool initialization
PSQLException: FATAL: Max client connections reached
```

Si ves este error → Volver al PASO 1 (limpiar conexiones zombies Supabase)

---

## 🧪 TESTING - VERIFICAR QUE TODO FUNCIONA

### TEST 1: Health Check

```bash
curl https://tu-app.railway.app/api/health
```

**Respuesta esperada:**
```json
{
  "status": "UP",
  "timestamp": "2024-11-30T23:59:59"
}
```

---

### TEST 2: Login (JWT)

```bash
curl -X POST https://tu-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "tu_usuario@example.com",
    "contrasena": "tu_password"
  }'
```

**Respuesta esperada:**
```json
{
  "id": 1,
  "nombre": "Usuario",
  "apellido": "Test",
  "correo": "tu_usuario@example.com",
  "rol": "CLIENTE",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ Copiar el `token` para siguiente test**

---

### TEST 3: Perfil (Autenticado con JWT)

```bash
curl https://tu-app.railway.app/api/auth/perfil \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

Reemplazar `TU_TOKEN_AQUI` con el token del TEST 2.

**Respuesta esperada:**
```json
{
  "id": 1,
  "nombre": "Usuario",
  "apellido": "Test",
  "correo": "tu_usuario@example.com",
  "rol": "CLIENTE"
}
```

---

### TEST 4: Productos (Endpoint público)

```bash
curl https://tu-app.railway.app/api/productos
```

**Respuesta esperada:** Lista de productos JSON

---

## 📊 MONITOREO CONTINUO (PRIMERAS 24 HORAS)

### VERIFICAR CONEXIONES EN SUPABASE

**Ir a:** Supabase Dashboard → SQL Editor

**Ejecutar cada 1-2 horas:**

```sql
-- Ver estado actual de conexiones
SELECT 
    count(*) as total_conexiones,
    state,
    application_name
FROM pg_stat_activity 
WHERE datname = 'postgres'
GROUP BY state, application_name
ORDER BY total_conexiones DESC;
```

**Valores esperados:**
- ✅ `total_conexiones: 1-2` → Normal (HikariCP + 1 query)
- ⚠️ `total_conexiones: 3-5` → Investigar (posible leak)
- 🔴 `total_conexiones: > 10` → CRÍTICO (zombies regresaron)

---

### IDENTIFICAR CONEXIONES ZOMBIES

```sql
-- Detectar conexiones zombies
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change,
    now() - query_start as duracion,
    query
FROM pg_stat_activity 
WHERE datname = 'postgres'
  AND state IN ('idle in transaction', 'idle in transaction (aborted)')
ORDER BY query_start DESC;
```

**Si encuentra zombies:**
- Ejecutar SQL del PASO 1 (terminar conexiones zombies)
- Investigar qué endpoint/operación los está creando

---

## 🔄 TROUBLESHOOTING

### PROBLEMA: Railway sigue crasheando con "Max connections"

**Solución:**
1. Verificar que HIKARI_MAX_POOL_SIZE=1 (no 3)
2. Ejecutar PASO 1 (limpiar zombies Supabase)
3. Verificar que SPRING_PROFILES_ACTIVE=production
4. Forzar redeploy en Railway

---

### PROBLEMA: Backend lento o timeouts

**Causa:** Solo 1 conexión puede causar colas bajo tráfico alto

**Soluciones:**

**Opción A - Aumentar a 2 conexiones (si Supabase lo permite):**
```env
HIKARI_MAX_POOL_SIZE=2
HIKARI_MIN_IDLE=1
```

**Opción B - Upgradear Supabase a Pro:**
- $25/mes
- 500 conexiones concurrentes
- Mejor rendimiento

---

### PROBLEMA: Flyway intenta ejecutar migraciones

**Causa:** Variable FLYWAY_ENABLED no está configurada

**Solución:**
```env
FLYWAY_ENABLED=false
```

Guardar y redeploy.

---

### PROBLEMA: Frontend no conecta con backend

**Verificar CORS:**
1. Railway logs → Buscar "CORS" errors
2. Verificar FRONTEND_URL incluye tu dominio Vercel
3. Formato correcto:
   ```env
   FRONTEND_URL=https://tu-app.vercel.app,https://*.vercel.app
   ```

---

## 🆘 SI NADA FUNCIONA - PLAN DE EMERGENCIA

### OPCIÓN 1: Crear nuevo proyecto Supabase

Si las conexiones zombies persisten y no se pueden limpiar:

1. Crear nuevo proyecto en Supabase (conexiones frescas)
2. Copiar DATABASE_URL nueva a Railway
3. Habilitar Flyway temporalmente:
   ```env
   FLYWAY_ENABLED=true
   ```
4. Redeploy → Flyway ejecutará migraciones V1-V7
5. Deshabilitar Flyway nuevamente

---

### OPCIÓN 2: Usar PgBouncer (Connection Pooler externo)

Si necesitas más concurrencia sin upgradear Supabase:

1. Deployar PgBouncer en Railway (servicio separado)
2. Conectar backend a PgBouncer en vez de directamente a Supabase
3. PgBouncer maneja pool de conexiones eficientemente

**Ventajas:**
- ✅ Mejor manejo de conexiones
- ✅ Previene zombies automáticamente

**Desventajas:**
- ⚠️ Infraestructura adicional
- ⚠️ Más complejidad

---

## ✅ CHECKLIST FINAL

Antes de considerar el despliegue exitoso:

- [ ] **PASO 1:** SQL ejecutado en Supabase (zombies limpiados)
- [ ] **PASO 2:** Variables configuradas en Railway (HIKARI_MAX_POOL_SIZE=1)
- [ ] **PASO 3:** Railway settings verificados (Health check opcional)
- [ ] **PASO 4:** Redeploy forzado (git push o Railway Dashboard)
- [ ] **PASO 5:** Logs Railway exitosos (HikariPool-1 - Start completed)
- [ ] **TEST 1:** Health check responde (200 OK)
- [ ] **TEST 2:** Login funciona (retorna token)
- [ ] **TEST 3:** Perfil autenticado (JWT válido)
- [ ] **TEST 4:** Productos responde (endpoint público)
- [ ] **MONITOREO:** Conexiones Supabase < 5 (query SQL)

---

## 📝 NOTAS IMPORTANTES

### POR QUÉ ESTA SOLUCIÓN ES DEFINITIVA

**Problema raíz:** Supabase Free Tier tiene límite estricto de 20 conexiones TOTALES (no por app, sino compartidas entre TODAS las apps conectadas).

**Solución anterior (HIKARI_MAX_POOL_SIZE=3):**
- Railway app intenta crear 3 conexiones
- Si hay crash loop → cada restart intenta 3 más
- Rápidamente llega a 20/20 → pool saturado
- Backend no puede iniciar → crash infinito

**Solución actual (HIKARI_MAX_POOL_SIZE=1):**
- Railway app solo usa 1 conexión
- Conexión se recicla cada 60 segundos (max-lifetime)
- Si hay idle 30 segundos se cierra (idle-timeout)
- Leak detection a los 10 segundos
- Flyway deshabilitado (no consume conexión extra)
- **Resultado:** Solo 1 conexión activa, reciclado constante

**Ventajas:**
- ✅ Compatible con Supabase Free Tier (usa 5% del límite)
- ✅ Previene saturación del pool
- ✅ Evita crash loops
- ✅ Reciclado automático previene zombies
- ✅ No requiere infraestructura adicional

**Limitaciones:**
- ⚠️ **Concurrencia:** Solo 1 request simultáneo a DB
- ⚠️ **Rendimiento:** Puede ser lento bajo tráfico alto
- ⚠️ **Escalabilidad:** No escala a múltiples instancias Railway

**Cuándo upgradear:**
- Si tienes > 100 usuarios simultáneos → Supabase Pro ($25/mes)
- Si necesitas múltiples instancias → PgBouncer o connection pooler
- Si ves timeouts frecuentes → Aumentar a 2 conexiones (probar primero)

---

## 📞 CONTACTO Y SOPORTE

Si después de seguir TODOS los pasos el problema persiste:

1. **Revisar logs Railway:** Buscar errores específicos
2. **Ejecutar SQL monitoring:** Ver estado conexiones Supabase
3. **Verificar variables:** Confirmar HIKARI_MAX_POOL_SIZE=1
4. **Probar localmente:** Asegurar que backend compila sin errores

---

## 🎯 RESULTADO ESPERADO FINAL

- ✅ **Railway:** Backend desplegado y corriendo sin crashes
- ✅ **Supabase:** 1-2 conexiones activas máximo (monitoreo SQL)
- ✅ **Frontend Vercel:** Conecta exitosamente a Railway
- ✅ **JWT:** Login funciona, token se guarda, perfil autenticado
- ✅ **Endpoints:** Productos, categorías, órdenes funcionan
- ✅ **Estabilidad:** Sin crashes durante 24-48 horas

**Sistema completamente funcional y estable. 🚀**
