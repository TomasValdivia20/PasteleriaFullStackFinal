# 🚂 Railway - Variables de Entorno y Configuración Final

> **⚠️ ACTUALIZACIÓN IMPORTANTE:** Sistema de logging corregido (Diciembre 2025)  
> Si experimentabas crashes con `Logback configuration error`, este fix lo resuelve.  
> Ver: [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md)

## 📋 Variables de Entorno Requeridas

### Backend (Java Spring Boot)

Configura estas variables en Railway Dashboard → **Variables**:

```bash
# ===================================================================
# PERFIL DE SPRING BOOT
# ===================================================================
SPRING_PROFILES_ACTIVE=production

# ===================================================================
# BASE DE DATOS (Supabase PostgreSQL)
# ===================================================================
# Copiar desde: Supabase → Project Settings → Database → Connection String (JDBC)
DATABASE_URL=jdbc:postgresql://aws-0-us-west-1.pooler.supabase.com:6543/postgres?user=postgres.xxxxx&password=xxxxx

# ===================================================================
# SUPABASE STORAGE
# ===================================================================
# Copiar desde: Supabase → Project Settings → API
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===================================================================
# JWT SECURITY
# ===================================================================
# Generar clave segura de mínimo 32 caracteres
JWT_SECRET=tu_clave_secreta_super_segura_minimo_32_caracteres
JWT_EXPIRATION=86400000

# ===================================================================
# CORS
# ===================================================================
# URL del frontend en Vercel (sin trailing slash)
ALLOWED_ORIGINS=https://tu-app.vercel.app,http://localhost:5173

# ===================================================================
# HIKARI CONNECTION POOL (Optimizado para Railway)
# ===================================================================
HIKARI_MAX_POOL_SIZE=20
HIKARI_MIN_IDLE=5
HIKARI_CONNECTION_TIMEOUT=30000
HIKARI_IDLE_TIMEOUT=600000
HIKARI_MAX_LIFETIME=1800000
HIKARI_LEAK_DETECTION_THRESHOLD=60000

# ===================================================================
# JVM MEMORY (Optimizado para Railway 512MB)
# ===================================================================
JAVA_TOOL_OPTIONS=-Xmx400m -Xms200m -XX:MaxMetaspaceSize=100m

# ===================================================================
# LOGGING (Configurado automáticamente en logback-spring.xml)
# ===================================================================
# ✅ Logging ahora usa patrones estándar Logback (sin %clr ni %wEx)
# ✅ MDC habilitado: correlationId, userId, requestUri
# ✅ Logs estructurados para Railway console
# Solo descomentar para debugging intensivo:
# LOGGING_LEVEL_COM_MILSABORES_BACKEND=DEBUG
# SPRING_JPA_SHOW_SQL=true
```

---

## ✅ Checklist de Deployment

### Pre-Deployment

- [ ] **Variables de entorno configuradas** en Railway Dashboard
- [ ] **DATABASE_URL** copiada correctamente desde Supabase (formato JDBC)
- [ ] **SUPABASE_KEY** es la `anon` public key (NO la service_role)
- [ ] **JWT_SECRET** tiene mínimo 32 caracteres alfanuméricos
- [ ] **ALLOWED_ORIGINS** incluye dominio de Vercel exacto
- [ ] **Código compilado localmente** con `./mvnw clean package` exitoso
- [ ] **Commit pusheado** a branch master en GitHub

### Durante Deployment

Railway despliega automáticamente cuando detecta push a master:

1. **Build Command**: `./mvnw clean package -DskipTests`
2. **Start Command**: `java -jar target/backend-0.0.1-SNAPSHOT.jar`
3. **Watch**: Railway logs en tiempo real

Espera 5-7 minutos para deployment completo.

### Post-Deployment - Verificación

#### 1. Verificar Build Exitoso

Railway Dashboard → **Deployments** → Último deployment:

```
✅ BUILD SUCCESS
✅ Started BackendApplication in X.XXX seconds
✅ Tomcat started on port 8080
```

#### 2. Health Check Básico

```bash
# PowerShell
curl https://tu-app.up.railway.app/actuator/health
```

**Respuesta esperada**:
```json
{
  "status": "UP",
  "components": {
    "database": {
      "status": "UP",
      "details": {
        "totalProductos": 18,
        "queryTime": "45ms"
      }
    },
    "hibernate": {
      "status": "UP",
      "details": {
        "lazyLoadingWorking": true,
        "testProductoId": 1,
        "variantesLoaded": 1,
        "imagenesLoaded": 1
      }
    }
  }
}
```

**⚠️ CRÍTICO**: Si `hibernate.lazyLoadingWorking` es `false`, significa Railway bug de cache. Ver sección Troubleshooting.

#### 3. Test API Productos

```bash
# PowerShell
curl https://tu-app.up.railway.app/api/productos/1
```

