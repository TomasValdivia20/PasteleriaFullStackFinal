# 🔧 CONFIGURACIÓN DEFINITIVA RAILWAY - AUDITADA Y OPTIMIZADA

## 📊 ANÁLISIS COMPLETO DE VARIABLES ACTUALES

### ❌ PROBLEMA CRÍTICO IDENTIFICADO

Tienes **`SPRING_DATASOURCE_PASSWORD`** pero el código usa **`SUPABASE_DB_PASSWORD`**

**Línea 19 de `application-production.properties`:**
```properties
spring.datasource.password=${SUPABASE_DB_PASSWORD}
```

**Esto causará error**: `property 'password' is invalid`

---

## ✅ CONFIGURACIÓN FINAL RAILWAY (8 VARIABLES)

### Variables CORRECTAS a MANTENER

```properties
# 1. FRONTEND_URL - ✅ CORRECTA
FRONTEND_URL="https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app"
# Uso: SecurityConfig.java línea 41 → @Value("${frontend.url:...}")
# Mapeo: application.properties línea 89 → frontend.url=${FRONTEND_URL:...}
# Función: CORS con wildcard para Vercel previews

# 2. JAVA_TOOL_OPTIONS - ✅ CORRECTA
JAVA_TOOL_OPTIONS="-Xmx400m -Xms200m -XX:MaxMetaspaceSize=100m"
# Uso: JVM automático al iniciar Java
# Función: Optimización memoria para Railway Free Tier (512MB)

# 3. JWT_EXPIRATION - ✅ CORRECTA
JWT_EXPIRATION="86400000"
# Uso: JwtUtil.java línea 29 → @Value("${jwt.expiration:...}")
# Mapeo: application.properties línea 83 → jwt.expiration=${JWT_EXPIRATION:...}
# Función: Tiempo expiración tokens (24 horas)

# 4. JWT_SECRET - ✅ CORRECTA
JWT_SECRET="milsabores-secret-key-super-secure-2024-pasteleria-jwt-token-security-production"
# Uso: JwtUtil.java línea 26 → @Value("${jwt.secret:...}")
# Mapeo: application.properties línea 82 → jwt.secret=${JWT_SECRET:...}
# Función: Clave secreta firma JWT

# 5. SPRING_PROFILES_ACTIVE - ✅ CORRECTA
SPRING_PROFILES_ACTIVE="production"
# Uso: Spring Boot automático
# Función: Activa application-production.properties

# 6. SUPABASE_BUCKET - ✅ CORRECTA
SUPABASE_BUCKET="pasteles"
# Uso: ImagenProductoService.java línea 40 → @Value("${supabase.bucket:...}")
# Mapeo: application.properties línea 48 → supabase.bucket=${SUPABASE_BUCKET:...}
# Función: Bucket Storage Supabase para imágenes

# 7. SUPABASE_KEY - ✅ CORRECTA
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6YmV1Y2xkZWxyamRqcHJmZGF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQ3MDk2NCwiZXhwIjoyMDgwMDQ2OTY0fQ.0XDnf8MC6C8h8uaQvkst0IOYXGwsApCJJluPLGfKwD4"
# Uso: ImagenProductoService.java línea 37 → @Value("${supabase.key}")
# Mapeo: application.properties línea 47 → supabase.key=${SUPABASE_KEY:...}
# Función: Service Role Key para upload imágenes

# 8. SUPABASE_URL - ✅ CORRECTA
SUPABASE_URL="https://dzbeucldelrjdjprfday.supabase.co"
# Uso: ImagenProductoService.java línea 34 → @Value("${supabase.url}")
# Mapeo: application.properties línea 46 → supabase.url=${SUPABASE_URL:...}
# Función: URL base API Supabase Storage
```

---

### ⚠️ Variables CON PROBLEMAS

```properties
# ❌ SPRING_DATASOURCE_PASSWORD - NOMBRE INCORRECTO
SPRING_DATASOURCE_PASSWORD="PasteleriaMilSabores123!"
# PROBLEMA: application-production.properties línea 19 espera SUPABASE_DB_PASSWORD
# SOLUCIÓN: RENOMBRAR a SUPABASE_DB_PASSWORD
```

---

### ❌ Variables OBSOLETAS a ELIMINAR

