# 🔴 SOLUCIÓN DEFINITIVA: Railway + Supabase Free Tier

## PROBLEMA IDENTIFICADO

**Supabase Free Tier:** 20 conexiones concurrentes MÁXIMO TOTAL  
**Railway con HikariCP:** Configurado a 3 conexiones  
**Crash loops:** Cada reinicio intenta crear 3 nuevas conexiones  
**Resultado:** Pool saturado (20/20) → Backend no puede iniciar

---

## ⚡ ACCIÓN INMEDIATA (EJECUTAR AHORA)

### 1. LIMPIAR CONEXIONES ZOMBIES EN SUPABASE

Ir a **Supabase SQL Editor** y ejecutar:

```sql
-- 🔴 EMERGENCIA: Terminar TODAS las conexiones zombies
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'postgres' 
  AND pid <> pg_backend_pid()
  AND state IN ('idle', 'idle in transaction', 'idle in transaction (aborted)', 'disabled');

-- Verificar que solo quede 1 conexión (la actual)
SELECT count(*) as conexiones_activas FROM pg_stat_activity WHERE datname = 'postgres';
-- ✅ Debe retornar: 1
```

---

## 🛠️ CONFIGURACIÓN RAILWAY (VARIABLES DE ENTORNO)

### 2. ACTUALIZAR VARIABLES EN RAILWAY

Ir a **Railway Dashboard** → Tu servicio → **Variables** → Agregar/Modificar:

```env
# === DATABASE (YA CONFIGURADO) ===
DATABASE_URL=jdbc:postgresql://aws-0-us-west-1.pooler.supabase.com:6543/postgres?user=...&password=...

# === JWT (YA CONFIGURADO) ===
JWT_SECRET=milsabores_secret_jwt_key_2024_super_seguro_no_compartir
JWT_EXPIRATION=86400000

# === CORS (YA CONFIGURADO) ===
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app

# 🔴 === HIKARICP OPTIMIZADO PARA SUPABASE FREE TIER === 🔴
HIKARI_MAX_POOL_SIZE=1
# ⚠️ CAMBIO CRÍTICO: De 3 → 1 conexión
# Razón: Supabase Free tiene 20 conexiones MAX TOTAL
# Con 1 conexión evitamos saturar el pool

HIKARI_MIN_IDLE=0
# ⚠️ CAMBIO: De 1 → 0
# Razón: No mantener conexión idle cuando no hay tráfico

HIKARI_CONNECTION_TIMEOUT=5000
# 5 segundos timeout para obtener conexión del pool

HIKARI_IDLE_TIMEOUT=30000
# 30 segundos → Cerrar conexión idle rápidamente

HIKARI_MAX_LIFETIME=60000
# 60 segundos → Reciclar conexión cada 1 minuto
# Evita conexiones zombies de larga duración

HIKARI_LEAK_DETECTION_THRESHOLD=10000
# 10 segundos → Detectar leaks de conexión

# 🔴 === FLYWAY DESHABILITADO (TEMPORAL) === 🔴
FLYWAY_ENABLED=false
# ⚠️ Flyway consume 1 conexión al inicio
# En crash loops esto crea conexiones zombies
# Se deshabilita porque migraciones YA están aplicadas (V7)

# === SPRING BOOT ===
SPRING_PROFILES_ACTIVE=production
```

---

## 📋 VERIFICACIÓN

### 3. REDEPLOY EN RAILWAY

1. **Guardar variables** en Railway
2. **Forzar redeploy:**
   - Click en **Deploy** → **Deploy Latest**
   - O hacer push a GitHub

### 4. MONITOREAR LOGS

Logs deben mostrar:

```
✅ HikariPool-1 - Starting...
✅ HikariPool-1 - Start completed.
✅ HikariPool-1 - Pool stats (total=1, active=0, idle=1, waiting=0)
✅ Started BackendApplication in 12.345 seconds
```

❌ Si ves "Max client connections reached":
- Repetir paso 1 (limpiar conexiones zombies)
- Verificar que HIKARI_MAX_POOL_SIZE=1 (no 3)

---

## 🧪 TESTING

### 5. PROBAR BACKEND

```bash
# Health check
curl https://tu-app.railway.app/api/health

# Login
curl -X POST https://tu-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"test@example.com","contrasena":"password"}'

# Perfil (con JWT)
curl https://tu-app.railway.app/api/auth/perfil \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 📊 MONITOREO CONTINUO

### VERIFICAR CONEXIONES EN SUPABASE

Ejecutar periódicamente (cada hora durante primeras 24h):

```sql
-- Ver estado de conexiones actuales
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change,
    wait_event_type,
    wait_event,
    query