**JSON esperado** (debe incluir variantes e imagenes):
```json
{
  "id": 1,
  "nombre": "Torta Chocolate",
  "variantes": [
    {
      "id": 1,
      "nombre": "Tamaño único",
      "precio": 42000,
      "stock": 10
    }
  ],
  "imagenes": [
    {
      "id": 1,
      "url": "https://...",
      "esPrincipal": true
    }
  ]
}
```

**❌ Si variantes/imagenes están vacíos**, ver sección Troubleshooting Railway Bug.

#### 4. Verificar Logs con Nuevo Sistema

Railway Dashboard → **View Logs**

Buscar logs con formato MDC:

```
2025-12-01 08:30:15.234 INFO  [http-nio-8080-exec-1] c.m.b.controller.ProductoController : [correlationId=a1b2c3d4] [userId=N/A] [uri=/api/productos/1] [CONTROLLER] >>> ProductoController.obtenerProductoPorId()
```

**Debe mostrar**:
- ✅ `[correlationId=...]` presente
- ✅ `[CONTROLLER]` y `[SERVICE]` tags
- ✅ Duración de métodos: `(took Xms)`
- ✅ `Variantes: 1, Imagenes: 1` (NO "Variantes: 0")

#### 5. Frontend Logging Test

Abre frontend en Vercel y realiza acciones (cargar productos, agregar al carrito).

Railway logs debe mostrar logs del frontend:

```
2025-12-01 08:30:20.456 INFO  [http-nio-8080-exec-3] FRONTEND : [a1b2c3d4] [session=2025-12-01T08:00:00] [url=https://tu-app.vercel.app/productos] API GET /api/productos completed
```

---

## 🔧 Troubleshooting

### ❌ Problema: Health Check muestra `lazyLoadingWorking: false`

**Diagnóstico**:
```json
{
  "hibernate": {
    "status": "DOWN",
    "details": {
      "lazyLoadingWorking": false,
      "error": "LazyInitializationException: ...",
      "solution": "Verificar fetch=EAGER o spring.jpa.open-in-view=true"
    }
  }
}
```

**Causa**: Railway bug de cache - NO aplicó workaround del commit `07ce6ca` o `3e4da73`.

**Soluciones**:

1. **Verificar commit deployed**:
   - Railway Dashboard → Deployments → Ver commit hash
   - Debe ser `3e4da73` o posterior
   
2. **Manual Redeploy**:
   - Railway Dashboard → **Redeploy**
   - Esperar 5-7 minutos
   - Re-verificar health check

3. **Clear Build Cache**:
   - Railway Dashboard → Settings → **Clear Build Cache**
   - Redeploy manualmente
   - Esperar 10 minutos (rebuild completo)

4. **Contactar Railway Support** (si persiste después de 2-3 intentos):

```
Subject: Critical Cache Bug - Workaround Not Applied After Multiple Deployments

Project: pasteleriafullstackfinal-production
GitHub Repo: TomasValdivia20/PasteleriaFullStackFinal

Issue:
Health check endpoint shows LazyInitializationException despite workaround committed.

Evidence:
- Commit 3e4da73: Sistema completo de logging + spring.jpa.open-in-view=true
- Commit 07ce6ca: WORKAROUND con @Transactional + force initialization
- Health check: GET /actuator/health shows "lazyLoadingWorking": false
- Railway logs: LazyInitializationException persists

Expected:
- ProductoService.obtenerPorId() has @Transactional(readOnly=true)
- spring.jpa.open-in-view=true in application-production.properties
- Variantes load correctly within transaction

Actual (deployed code):
- Method executes WITHOUT @Transactional annotation
- Hibernate session closes before accessing lazy collections
- Response JSON has empty variantes[] and imagenes[] arrays

Request:
Please manually clear Docker build cache and Maven repository cache.
This appears to be the same cache bug reported in previous ticket.

Test URL:
https://pasteleriafullstackfinal-production.up.railway.app/actuator/health
```

---

### ❌ Problema: CORS Blocked desde Vercel

**Síntoma**:
```
Access to fetch at 'https://railway.app/api/productos' has been blocked by CORS policy
```

**Solución**:
1. Verificar variable `ALLOWED_ORIGINS` en Railway
2. Formato correcto: `https://tu-app.vercel.app` (sin `/` al final)
3. Múltiples orígenes: separar con comas SIN espacios
4. Redeploy después de cambiar variable

---

### ❌ Problema: Connection Pool Exhausted

**Síntoma en logs**:
```
HikariPool-1 - Connection is not available, request timed out after 5000ms
```

**Solución**:
1. Verificar `HIKARI_MAX_POOL_SIZE=2` (Railway free tier)
2. Si persiste, reducir a `HIKARI_MAX_POOL_SIZE=1`
3. Verificar no hay connection leaks (usar actuator metrics)

