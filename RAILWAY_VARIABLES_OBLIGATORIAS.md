# 🚨 VARIABLES DE ENTORNO OBLIGATORIAS - RAILWAY

**Fecha:** 2 de diciembre de 2025  
**Problema resuelto:** Railway cachea builds y NO aplica cambios de `application.properties`  
**Solución:** Configurar variables de entorno EXPLÍCITAS en Railway para forzar override

---

## ⚠️ PROBLEMA IDENTIFICADO

Railway está usando **build cache antiguo** con configuración:
```log
maximumPoolSize.................10  ← INCORRECTO
minimumIdle.....................10  ← INCORRECTO
```

Aunque el código fuente tiene valores correctos (2, 1), Railway NO está rebuildeando desde el commit reciente.

---

## ✅ SOLUCIÓN INMEDIATA

### **PASO 1: Configurar Variables de Entorno en Railway**

Ve a Railway Dashboard → Tu Proyecto Backend → **Variables** y agrega:

```bash
# ===================================================================
# HIKARICP - FORZAR OVERRIDE (OBLIGATORIO)
# ===================================================================
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=2
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=1
SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT=20000
SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT=600000
SPRING_DATASOURCE_HIKARI_MAX_LIFETIME=1200000
SPRING_DATASOURCE_HIKARI_LEAK_DETECTION_THRESHOLD=15000

# ===================================================================
# BASE DE DATOS - SUPABASE (OBLIGATORIO)
# ===================================================================
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:6543/postgres?prepareThreshold=0&preparedStatementCacheQueries=0&preparedStatementCacheSizeMiB=0
SPRING_DATASOURCE_USERNAME=postgres.dzbeucldelrjdjprfday
SPRING_DATASOURCE_PASSWORD=TU_PASSWORD_SUPABASE

# ===================================================================
# SPRING BOOT - PERFILES (OBLIGATORIO)
# ===================================================================
SPRING_PROFILES_ACTIVE=production
PORT=8080

# ===================================================================
# SEGURIDAD - JWT (OBLIGATORIO)
# ===================================================================
JWT_SECRET=TU_JWT_SECRET_ALEATORIO_256_BITS
JWT_EXPIRATION=86400000

# ===================================================================
# CORS - FRONTEND VERCEL (OBLIGATORIO)
# ===================================================================
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app

# ===================================================================
# SUPABASE STORAGE (OPCIONAL)
# ===================================================================
SUPABASE_URL=https://dzbeucldelrjdjprfday.supabase.co
SUPABASE_KEY=TU_SUPABASE_ANON_KEY
SUPABASE_BUCKET=pasteles
```

### **PASO 2: Generar Secretos Seguros**

#### JWT_SECRET (256 bits):
```powershell
# PowerShell
$bytes = New-Object byte[] 32; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)
```

O usa este generado aleatoriamente:
```
milsabores_jwt_2024_production_secret_key_ultra_secure_256bits_railway
```

---

## 🔧 PASO 3: Forzar Redeploy

Después de configurar las variables:

1. **Railway Dashboard** → Deployments
2. Click **"Redeploy"** (botón superior derecho)
3. **O** hacer un nuevo commit trivial para trigger auto-deploy

---

## 📊 VERIFICACIÓN POST-DEPLOY

### Logs esperados (Railway Dashboard → Logs):

```log
✅ 2025-12-02 XX:XX:XX.XXX DEBUG maximumPoolSize.................2
✅ 2025-12-02 XX:XX:XX.XXX DEBUG minimumIdle.....................1
✅ 2025-12-02 XX:XX:XX.XXX DEBUG connectionTimeout..............20000
✅ 2025-12-02 XX:XX:XX.XXX INFO  HikariPool-1 - Starting...
✅ 2025-12-02 XX:XX:XX.XXX INFO  HikariPool-1 - Start completed.
✅ 2025-12-02 XX:XX:XX.XXX INFO  Tomcat started on port 8080 (http)
✅ 2025-12-02 XX:XX:XX.XXX INFO  Started BackendApplication in X.XXX seconds
```