FROM pg_stat_activity 
WHERE datname = 'postgres'
ORDER BY state_change DESC;
```

**Señales de alerta:**
- 🔴 Más de 5 conexiones simultáneas: Investigar
- 🔴 Conexiones en estado "idle in transaction (aborted)": Zombies aparecieron
- 🔴 Conexiones con query_start > 5 minutos: Leak detectado

---

## ❓ POR QUÉ ESTA SOLUCIÓN FUNCIONA

### PROBLEMA ANTERIOR:
```
Railway app → HikariCP (max=3) → Supabase Free (max=20 TOTAL)
Crash loop → Intenta 3 conexiones → Falla → Reinicia → Intenta 3 más
Resultado: 20 conexiones zombies saturan Supabase
```

### SOLUCIÓN ACTUAL:
```
Railway app → HikariCP (max=1) → Supabase Free (max=20 TOTAL)
Startup → Abre 1 conexión → Usa → Cierra en 60seg
max-lifetime=60s → Recicla conexión cada minuto
idle-timeout=30s → Cierra si no se usa en 30seg
Resultado: Solo 1 conexión activa, reciclado constante
```

**Ventajas:**
- ✅ **1 conexión** es suficiente para tráfico bajo/medio
- ✅ **Reciclado cada 60seg** evita conexiones zombies
- ✅ **Cierre a los 30seg idle** libera recursos
- ✅ **Flyway deshabilitado** elimina 1 conexión problemática
- ✅ **Compatible con Supabase Free Tier** (usa 5% del límite)

**Desventajas:**
- ⚠️ **Concurrencia limitada:** Solo 1 request simultáneo a DB
- ⚠️ **Puede ser lento** bajo tráfico alto
- 💡 **Solución:** Upgradear Supabase a Pro (500 conexiones) cuando crezcas

---

## 🔄 SI EL PROBLEMA PERSISTE

### OPCIÓN 1: Verificar application.properties

Archivo: `Backend/src/main/resources/application.properties`

Asegurar que las properties NO sobrescriban las variables:

```properties
# ✅ CORRECTO (usa variables de entorno)
spring.datasource.hikari.maximum-pool-size=${HIKARI_MAX_POOL_SIZE:1}
spring.datasource.hikari.minimum-idle=${HIKARI_MIN_IDLE:0}

# ❌ INCORRECTO (hardcoded)
# spring.datasource.hikari.maximum-pool-size=3  # ELIMINAR
```

### OPCIÓN 2: Crear application-production.properties

Archivo: `Backend/src/main/resources/application-production.properties`

```properties
# Profile específico para Railway
spring.datasource.hikari.maximum-pool-size=1
spring.datasource.hikari.minimum-idle=0
spring.datasource.hikari.connection-timeout=5000
spring.datasource.hikari.idle-timeout=30000
spring.datasource.hikari.max-lifetime=60000
spring.datasource.hikari.leak-detection-threshold=10000

# Deshabilitar Flyway
spring.flyway.enabled=false
```

### OPCIÓN 3: Upgradear Supabase

Si necesitas más concurrencia:

**Supabase Pro:** $25/mes
- 500 conexiones concurrentes
- Mejor rendimiento
- Backups automáticos

---

## 📝 RESUMEN EJECUTIVO

| Configuración | Antes | Después | Razón |
|--------------|-------|---------|-------|
| `HIKARI_MAX_POOL_SIZE` | 3 | **1** | Evitar saturar Supabase Free (20 max) |
| `HIKARI_MIN_IDLE` | 1 | **0** | No mantener conexiones idle |
| `HIKARI_MAX_LIFETIME` | 1200000ms | **60000ms** | Reciclar cada 1min (antes 20min) |
| `HIKARI_IDLE_TIMEOUT` | 600000ms | **30000ms** | Cerrar idle en 30seg (antes 10min) |
| `FLYWAY_ENABLED` | true | **false** | Evitar conexión extra al inicio |

**Resultado esperado:** Backend estable, sin crashes, 1 conexión reciclada constantemente.

---

## ✅ CHECKLIST FINAL

- [ ] Ejecutar SQL en Supabase (terminar conexiones zombies)
- [ ] Actualizar variables en Railway (HIKARI_MAX_POOL_SIZE=1)
- [ ] Verificar FLYWAY_ENABLED=false
- [ ] Forzar redeploy en Railway
- [ ] Monitorear logs (debe iniciar sin errores)
- [ ] Probar endpoints (/api/health, /api/auth/login)
- [ ] Verificar JWT funciona (/api/auth/perfil con token)
- [ ] Monitorear conexiones en Supabase (debe ser 1-2 máximo)

---

## 🆘 CONTACTO DE EMERGENCIA

Si el problema persiste después de estos pasos:

1. **Verificar logs Railway:** Buscar "HikariPool" en logs
2. **Verificar Supabase SQL Editor:** 
   ```sql
   SELECT count(*) FROM pg_stat_activity WHERE datname='postgres';
   ```
   Debe retornar < 5
3. **Revisar variables Railway:** Confirmar HIKARI_MAX_POOL_SIZE=1

**Última opción:** Crear nuevo proyecto Supabase (conexiones frescas).
