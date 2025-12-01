# 🚀 INSTRUCCIONES DE CONFIGURACIÓN RAILWAY

## 📌 ESTADO ACTUAL DEL DESPLIEGUE

### ✅ Acciones Completadas (Última: Fix Pool de Conexiones)

1. **CRITICAL FIX: Pool de Conexiones Optimizado** (commit PRÓXIMO)
   - **ERROR**: `FATAL: Max client connections reached` en Supabase
   - **CAUSA**: Supabase Free Tier = 20 conexiones máx, HikariCP con 5 conexiones/instancia
   - **SOLUCIÓN**: Reducir a 3 conexiones máx por instancia Railway
   - Configuración actualizada en `application.properties`

2. **V6 Problemático Eliminado** (commit b79ac70)
   - Archivo `V6__reset_admin_user_bcrypt.sql` removido del código
   - Flyway ahora saltará de V5 → V7 directamente
   
3. **V7 Migración Lista**
   - Archivo: `V7__cleanup_for_bcrypt_users.sql`
   - Elimina órdenes/usuarios en orden FK-safe
   - Crea usuarios BCrypt: admin@milsabores.cl, empleado@milsabores.cl

### ⚠️ PROBLEMA ACTUAL: POOL DE CONEXIONES SATURADO

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
-- Ejecutar en Supabase SQL Editor
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change
FROM pg_stat_activity
WHERE datname = 'postgres'
ORDER BY state_change DESC;

-- Contar conexiones por estado
SELECT state, COUNT(*) 
FROM pg_stat_activity 
WHERE datname = 'postgres' 
GROUP BY state;

-- TERMINAR CONEXIONES ZOMBIES (solo si es necesario)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND pid <> pg_backend_pid()
  AND state = 'idle'
  AND state_change < NOW() - INTERVAL '10 minutes';
```

**LOGS RAILWAY ESPERADOS DESPUÉS DEL FIX**:
```log
✅ HikariPool-1 - Starting...
✅ HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@...
✅ Flyway Community Edition 9.22.3 by Redgate
✅ Migrating schema "public" to version "7 - cleanup for bcrypt users"
✅ Successfully applied 1 migration to schema "public"
✅ Started BackendApplication in 12.345 seconds
```

---

## 📋 VERIFICACIÓN POST-DEPLOYMENT

### 1. Verificar Backend en Railway

**Logs Esperados (SUCCESS):**
```log
2025-12-01T00:XX:XX INFO o.f.core.internal.command.DbMigrate : Current version of schema "public": 5
2025-12-01T00:XX:XX INFO o.f.core.internal.command.DbMigrate : Migrating schema "public" to version "7 - cleanup for bcrypt users"
2025-12-01T00:XX:XX NOTICE: ✅ [V7] Usuario administrador creado correctamente con BCrypt
2025-12-01T00:XX:XX NOTICE: ✅ [V7] Usuario empleado creado correctamente con BCrypt
2025-12-01T00:XX:XX NOTICE: 🔐 [V7] Credentials - admin@milsabores.cl / admin
2025-12-01T00:XX:XX INFO Started BackendApplication in X.XXX seconds
```

**Logs de Error (FAILED - requiere reparación manual):**
```log
ERROR: Migration of schema "public" to version "6" failed!
# Si ves esto → ejecutar REPARACION_MANUAL_SUPABASE.sql
```

### 2. Verificar Supabase Database

Conectar a Supabase SQL Editor y ejecutar:

```sql
-- Verificar usuarios BCrypt creados
SELECT id, rut, nombre, correo, rol_id FROM usuarios ORDER BY id;
-- Esperado:
-- 1 | 11111111-1 | Administrador | admin@milsabores.cl | (ADMIN)
-- 2 | 22222222-2 | Empleado | empleado@milsabores.cl | (EMPLEADO)

-- Verificar historial Flyway
SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;
-- Esperado: versión 7 con success=true
```

### 3. Probar Frontend

#### Login Administrador
- **URL:** https://pasteleria-full-stack-final.vercel.app/login
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