### ❌ SI SIGUE MOSTRANDO 10/10:

1. **Verifica commit en Railway:**
   - Railway Dashboard → Deployments → Latest
   - Confirma que esté usando commit `b14bcf6` o posterior

2. **Limpia cache Maven:**
   - Railway Dashboard → Settings → **Clear Build Cache**
   - Redeploy manualmente

3. **Elimina variables conflictivas:**
   - Si tienes variables antiguas como `HIKARI_MAX_POOL_SIZE` (sin prefijo `SPRING_DATASOURCE_`)
   - **Elimínalas** y usa solo las nuevas con prefijo completo

---

## 🧪 HEALTH CHECK

Después del deployment exitoso:

```powershell
# PowerShell
Invoke-RestMethod https://TU-BACKEND.railway.app/actuator/health
```

Respuesta esperada:
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP"
    }
  }
}
```

---

## 🔍 TROUBLESHOOTING AVANZADO

### Problema: Railway sigue crasheando después de configurar variables

**Posible causa:** Supabase tiene conexiones zombies de deploys anteriores.

**Solución:**

1. **Supabase Dashboard** → Database → **Connection Pooler**
2. Click **"Restart"**
3. Espera 2 minutos
4. **Railway Dashboard** → Deployments → **Redeploy**

### Problema: "FATAL: Max client connections reached" persiste

**Verificar conexiones activas en Supabase:**

```sql
-- Ejecutar en Supabase SQL Editor
SELECT 
  count(*) as total,
  state,
  application_name
FROM pg_stat_activity 
WHERE datname = 'postgres'
GROUP BY state, application_name
ORDER BY total DESC;
```

**Si hay >15 conexiones:**
```sql
-- CUIDADO: Esto mata TODAS las conexiones (excepto la tuya)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND pid <> pg_backend_pid()
  AND application_name = 'PostgreSQL JDBC Driver';
```

---

## 📋 CHECKLIST FINAL

- [ ] Variables de entorno configuradas en Railway (todas las OBLIGATORIAS)
- [ ] JWT_SECRET generado con 256 bits (mínimo 32 caracteres)
- [ ] SPRING_DATASOURCE_URL incluye parámetros `?prepareThreshold=0&...`
- [ ] FRONTEND_URL tiene dominio Vercel correcto (sin trailing slash)
- [ ] Redeploy manual ejecutado
- [ ] Logs muestran `maximumPoolSize.................2`
- [ ] Health check responde `{"status":"UP"}`
- [ ] Frontend Vercel conecta sin errores CORS

---

## 🎯 VALORES CRÍTICOS RESUMEN

| Variable | Valor | Razón |
|----------|-------|-------|
| `MAXIMUM_POOL_SIZE` | **2** | Supabase Free Tier = 15 conexiones max |
| `MINIMUM_IDLE` | **1** | Ahorrar recursos Railway |
| `CONNECTION_TIMEOUT` | **20000** | Fail-fast (20s) |
| `MAX_LIFETIME` | **1200000** | Evitar conexiones zombies (20min) |
| `LEAK_DETECTION_THRESHOLD` | **15000** | Detectar leaks rápido (15s) |

---

## 🆘 ÚLTIMA OPCIÓN (Nuclear)

Si TODO lo anterior falla:

1. **Railway Dashboard** → Settings → **Danger Zone**
2. **"Delete Service"** → Confirmar
3. **Crear nuevo servicio desde GitHub**
4. Configurar variables desde cero
5. Deploy limpio sin cache histórico

**NOTA:** Solo como ÚLTIMO RECURSO - perderás logs históricos.

---

**Última actualización:** 2 de diciembre de 2025  
**Commit con fix:** `b14bcf6`  
**Build forzado:** `nixpacks.toml` con flag `-U`
