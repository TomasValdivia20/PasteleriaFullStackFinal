# ✅ CONFIGURACIÓN FINAL RAILWAY - VARIABLES DE ENTORNO

## 📋 CONFIGURACIÓN COMPLETA Y CORRECTA

Copiar y pegar directamente en **Railway Dashboard → Variables → Raw Editor**

```env
# ===================================================================
# DATABASE - SUPABASE CONNECTION POOLER
# ===================================================================
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:6543/postgres
SPRING_DATASOURCE_USERNAME=postgres.dzbeucldelrjdjprfday
SPRING_DATASOURCE_PASSWORD=PasteleriaMilSabores123!

# ===================================================================
# SPRING BOOT - PROFILE PRODUCTION
# ===================================================================
SPRING_PROFILES_ACTIVE=production

# ===================================================================
# JWT - AUTENTICACIÓN Y SEGURIDAD
# ===================================================================
JWT_SECRET=milsabores-secret-key-super-secure-2024-pasteleria-jwt-token-security-production
JWT_EXPIRATION=86400000

# ===================================================================
# 🔴 FLYWAY - DESHABILITADO (CRÍTICO)
# ===================================================================
FLYWAY_ENABLED=false
# ⚠️ IMPORTANTE: 
# - NO usar SPRING_FLYWAY_ENABLED (formato incorrecto)
# - NO usar comillas ("false" es incorrecto)
# - Flyway causa deadlock con 1 conexión máxima
# - Migraciones YA están aplicadas en Supabase

# ===================================================================
# CORS - FRONTEND VERCEL
# ===================================================================
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app

# ===================================================================
# 🔴 HIKARICP - OPTIMIZADO PARA SUPABASE FREE TIER
# ===================================================================
HIKARI_MAX_POOL_SIZE=1
# ⚠️ Solo 1 conexión máxima
# Razón: Supabase Free = 20 conexiones totales
# Evita saturación del pool

HIKARI_MIN_IDLE=0
# ⚠️ No mantener conexiones idle
# Ahorra recursos cuando no hay tráfico

HIKARI_CONNECTION_TIMEOUT=5000
# 5 segundos timeout para obtener conexión

HIKARI_IDLE_TIMEOUT=30000
# 30 segundos → Cerrar conexión idle

HIKARI_MAX_LIFETIME=60000
# 60 segundos → Reciclar conexión cada minuto
# Previene conexiones zombies

HIKARI_LEAK_DETECTION_THRESHOLD=10000
# 10 segundos → Detectar leaks

# ===================================================================
# SUPABASE - STORAGE Y API
# ===================================================================
SUPABASE_URL=https://dzbeucldelrjdjprfday.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6YmV1Y2xkZWxyamRqcHJmZGF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQ3MDk2NCwiZXhwIjoyMDgwMDQ2OTY0fQ.0XDnf8MC6C8h8uaQvkst0IOYXGwsApCJJluPLGfKwD4
SUPABASE_BUCKET=pasteles
```

---

## 🔴 CAMBIOS CRÍTICOS DESDE TU CONFIGURACIÓN ANTERIOR

### ❌ ELIMINAR (Variables incorrectas):

```env
SPRING_FLYWAY_ENABLED="true"    # ❌ ELIMINAR - Causa deadlock
```

### ✅ AGREGAR/CAMBIAR:

```env
FLYWAY_ENABLED=false            # ✅ Formato correcto (sin comillas)
```

---

## 📝 NOTAS IMPORTANTES

### Variables que DEBEN estar sin comillas:

```env
✅ CORRECTO:
FLYWAY_ENABLED=false
HIKARI_MAX_POOL_SIZE=1
HIKARI_MIN_IDLE=0

❌ INCORRECTO:
FLYWAY_ENABLED="false"
HIKARI_MAX_POOL_SIZE="1"
HIKARI_MIN_IDLE="0"
```

Spring Boot Environment Variables no requieren comillas para valores primitivos.

### Variables que DEBEN incluir comillas:

