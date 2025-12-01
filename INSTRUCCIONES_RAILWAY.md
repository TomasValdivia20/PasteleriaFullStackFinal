# 🚀 INSTRUCCIONES DE CONFIGURACIÓN RAILWAY

## 📌 ESTADO ACTUAL DEL DESPLIEGUE

### 🔴 SITUACIÓN CRÍTICA: CONEXIONES ZOMBIES EN SUPABASE

**PROBLEMA DETECTADO EN LOGS**: Railway NO puede conectarse a Supabase
- **ERROR**: `FATAL: Max client connections reached` (múltiples reinicios)
- **VERIFICACIÓN USUARIO**: Conexiones en estado `idle in transaction (aborted)` y `null`
- **CAUSA**: Conexiones zombies NO se liberan automáticamente en Supabase

### ✅ SOLUCIÓN IMPLEMENTADA (Requiere Acción Manual)

1. **CRITICAL FIX: Pool de Conexiones Optimizado** ✅ (commit b8b5233)
   - Reducción: 5 → 3 conexiones máximas por instancia
   - `max-lifetime`: 30min → 20min (evita zombies)
   - `leak-detection-threshold`: 15s (detecta conexiones no cerradas)
   - ⚠️ **Railway puede estar usando JAR cacheado antiguo**

2. **V7 Migración Completada en Supabase** ✅
   - Usuario confirmó: admin@milsabores.cl y empleado@milsabores.cl existen
   - BCrypt implementado correctamente

3. **V6 Problemático Eliminado** ✅ (commit b79ac70)
   - Archivo `V6__reset_admin_user_bcrypt.sql` removido

### 🚨 ACCIONES REQUERIDAS URGENTES

**PASO 1: LIMPIAR CONEXIONES ZOMBIES EN SUPABASE** (CRÍTICO)
```bash
# Abrir archivo creado: Instrucciones/EMERGENCIA_SUPABASE_LIMPIAR_CONEXIONES.sql
# Ejecutar en Supabase Dashboard > SQL Editor
# 
# Esto terminará conexiones "idle in transaction (aborted)"
# Liberará el pool de 20 conexiones para que Railway pueda conectarse
```

**PASO 2: FORZAR REDEPLOY EN RAILWAY**
```bash
# Railway Dashboard > Tu Proyecto > Deployments
# Click botón "Redeploy" (flechas circulares)
# 
# Esto forzará rebuild con commit b8b5233 (pool optimizado)
# NO usar JAR cacheado
```

**PASO 3: VERIFICAR LOGS**
```bash
# Buscar en Railway logs:
# ✅ "HikariPool-1 - Start completed"
# ✅ "Started BackendApplication in X.XXX seconds"
# ✅ "Flyway Community Edition 9.22.3 by Redgate"
# ✅ "Validated 7 migrations (execution time 00:00.XXXs)"
# 
# ❌ Si ves "Max client connections reached" → Volver a PASO 1
```

---

### ⚠️ PROBLEMA DIAGNOSTICADO: CONEXIONES ZOMBIES + JAR ANTIGUO

**ERROR EN RAILWAY LOGS**:
```
FATAL: Max client connections reached
org.postgresql.util.PSQLException: FATAL: Max client connections reached
```

**DIAGNÓSTICO**:
- Supabase Free Tier: **20 conexiones máximas totales**
- Railway puede ejecutar múltiples instancias o reiniciar constantemente
- HikariCP intentaba abrir 5 conexiones por instancia → saturación

**SOLUCIÓN IMPLEMENTADA** (próximo commit):
```properties
# CRITICAL: Máximo 3 conexiones por instancia Railway
spring.datasource.hikari.maximum-pool-size=3
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1200000
spring.datasource.hikari.leak-detection-threshold=15000
```

---

## 🔧 CONFIGURACIÓN RAILWAY (Ya Configurado)

### Variables de Entorno Actuales

```env
# Seguridad JWT
JWT_SECRET=[configurado en Railway dashboard]
JWT_EXPIRATION=86400000

# Frontend CORS
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app

# Base de datos
DATABASE_URL=[Supabase connection string - configurado]

# Perfil Spring
SPRING_PROFILES_ACTIVE=production
```

### Diferencias Railway vs Vercel

| Aspecto | Vercel (Frontend) | Railway (Backend) |
|---------|-------------------|-------------------|
| **Deploy Trigger** | git push a `master` | git push a `master` |
| **Build Command** | `npm run build` | Maven `package` |
| **Start Command** | Serve estático | `java -jar backend.jar` |
| **Variables** | Vercel dashboard | Railway dashboard |
| **Migraciones DB** | N/A | Flyway (auto) |
| **Health Check** | N/A | `/actuator/health` |
| **Logs** | Vercel dashboard | Railway dashboard |