```properties
# 1. FLYWAY_ENABLED - ❌ ELIMINAR
FLYWAY_ENABLED="false"
# RAZÓN: Hardcodeada en application-production.properties línea 57
# Valor hardcodeado: spring.flyway.enabled=false
# CONFLICTO: Variables entorno tienen menor prioridad que .properties

# 2. SPRING_JPA_OPEN_IN_VIEW - ❌ ELIMINAR
SPRING_JPA_OPEN_IN_VIEW="true"
# RAZÓN: Hardcodeada en application-production.properties línea 78
# Valor hardcodeado: spring.jpa.open-in-view=true

# 3. SPRING_JPA_HIBERNATE_DDL_AUTO - ❌ ELIMINAR
SPRING_JPA_HIBERNATE_DDL_AUTO="update"
# RAZÓN: NO existe en application-production.properties
# RIESGO: Si no está hardcodeada, Spring Boot usa default 'none' en producción
# PROBLEMA: Esta variable no tiene efecto porque no hay mapeo en properties

# 4. SPRING_JPA_SHOW_SQL - ❌ ELIMINAR
SPRING_JPA_SHOW_SQL="false"
# RAZÓN: Hardcodeada en application-production.properties línea 67
# Valor hardcodeado: spring.jpa.show-sql=false

# 5. SPRING_JPA_PROPERTIES_HIBERNATE_FORMAT_SQL - ❌ ELIMINAR
SPRING_JPA_PROPERTIES_HIBERNATE_FORMAT_SQL="false"
# RAZÓN: Hardcodeada en application-production.properties línea 68
# Valor hardcodeado: spring.jpa.properties.hibernate.format_sql=false
```

---

## 🎯 ACCIONES REQUERIDAS EN RAILWAY

### PASO 1: RENOMBRAR Variable Database

**Railway → Backend Service → Variables**

**CAMBIAR**:
```
Variable: SPRING_DATASOURCE_PASSWORD
Nuevo nombre: SUPABASE_DB_PASSWORD
Valor: PasteleriaMilSabores123! (mantener igual)
```

**Cómo hacerlo**:
1. Click en icono editar de `SPRING_DATASOURCE_PASSWORD`
2. Cambiar nombre a: `SUPABASE_DB_PASSWORD`
3. Click "Update"

---

### PASO 2: ELIMINAR 5 Variables Obsoletas

**Railway → Backend Service → Variables → Click 🗑️ en cada una**:

```
❌ FLYWAY_ENABLED
❌ SPRING_JPA_OPEN_IN_VIEW
❌ SPRING_JPA_HIBERNATE_DDL_AUTO
❌ SPRING_JPA_SHOW_SQL
❌ SPRING_JPA_PROPERTIES_HIBERNATE_FORMAT_SQL
```

---

### PASO 3: Verificar Configuración Final

Después de cambios, debes tener **exactamente 8 variables**:

```
✅ FRONTEND_URL
✅ JAVA_TOOL_OPTIONS
✅ JWT_EXPIRATION
✅ JWT_SECRET
✅ SPRING_PROFILES_ACTIVE
✅ SUPABASE_BUCKET
✅ SUPABASE_DB_PASSWORD  ← RENOMBRADA
✅ SUPABASE_KEY
✅ SUPABASE_URL
```

**Total: 9 variables** (antes 14)

---

## 📋 MAPEO COMPLETO VARIABLES → PROPIEDADES

### Variables de Aplicación (application.properties)

| Variable Railway | Propiedad Spring | Archivo | Línea | Uso |
|-----------------|------------------|---------|-------|-----|
| `SUPABASE_URL` | `supabase.url` | application.properties | 46 | ImagenProductoService.java:34 |
| `SUPABASE_KEY` | `supabase.key` | application.properties | 47 | ImagenProductoService.java:37 |
| `SUPABASE_BUCKET` | `supabase.bucket` | application.properties | 48 | ImagenProductoService.java:40 |
| `JWT_SECRET` | `jwt.secret` | application.properties | 82 | JwtUtil.java:26 |
| `JWT_EXPIRATION` | `jwt.expiration` | application.properties | 83 | JwtUtil.java:29 |
| `FRONTEND_URL` | `frontend.url` | application.properties | 89 | SecurityConfig.java:41 |

### Variables de Producción (application-production.properties)

| Variable Railway | Propiedad Spring | Archivo | Línea | Uso |
|-----------------|------------------|---------|-------|-----|
| `SUPABASE_DB_PASSWORD` | `spring.datasource.password` | application-production.properties | 19 | HikariCP datasource |

### Variables Hardcodeadas (NO requieren env vars)

| Propiedad Spring | Valor Hardcodeado | Archivo | Línea |
|-----------------|-------------------|---------|-------|
| `spring.datasource.url` | `jdbc:postgresql://...5432/postgres...` | application-production.properties | 17 |
| `spring.datasource.username` | `postgres.dzbeucldelrjdjprfday` | application-production.properties | 18 |
| `spring.datasource.driver-class-name` | `org.postgresql.Driver` | application-production.properties | 20 |
| `spring.datasource.hikari.maximum-pool-size` | `2` | application-production.properties | 31 |
| `spring.datasource.hikari.minimum-idle` | `1` | application-production.properties | 35 |
| `spring.datasource.hikari.connection-timeout` | `20000` | application-production.properties | 39 |
| `spring.datasource.hikari.max-lifetime` | `1200000` | application-production.properties | 47 |
| `spring.datasource.hikari.leak-detection-threshold` | `15000` | application-production.properties | 51 |
| `spring.flyway.enabled` | `false` | application-production.properties | 63 |
| `spring.jpa.show-sql` | `false` | application-production.properties | 71 |
| `spring.jpa.properties.hibernate.format_sql` | `false` | application-production.properties | 72 |
| `spring.jpa.open-in-view` | `true` | application-production.properties | 82 |