```env
✅ CORRECTO:
SPRING_DATASOURCE_URL=jdbc:postgresql://...
SPRING_DATASOURCE_PASSWORD=PasteleriaMilSabores123!
JWT_SECRET=milsabores-secret-key-...

✅ TAMBIÉN VÁLIDO (pero innecesario):
SPRING_DATASOURCE_URL="jdbc:postgresql://..."
```

**Recomendación:** No usar comillas a menos que el valor contenga espacios o caracteres especiales que requieran escape.

---

## 🚀 PASOS PARA APLICAR

### PASO 1: Railway Dashboard

1. Ir a https://railway.app/dashboard
2. Seleccionar tu proyecto
3. Click en tu servicio Backend
4. Tab **"Variables"**
5. Click en **"Raw Editor"** (esquina superior derecha)

---

### PASO 2: Reemplazar Todo

1. **Borrar TODAS las variables actuales**
2. **Copiar** la configuración completa de arriba
3. **Pegar** en el Raw Editor
4. **Guardar** (Railway auto-guarda)

---

### PASO 3: Verificar Variables Críticas

Revisar que estén exactamente así:

```env
FLYWAY_ENABLED=false                    ✅
HIKARI_MAX_POOL_SIZE=1                  ✅
SPRING_PROFILES_ACTIVE=production       ✅
```

**NO deben aparecer:**
```env
SPRING_FLYWAY_ENABLED                   ❌ (formato incorrecto)
FLYWAY_ENABLED="false"                  ❌ (comillas innecesarias)
```

---

### PASO 4: Forzar Redeploy

Railway debería auto-detectar cambios y redesplegar. Si no:

1. Click en **"Deployments"** tab
2. Click en **"Deploy"** → **"Deploy Latest"**
3. Esperar compilación (~2-3 minutos)

---

### PASO 5: Monitorear Logs

**Railway Dashboard → Deployments → Logs**

**✅ Logs exitosos:**

```log
2025-12-01T... INFO ... : HikariPool-1 - Starting...
2025-12-01T... DEBUG ... : HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@...
2025-12-01T... INFO ... : HikariPool-1 - Start completed.
2025-12-01T... INFO ... : Started BackendApplication in 15.234 seconds
```

**❌ Si ves error Flyway:**

```log
Error creating bean with name 'flywayInitializer'
```

→ Verificar que `FLYWAY_ENABLED=false` esté sin comillas

**❌ Si ves error conexión:**

```log
HikariPool-1 - Connection is not available, request timed out
```

→ Ejecutar limpieza Supabase (pausar/reanudar proyecto)

---

## 🧪 TESTING POST-DEPLOY

### TEST 1: Health Check

```bash
curl https://pasteleria-full-stack-final-production.up.railway.app/api/health
```

**Respuesta esperada:**
```json
{
  "status": "UP",
  "timestamp": "2025-12-01T..."
}
```

---

### TEST 2: Login JWT

```bash
curl -X POST https://pasteleria-full-stack-final-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "admin@pasteleria.com",
    "contrasena": "admin123"
  }'
```

**Respuesta esperada:**
```json
{
  "id": 1,
  "nombre": "Admin",
  "apellido": "Sistema",
  "correo": "admin@pasteleria.com",
  "rol": "ADMIN",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ Guardar el token** para siguiente test

---

### TEST 3: Perfil Autenticado

```bash
curl https://pasteleria-full-stack-final-production.up.railway.app/api/auth/perfil \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

Reemplazar `TU_TOKEN_AQUI` con el token del TEST 2.

**Respuesta esperada:**
```json
{
  "id": 1,
  "nombre": "Admin",
  "apellido": "Sistema",
  "correo": "admin@pasteleria.com",
  "rol": "ADMIN"
}
```

---

### TEST 4: Productos (Endpoint Público)

```bash
curl https://pasteleria-full-stack-final-production.up.railway.app/api/productos
```

**Respuesta esperada:** Array JSON con lista de productos