### Auto-Deploy Configurado

✅ **Railway auto-detecta cambios en `master`**
- Cada `git push origin master` dispara rebuild automático
- No requiere configuración manual adicional
- Flyway ejecuta migraciones en startup

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema Actual: Flyway Stuck en V6

**Síntomas:**
- Railway logs muestran: `Migration of schema "public" to version "6" failed!`
- Backend no inicia
- Frontend muestra timeout errors

**Causa Raíz:**
- Tabla `flyway_schema_history` en Supabase tiene registro de V6 fallido
- Flyway NO ejecuta migraciones futuras después de un fallo
- V6 intentaba `DELETE FROM usuarios` violando FK constraint `fk_orden_usuario`

**Solución Implementada:**
1. ✅ Eliminar V6 del código (commit b79ac70)
2. ⏳ Railway rebuildeando sin V6
3. ⏳ Flyway ejecutará V7 directamente

**Si Railway sigue fallando:** 
1. **Primero**: Verificar conexiones saturadas en Supabase (ver sección Pool de Conexiones)
2. **Segundo**: Ejecutar `REPARACION_MANUAL_SUPABASE.sql` para limpiar Flyway

---

## 🔧 SOLUCIÓN DE PROBLEMAS: POOL DE CONEXIONES SATURADO

### ERROR: `FATAL: Max client connections reached`

**DIAGNÓSTICO**:
- **Supabase Free Tier**: 20 conexiones máximas totales
- **Railway**: Puede ejecutar múltiples instancias o reiniciar constantemente
- **HikariCP**: Intentaba abrir 5 conexiones/instancia → saturación

**CONFIGURACIÓN IMPLEMENTADA** (`application.properties`):
```properties
# CRITICAL: Máximo 3 conexiones por instancia Railway
spring.datasource.hikari.maximum-pool-size=3
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1200000
spring.datasource.hikari.leak-detection-threshold=15000
```

**VARIABLES DE ENTORNO RAILWAY** (opcional para reducir más):
```bash
# Si Railway ejecuta múltiples instancias simultáneas:
HIKARI_MAX_POOL_SIZE=2
HIKARI_MIN_IDLE=1
```

**VERIFICAR CONEXIONES ACTIVAS EN SUPABASE**:
```sql
-- PASO 1: Ver estado actual (ejecutar en Supabase SQL Editor)
SELECT state, COUNT(*) as total_conexiones
FROM pg_stat_activity 
WHERE datname = 'postgres'
GROUP BY state;

-- PASO 2: Ver detalles de conexiones problemáticas
SELECT pid, state, state_change, NOW() - state_change AS tiempo_en_estado
FROM pg_stat_activity
WHERE datname = 'postgres' 
  AND state IN ('idle in transaction', 'idle in transaction (aborted)')
ORDER BY state_change;

-- PASO 3: TERMINAR CONEXIONES ZOMBIES (CRITICAL)
-- Ver archivo: Instrucciones/EMERGENCIA_SUPABASE_LIMPIAR_CONEXIONES.sql
```

**LOGS ESPERADOS DESPUÉS DE FIX**:
```
✅ HikariPool-1 - Starting...
✅ HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@...
✅ HikariPool-1 - Start completed
✅ Flyway Community Edition 9.22.3 by Redgate
✅ Validated 7 migrations (execution time 00:00.XXXs)
✅ Started BackendApplication in 12.XXX seconds
```

**SI RAILWAY SIGUE FALLANDO**:
1. Ejecutar `EMERGENCIA_SUPABASE_LIMPIAR_CONEXIONES.sql` en Supabase
2. Reducir aún más: Agregar variable `HIKARI_MAX_POOL_SIZE=2` en Railway
3. Forzar redeploy en Railway (botón "Redeploy")
4. Monitorear logs en tiempo real

---

## 📋 VERIFICACIÓN POST-DEPLOYMENT

### 1. Verificar Backend Railway

```bash
# URL Backend Railway
https://pasteleriafullstackfinal-production.up.railway.app

# Health Check
curl https://pasteleriafullstackfinal-production.up.railway.app/actuator/health

# Respuesta esperada:
# {"status":"UP"}
```

### 2. Verificar Flyway Migrations en Supabase

```sql
-- Ejecutar en Supabase SQL Editor
SELECT version, description, installed_on, success
FROM flyway_schema_history
ORDER BY installed_rank DESC;

-- ESPERADO DESPUÉS DE FIX:
-- version | description | success
-- 7 | cleanup for bcrypt users | true
-- 5 | ... | true
-- 
-- SI VES version=6 con success=false:
-- → Ejecutar Instrucciones/REPARACION_MANUAL_SUPABASE.sql
```

### 3. Verificar Usuarios BCrypt Creados

### 3. Verificar Usuarios BCrypt Creados