---

## 🔍 VALIDACIÓN POST-DESPLIEGUE

### 1. Verificar Logs Railway

Después de eliminar variables, Railway auto-redeploy. Buscar en logs:

```bash
# ✅ ÉXITO - Configuración correcta
jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:5432/postgres
HikariPool-1 - configuration:
maximumPoolSize.................2
minimumIdle.....................1
HikariPool-1 - Start completed
Started BackendApplication in XX.XXX seconds

# ✅ CORS configurado correctamente
🌍 [CORS] Orígenes permitidos: [https://pasteleria-full-stack-final.vercel.app, https://*.vercel.app]

# ❌ ERROR - NO debe aparecer
FATAL: Max client connections reached
property 'password' is invalid
Cannot create PoolableConnectionFactory
```

### 2. Health Check Backend

```powershell
Invoke-RestMethod https://pasteleriafullstackfinal-production.up.railway.app/actuator/health
```

**Esperado**:
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
```

### 3. Test CORS desde Vercel Preview

Abrir Vercel preview → F12 Console:

```javascript
fetch('https://pasteleriafullstackfinal-production.up.railway.app/api/productos')
  .then(r => r.json())
  .then(d => console.log('✅ Productos:', d.length))
  .catch(e => console.error('❌ Error:', e));
```

**Esperado**: `✅ Productos: 16`

---

## 📊 RESUMEN CAMBIOS

| Categoría | Antes | Después | Cambio |
|-----------|-------|---------|--------|
| **Total Variables** | 14 | 9 | -5 |
| **Variables Correctas** | 7 | 8 | +1 (renombrada) |
| **Variables Obsoletas** | 6 | 0 | -6 |
| **Variables Conflictivas** | 1 | 0 | -1 (renombrada) |

---

## 🎯 CHECKLIST FINAL

- [ ] **Renombrar** `SPRING_DATASOURCE_PASSWORD` → `SUPABASE_DB_PASSWORD`
- [ ] **Eliminar** `FLYWAY_ENABLED`
- [ ] **Eliminar** `SPRING_JPA_OPEN_IN_VIEW`
- [ ] **Eliminar** `SPRING_JPA_HIBERNATE_DDL_AUTO`
- [ ] **Eliminar** `SPRING_JPA_SHOW_SQL`
- [ ] **Eliminar** `SPRING_JPA_PROPERTIES_HIBERNATE_FORMAT_SQL`
- [ ] **Verificar** 9 variables finales en Railway
- [ ] **Esperar** redeploy automático (5-7 minutos)
- [ ] **Verificar logs** sin errores
- [ ] **Test** Health check `/actuator/health` → UP
- [ ] **Test** CORS desde Vercel preview → Sin errores

---

## ⚠️ NOTAS IMPORTANTES

1. **Session Pooler (Puerto 5432)**: Ya configurado en `application-production.properties` línea 17. NO requiere variable de entorno.

2. **HikariCP Hardcodeado**: Todos los parámetros HikariCP están hardcodeados (líneas 31-51). NO requieren variables.

3. **Flyway Deshabilitado**: Hardcodeado en línea 63. NO requiere variable.

4. **JPA Configuración**: Hardcodeada en líneas 71-82. NO requiere variables.

5. **Precedencia Spring Boot**: 
   - `application-production.properties` > Variables de entorno
   - Variables hardcodeadas ignoran env vars
   - Solo usar env vars para valores que DEBEN cambiar entre entornos

---

## 🚀 PRÓXIMOS PASOS DESPUÉS DE RAILWAY

### Configuración Vercel (Frontend)

**Variables de Entorno Necesarias**:

```bash
# Vercel → Project → Settings → Environment Variables

# Backend URL
VITE_API_BASE_URL=https://pasteleriafullstackfinal-production.up.railway.app

# Environment
VITE_ENVIRONMENT=production
```

**¿Dónde se usan?**:
- `Frontend/src/api.js`: Importa `VITE_API_BASE_URL` para axios.create()

---

**EJECUTA LOS CAMBIOS AHORA Y AVÍSAME CUANDO TERMINES PARA VERIFICAR EL DEPLOY** 🚀
