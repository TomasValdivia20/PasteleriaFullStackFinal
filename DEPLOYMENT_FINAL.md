# 🚀 DEPLOYMENT FINAL - RAILWAY + VERCEL

**Fecha:** 2 de diciembre de 2025  
**Commits aplicados:**
- `b14bcf6` - Optimización HikariCP (2 max, 1 min)
- `95db800` - Forzar rebuild Railway sin cache
- `1a17551` - Documentación actualizada

---

## 📋 ESTADO ACTUAL

### ✅ Código Optimizado
- `application.properties`: HikariCP 2/1 (defaults seguros)
- `application-production.properties`: HikariCP 2/1 + logging optimizado
- `nixpacks.toml`: Flag `-U` para forzar rebuild Maven sin cache

### ⚠️ Problema Identificado
Railway **NO está aplicando cambios** del código por **build cache antiguo**.

**Logs confirman:**
```log
❌ maximumPoolSize.................10 (debería ser 2)
❌ minimumIdle.....................10 (debería ser 1)
```

---

## 🔧 SOLUCIÓN INMEDIATA (3 PASOS)

### **PASO 1: Configurar Variables de Entorno en Railway**

Railway Dashboard → Tu Proyecto Backend → **Variables**

```bash
# OBLIGATORIAS - FUERZAN OVERRIDE
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=2
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=1
SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT=20000
SPRING_DATASOURCE_HIKARI_MAX_LIFETIME=1200000
SPRING_DATASOURCE_HIKARI_LEAK_DETECTION_THRESHOLD=15000

# BASE DE DATOS - SUPABASE
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:6543/postgres?prepareThreshold=0&preparedStatementCacheQueries=0&preparedStatementCacheSizeMiB=0
SPRING_DATASOURCE_USERNAME=postgres.dzbeucldelrjdjprfday
SPRING_DATASOURCE_PASSWORD=<TU_PASSWORD_SUPABASE>

# SPRING BOOT
SPRING_PROFILES_ACTIVE=production

# JWT SECURITY
JWT_SECRET=<GENERAR_256_BITS>
JWT_EXPIRATION=86400000

# CORS - VERCEL
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app

# SUPABASE STORAGE (OPCIONAL)
SUPABASE_URL=https://dzbeucldelrjdjprfday.supabase.co
SUPABASE_KEY=<TU_SUPABASE_ANON_KEY>
SUPABASE_BUCKET=pasteles
```

### **PASO 2: Generar JWT_SECRET**

```powershell
# PowerShell
$bytes = New-Object byte[] 32; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)
```

O usa este ejemplo:
```
milsabores_jwt_2024_production_secret_key_ultra_secure_256bits_railway
```

### **PASO 3: Forzar Redeploy**

Railway detectará automáticamente el push reciente con `nixpacks.toml` actualizado:

1. Railway Dashboard → **Deployments**
2. Verificar que esté usando commit `1a17551` o `95db800`
3. Si NO, click **"Redeploy"** manualmente
4. Esperar 3-5 minutos (build con `-U` tarda más)

---

## 📊 VERIFICACIÓN POST-DEPLOY

### Logs Esperados

Railway Dashboard → Latest Deployment → **Logs**

```log
✅ ./mvnw clean package -U -DskipTests
✅ BUILD SUCCESS
✅ maximumPoolSize.................2
✅ minimumIdle.....................1
✅ connectionTimeout..............20000
✅ HikariPool-1 - Starting...
✅ HikariPool-1 - Start completed.
✅ Tomcat started on port 8080 (http)
✅ Started BackendApplication in X.XXX seconds
```

### Health Check

```powershell
Invoke-RestMethod https://TU-BACKEND.railway.app/actuator/health
```

Esperado:
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" }
  }
}
```

---

## 🎯 CONFIGURACIÓN VERCEL (FRONTEND)

Vercel Dashboard → Tu Proyecto → **Environment Variables**

```bash
# OBLIGATORIA
VITE_API_URL=https://TU-BACKEND.railway.app

# ⚠️ NO incluyas /api al final (el código lo agrega automáticamente)
```

### Build Settings

- **Framework Preset:** Vite
- **Root Directory:** `Frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