```sql
-- Verificar usuarios creados por V7 (en Supabase SQL Editor)
SELECT id, rut, nombre, correo, rol_id FROM usuarios ORDER BY id;

-- ESPERADO (confirmado por usuario):
-- 1 | 11111111-1 | Administrador | admin@milsabores.cl | (ADMIN)
-- 2 | 22222222-2 | Empleado | empleado@milsabores.cl | (EMPLEADO)
```

### 4. Probar Frontend Vercel

#### Login Administrador ✅
- **URL:** https://pasteleria-full-stack-final.vercel.app/login
- **Credenciales:**
  * Email: `admin@milsabores.cl`
  * Password: `admin`
- **Esperado:** Redirección a `/backoffice` después de login exitoso

#### Login Empleado ✅
- **Email:** `empleado@milsabores.cl`
- **Password:** `empleado`
- **Esperado:** Acceso a backoffice con permisos limitados

#### Verificar Categorías NO Timeout
- **URL:** https://pasteleria-full-stack-final.vercel.app
- **Esperado:** Categorías cargan en < 3 segundos
- **Consola Chrome (F12):** Debe mostrar `✅ [RESPONSE SUCCESS] 200` sin `timeout of 10000ms exceeded`

---

## 🔐 CREDENCIALES FINALES (PRODUCCIÓN)

```bash
# BACKEND RAILWAY
URL: https://pasteleriafullstackfinal-production.up.railway.app
Health: https://pasteleriafullstackfinal-production.up.railway.app/actuator/health

# FRONTEND VERCEL
URL: https://pasteleria-full-stack-final.vercel.app

# USUARIOS BCrypt (Supabase)
Admin: admin@milsabores.cl / admin
Empleado: empleado@milsabores.cl / empleado

# SUPABASE DATABASE
Dashboard: https://supabase.com/dashboard/project/dzbeucldelrjdjprfday
SQL Editor: https://supabase.com/dashboard/project/dzbeucldelrjdjprfday/sql
```

---

## 🚨 REPARACIÓN DE EMERGENCIA

### Si Railway NO inicia después de limpieza de conexiones:

1. **Ejecutar EMERGENCIA_SUPABASE_LIMPIAR_CONEXIONES.sql** (Paso 1-4)
   - Termina conexiones zombies
   - Verifica que hay < 10 conexiones activas

2. **Reducir Pool a 2 Conexiones** (Railway Variables)
   ```bash
   HIKARI_MAX_POOL_SIZE=2
   HIKARI_MIN_IDLE=1
   ```

3. **Forzar Redeploy en Railway**
   - Railway Dashboard → Deployments → Redeploy

4. **Si FLYWAY falla con V6**
   - Ejecutar `Instrucciones/REPARACION_MANUAL_SUPABASE.sql`
   - Eliminar registro V6 de `flyway_schema_history`

---

## 📊 RESUMEN ARQUITECTURA DESPLEGADA