---

### TEST 5: Categorías

```bash
curl https://pasteleria-full-stack-final-production.up.railway.app/api/categorias
```

**Respuesta esperada:** Array JSON con lista de categorías

---

## 📊 MONITOREO CONTINUO

### Verificar Conexiones Supabase

**Supabase Dashboard → SQL Editor:**

```sql
-- Ver conexiones actuales
SELECT 
    count(*) as total,
    state,
    application_name
FROM pg_stat_activity 
WHERE datname = 'postgres'
GROUP BY state, application_name
ORDER BY total DESC;
```

**Valores esperados:**
- ✅ `total: 1-2` → Normal (Railway + 1 query)
- ⚠️ `total: 3-5` → Revisar logs Railway
- 🔴 `total: > 10` → Problema (ejecutar limpieza)

---

## ❓ FAQ

### ¿Qué hace SPRING_PROFILES_ACTIVE=production?

Activa el archivo `application-production.properties` que contiene:
- Flyway deshabilitado
- HikariCP optimizado
- Logging configurado para producción
- Error handling apropiado

### ¿Por qué HIKARI_MAX_POOL_SIZE=1?

Supabase Free Tier tiene 20 conexiones TOTALES compartidas. Con 1 conexión:
- Evitas saturar el pool
- Suficiente para tráfico bajo/medio
- Reciclado cada 60 segundos previene zombies

### ¿Cuándo necesito aumentar conexiones?

Si ves timeouts frecuentes o tráfico > 100 requests/segundo:

**Opción 1 - Aumentar a 2 conexiones:**
```env
HIKARI_MAX_POOL_SIZE=2
```

**Opción 2 - Upgradear Supabase Pro:**
- $25/mes
- 500 conexiones concurrentes
- Mejor rendimiento

### ¿Qué pasa si habilito Flyway?

Con 1 conexión máxima:
1. Flyway toma la única conexión al iniciar
2. EntityManagerFactory intenta obtener conexión
3. Pool vacío → Timeout después de 5 segundos
4. Application crash

**Solución:** Mantener Flyway deshabilitado en producción

---

## ✅ CHECKLIST FINAL

- [ ] **Variables:** Copiar configuración completa a Railway Raw Editor
- [ ] **FLYWAY_ENABLED:** Verificar que sea `false` (sin comillas)
- [ ] **HIKARI_MAX_POOL_SIZE:** Verificar que sea `1` (sin comillas)
- [ ] **Guardar:** Railway auto-guarda variables
- [ ] **Redeploy:** Forzar deploy o esperar auto-deploy
- [ ] **Logs:** Verificar "HikariPool-1 - Start completed"
- [ ] **Logs:** Verificar "Started BackendApplication in X.XXX seconds"
- [ ] **TEST 1:** Health check → 200 OK
- [ ] **TEST 2:** Login → Retorna token
- [ ] **TEST 3:** Perfil → Autenticación JWT funciona
- [ ] **TEST 4:** Productos → Lista JSON
- [ ] **TEST 5:** Categorías → Lista JSON
- [ ] **MONITOREO:** Conexiones Supabase < 5

---

**Sistema 100% funcional después de completar checklist. 🚀**

## 🔗 ENLACES ÚTILES

- **Railway Dashboard:** https://railway.app/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Frontend Vercel:** https://pasteleria-full-stack-final.vercel.app
- **Backend Railway:** https://pasteleria-full-stack-final-production.up.railway.app

---

## 🆘 SI ALGO FALLA

1. **Verificar variables Railway:** Confirmar FLYWAY_ENABLED=false
2. **Revisar logs Railway:** Buscar error específico
3. **Ejecutar SQL Supabase:** Contar conexiones activas
4. **Pausar/Reanudar Supabase:** Limpiar conexiones zombies
5. **Forzar redeploy Railway:** Deploy Latest

---

**Última actualización:** 1 Diciembre 2025
**Versión backend:** 0.0.1-SNAPSHOT
**Profile activo:** production