---

### ❌ Problema: Logs no muestran correlation ID

**Síntoma**:
```
2025-12-01 08:30:15.234 INFO ... [correlationId=]
```

**Causa**: CorrelationIdFilter no está ejecutándose

**Solución**:
1. Verificar startup logs: buscar `CorrelationIdFilter`
2. Debe aparecer: `Mapped filter: 'correlationIdFilter'`
3. Si no aparece, verificar `@Component` annotation
4. Redeploy si es necesario

---

## 📊 Monitoreo Continuo

### Endpoints para Monitoreo

```bash
# Health check general
GET https://tu-app.up.railway.app/actuator/health

# Métricas JVM y aplicación
GET https://tu-app.up.railway.app/actuator/metrics

# Ver/cambiar niveles de logging
GET https://tu-app.up.railway.app/actuator/loggers

# Frontend logs health
GET https://tu-app.up.railway.app/api/logs/health
```

### Railway CLI - Monitoreo en Tiempo Real

```bash
# Ver logs en tiempo real
railway logs --follow

# Filtrar por nivel
railway logs | Select-String "ERROR"

# Buscar LazyInitializationException
railway logs | Select-String "LAZY INIT ERROR"

# Rastrear correlation ID específico
railway logs | Select-String "a1b2c3d4"
```

### Métricas Clave

Monitorear en Railway Dashboard:

- **CPU Usage**: < 80% (promedio)
- **Memory**: < 450 MB (free tier limit: 512 MB)
- **Response Time**: < 500ms (promedio)
- **Error Rate**: < 1%
- **HikariCP Connections**: Active ≤ 2

---

## 🎯 Sistema de Logging - Guía Rápida

### Logs Backend

**Formato**:
```
[timestamp] [level] [thread] [logger] : [correlationId=...] [userId=...] [uri=...] mensaje
```

**Categorías**:
- `[CONTROLLER]`: Endpoints REST
- `[SERVICE]`: Lógica de negocio  
- `[FRONTEND]`: Logs del navegador
- `🔴 [LAZY INIT ERROR]`: LazyInitializationException detectada

### Logs Frontend

Frontend envía logs automáticamente a `/api/logs` en producción.

Railway logs muestra:
```
[FRONTEND] [correlationId] [session] [url] mensaje | Context: {...}
```

### Correlation ID Tracing

Para rastrear request completo (frontend → backend → response):

```bash
# Railway logs
railway logs | Select-String "a1b2c3d4"
```

Muestra timeline completo con mismo correlation ID.

---

## 📚 Documentación Adicional

### Troubleshooting

¿Problemas con el deployment? Consulta:

- **[RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md)** - 5 problemas comunes con soluciones
  1. ❌ Crash: Logback Configuration Error → **FIX: Removido %clr y %wEx**
  2. ❌ Variantes: 0 - LazyInitializationException → Workarounds Railway bug
  3. ❌ Database Connection Pool Exhausted → HikariCP tuning
  4. ❌ Memory Leak - Out of Memory → MDC cleanup
  5. ❌ Frontend No Conecta con Backend → CORS + Keep-Alive

### Guías Completas

- **DEBUGGING_RAILWAY.md**: Sistema de logging, Railway CLI, interpretación de logs
- **INSTRUCCIONES_RAILWAY.md**: Deployment paso a paso, variables de entorno
- **RESUMEN_LOGGING_SISTEMA.md**: Arquitectura del sistema forense automático

### Recursos Externos

- **Railway Docs**: https://docs.railway.app
- **Spring Boot Actuator**: https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html
- **Logback Manual**: https://logback.qos.ch/manual/

---

## 🆘 Soporte

Si ninguna solución funciona:

1. **Descarga logs completos**: Railway Dashboard → Settings → Logs → Download
2. **Verifica health check**: `curl https://tu-app.up.railway.app/actuator/health`
3. **Consulta RAILWAY_TROUBLESHOOTING.md** para diagnóstico específico
4. **Railway Discord**: https://discord.gg/railway (#help channel)

---

## ✅ Deployment Exitoso

Tu backend está correctamente configurado cuando:

- [x] Health check retorna `"status": "UP"`
- [x] `hibernate.lazyLoadingWorking: true`
- [x] API `/productos/1` retorna variantes e imagenes
- [x] Logs muestran `[correlationId=...]`
- [x] Frontend logs aparecen con categoría `[FRONTEND]`
- [x] Sin LazyInitializationException en logs
- [x] HikariCP connections ≤ 2 active
- [x] Response time < 500ms

---

**Última actualización**: Diciembre 1, 2025  
**Commit actual**: `3e4da73`  
**Sistema de logging**: ✅ Implementado  
**Health checks**: ✅ Activos  
**Railway workaround**: ✅ Aplicado (spring.jpa.open-in-view + @Transactional)