```
┌──────────────────────────────────────────────────────────────┐
│                       USUARIO FINAL                           │
└──────────────┬───────────────────────────────────────────────┘
               │
               │ HTTPS
               ▼
┌──────────────────────────────────────────────────────────────┐
│  VERCEL (Frontend - React + Vite)                            │
│  URL: https://pasteleria-full-stack-final.vercel.app        │
│  - Auto-deploy desde master                                 │
│  - Variables: VITE_API_URL, VITE_SUPABASE_*                 │
└──────────────┬───────────────────────────────────────────────┘
               │
               │ REST API (JWT Auth)
               ▼
┌──────────────────────────────────────────────────────────────┐
│  RAILWAY (Backend - Spring Boot 3.2.3 + PostgreSQL)         │
│  URL: https://pasteleriafullstackfinal-production...        │
│  - Auto-deploy desde master (Maven build)                   │
│  - HikariCP: 3 conexiones máx (optimizado)                  │
│  - Flyway: migraciones automáticas                          │
│  - Variables: JWT_SECRET, FRONTEND_URL, DATABASE_URL        │
└──────────────┬───────────────────────────────────────────────┘
               │
               │ PostgreSQL Connection (max 3 per instance)
               ▼
┌──────────────────────────────────────────────────────────────┐
│  SUPABASE (PostgreSQL + Storage)                             │
│  - Database: postgres (Free Tier: 20 conexiones máx)        │
│  - Storage: Bucket 'pasteles' (imágenes productos)          │
│  - Transaction Pooler: prepareThreshold=0                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 📝 PRÓXIMOS PASOS RECOMENDADOS

### Optimización Performance
1. ✅ Pool de conexiones optimizado (3 máx)
2. ⏳ Monitorear logs Railway para leak-detection warnings
3. ⏳ Considerar Supabase Pro si se necesitan > 6 instancias Railway

### Seguridad
1. ✅ BCrypt passwords implementado
2. ✅ JWT con secret en variables de entorno
3. ⏳ Rotar JWT_SECRET cada 90 días
4. ⏳ Implementar rate limiting para login

### Monitoreo
1. ⏳ Configurar alertas Railway para `Max client connections`
2. ⏳ Dashboard Supabase para monitorear conexiones activas
3. ⏳ Logs centralizados (Sentry/Datadog)

---

**ÚLTIMA ACTUALIZACIÓN**: 2024-12-01 - Fix Pool Conexiones + Limpieza Zombies
**ESTADO**: ⏳ Requiere ejecución manual de scripts SQL en Supabase
**PRÓXIMO HITO**: Verificar frontend conecta correctamente después de fix
- **Credenciales:**
  ```
  Email: admin@milsabores.cl
  Password: admin
  ```
- **Esperado:** Redirect a `/backoffice` después de login exitoso

#### Productos
- **URL:** https://pasteleria-full-stack-final.vercel.app
- **Esperado:** Grid de productos carga en 2-3 segundos
- **NO debería:** Mostrar timeout de 10000ms

#### Registro Nuevo Usuario
- **URL:** https://pasteleria-full-stack-final.vercel.app/registro
- **Esperado:** Formulario funcional, auto-login después de registro
- **NO debería:** Auto-logout en página "Mi Cuenta"

---

## 🔐 CREDENCIALES DE PRUEBA

### Admin (BCrypt)
```
Email: admin@milsabores.cl
Password: admin
Hash: $2a$10$b8Daf5C1826zxcj5BCywW.oxAbpBs5r6/waPGslCtbjMjvuKJjb7i
```

### Empleado (BCrypt)
```
Email: empleado@milsabores.cl
Password: admin
Hash: $2a$10$b8Daf5C1826zxcj5BCywW.oxAbpBs5r6/waPGslCtbjMjvuKJjb7i
```

---

## ⚠️ ADVERTENCIAS IMPORTANTES

### Impacto de V7 Migración

**DATOS ELIMINADOS:**
- ✅ **TODOS** los registros de `detalles_orden` (cascading)
- ✅ **TODAS** las órdenes en `ordenes` (tabla completa)
- ✅ **TODOS** los usuarios en `usuarios` (tabla completa)

**DATOS CREADOS:**
- ✅ Usuario admin@milsabores.cl (ID=1)
- ✅ Usuario empleado@milsabores.cl (ID=2)
- ✅ Passwords con BCrypt (hash completo, no plaintext)

**SECUENCIAS RESETEADAS:**
```sql
usuarios_id_seq → restart with 1
ordenes_id_seq → restart with 1
detalles_orden_id_seq → restart with 1
```

---

## 📊 MONITOREO RAILWAY

### Verificar Deployment Status

1. **Railway Dashboard:** https://railway.app
2. **Project:** PasteleriaFullStackFinal (Backend)
3. **Deployments Tab:** Ver último deployment
4. **Logs:** Filtrar por "Flyway" o "BackendApplication"

### Health Check Endpoint

Railway monitorea automáticamente: `GET /actuator/health`

```json
{
  "status": "UP"
}
```

---

## 🆘 SI TODO FALLA

### Opción Nuclear: Reset Completo Flyway

**SOLO usar si:**
- Railway sigue crasheando después de 3+ intentos
- Logs muestran errores de Flyway persistentes
- Reparación manual no funcionó

**Pasos:**
1. Ejecutar en Supabase SQL Editor:
   ```sql
   -- ADVERTENCIA: Elimina TODO el historial de Flyway
   TRUNCATE TABLE flyway_schema_history;
   ```

2. Editar `application-production.properties`:
   ```properties
   # Agregar temporalmente:
   spring.flyway.baseline-on-migrate=true
   spring.flyway.baseline-version=0
   ```

3. Rebuild y push:
   ```bash
   cd Backend
   .\mvnw.cmd clean package -DskipTests
   git add -A
   git commit -m "fix(flyway): reset completo baseline"
   git push origin master
   ```

4. Flyway ejecutará TODAS las migraciones desde V1

---

## 📞 SOPORTE

**Errores Comunes:**

1. **"FK constraint violation"** → V7 ya debería resolver esto
2. **"Flyway failed on migration 6"** → Ejecutar REPARACION_MANUAL_SUPABASE.sql
3. **"Unable to start embedded Tomcat"** → Ver logs completos de Railway
4. **Frontend timeout** → Backend no inició, verificar Railway logs

**Archivos de Ayuda:**
- `Backend/INSTRUCCIONES_REPARACION_FLYWAY.md` → Guía completa de reparación
- `Backend/REPARACION_MANUAL_SUPABASE.sql` → Script SQL de emergencia
- Railway Logs → Diagnóstico en tiempo real