---

## 🐛 TROUBLESHOOTING

### Railway sigue mostrando maximumPoolSize=10

**Solución 1:** Clear Build Cache
1. Railway Dashboard → Settings → **Clear Build Cache**
2. Redeploy manualmente

**Solución 2:** Verificar variables
1. Railway → Variables → Eliminar variables antiguas (`HIKARI_MAX_POOL_SIZE` sin prefijo `SPRING_DATASOURCE_`)
2. Usar solo las nuevas con prefijo completo

**Solución 3:** Supabase Connection Pooler
1. Supabase Dashboard → Database → **Connection Pooler** → Restart
2. Espera 2 minutos → Redeploy Railway

### FATAL: Max client connections reached

Ejecutar en Supabase SQL Editor:
```sql
-- Ver conexiones activas
SELECT count(*), state, application_name
FROM pg_stat_activity 
WHERE datname = 'postgres'
GROUP BY state, application_name;

-- Si hay >15 conexiones, matar zombies
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND pid <> pg_backend_pid()
  AND state = 'idle'
  AND application_name = 'PostgreSQL JDBC Driver';
```

### Frontend Vercel con CORS Error

Verificar en Railway:
- Variable `FRONTEND_URL` configurada correctamente
- SIN trailing slash: ~~`https://tu-app.vercel.app/`~~ ❌
- Correcto: `https://tu-app.vercel.app` ✅

---

## 📚 DOCUMENTACIÓN COMPLETA

- **[RAILWAY_VARIABLES_OBLIGATORIAS.md](RAILWAY_VARIABLES_OBLIGATORIAS.md)** - Variables críticas + troubleshooting cache
- **[INSTRUCCIONES_RAILWAY_DEPLOYMENT.md](INSTRUCCIONES_RAILWAY_DEPLOYMENT.md)** - Guía completa Railway
- **[INSTRUCCIONES_VERCEL_DEPLOYMENT.md](INSTRUCCIONES_VERCEL_DEPLOYMENT.md)** - Guía completa Vercel
- **[RESUMEN_CAMBIOS_OPTIMIZACION.md](RESUMEN_CAMBIOS_OPTIMIZACION.md)** - Diff detallado de cambios

---

## ✅ CHECKLIST FINAL

### Railway Backend
- [ ] Variables de entorno configuradas (TODAS las obligatorias)
- [ ] JWT_SECRET generado con 256 bits mínimo
- [ ] SPRING_DATASOURCE_URL incluye `?prepareThreshold=0&...`
- [ ] FRONTEND_URL sin trailing slash
- [ ] Deployment usando commit `1a17551` o posterior
- [ ] Logs muestran `maximumPoolSize.................2`
- [ ] Health check responde `{"status":"UP"}`

### Vercel Frontend
- [ ] Variable `VITE_API_URL` configurada (sin `/api` al final)
- [ ] Root Directory = `Frontend`
- [ ] Build exitoso
- [ ] Console del navegador SIN errores CORS
- [ ] Peticiones API retornan status 200

### End-to-End
- [ ] Home page carga productos
- [ ] Detalle producto muestra variantes
- [ ] Login funciona
- [ ] Carrito acepta productos
- [ ] Backoffice accesible (admin)

---

## 🆘 ÚLTIMA OPCIÓN (Nuclear)

Si TODO falla después de intentar las soluciones:

1. Railway Dashboard → Settings → **Delete Service**
2. Crear nuevo servicio desde GitHub (master branch)
3. Configurar variables desde cero
4. Deploy limpio sin cache histórico

⚠️ **SOLO como ÚLTIMO RECURSO** - perderás logs históricos.

---

## 📞 PRÓXIMOS PASOS

1. **Configurar variables** en Railway (Paso 1)
2. **Esperar auto-deploy** (3-5 min) con `nixpacks.toml` actualizado
3. **Verificar logs** muestran `maximumPoolSize=2`
4. **Probar health check** backend
5. **Verificar Vercel** conecta sin CORS errors

**Commits aplicados:** `b14bcf6`, `95db800`, `1a17551`  
**Railway auto-deploy:** En progreso...  
**Última actualización:** 2 de diciembre de 2025
