# 🚂 Guía de Despliegue en Railway - Mil Sabores Pastelería

## 📋 Tabla de Contenidos
1. [Prerequisitos](#prerequisitos)
2. [Configuración Inicial](#configuración-inicial)
3. [Variables de Entorno](#variables-de-entorno)
4. [Despliegue](#despliegue)
5. [Verificación](#verificación)
6. [Troubleshooting](#troubleshooting)
7. [Rollback](#rollback)

---

## ✅ Prerequisitos

Antes de desplegar en Railway, asegúrate de tener:

- ✅ Cuenta en [Railway.app](https://railway.app)
- ✅ Repositorio GitHub conectado
- ✅ Base de datos PostgreSQL en Supabase configurada
- ✅ Java 17 instalado localmente para testing
- ✅ Maven 3.8+ configurado

---

## 🔧 Configuración Inicial

### 1. Crear Nuevo Proyecto en Railway

1. Accede a [Railway Dashboard](https://railway.app/dashboard)
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tu repositorio
5. Selecciona: `TomasValdivia20/PasteleriaFullStackFinal`

### 2. Configurar el Servicio Backend

1. Railway detectará automáticamente el proyecto Maven
2. En **Settings** → **Build & Deploy**:
   - **Root Directory**: `/Backend`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/backend-0.0.1-SNAPSHOT.jar`
   - **Watch Paths**: `/Backend/**`

3. En **Settings** → **Networking**:
   - ✅ Habilita **Public Networking**
   - Genera el dominio público (ejemplo: `pasteleriafullstackfinal-production.up.railway.app`)

---

## 🔐 Variables de Entorno

### Variables Requeridas

Configura las siguientes variables en Railway Dashboard → **Variables**:

```bash
# Profile de Spring Boot
SPRING_PROFILES_ACTIVE=production

# Database URL (desde Supabase)
DATABASE_URL=jdbc:postgresql://aws-0-us-west-1.pooler.supabase.com:6543/postgres?user=postgres.xxxxx&password=xxxxx

# Supabase Credentials
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Configuration
JWT_SECRET=tu_clave_secreta_super_segura_minimo_32_caracteres
JWT_EXPIRATION=86400000

# CORS (URL de tu frontend en Vercel)
ALLOWED_ORIGINS=https://tu-app.vercel.app,http://localhost:5173
```

### ⚠️ Notas Importantes

- **DATABASE_URL**: Copia desde Supabase → Project Settings → Database → Connection String (JDBC)
- **SUPABASE_KEY**: Usa la `anon` public key
- **JWT_SECRET**: Genera una clave segura de mínimo 32 caracteres
- **ALLOWED_ORIGINS**: Separa múltiples orígenes con comas (sin espacios)

### Verificación de Variables

```bash
# Railway CLI (opcional)
railway variables

# Debe mostrar todas las variables configuradas
```

---

## 🚀 Despliegue

### Despliegue Automático (Recomendado)

Railway despliega automáticamente cuando pusheas a `master`:

```bash
# 1. Realiza cambios en el código
git add .
git commit -m "feat: Nueva funcionalidad"
git push origin master

# 2. Railway detecta el push y despliega automáticamente
# 3. Monitorea el progreso en Railway Dashboard → Deployments
```

### Despliegue Manual

Si necesitas redesplegar sin cambios de código:

1. Railway Dashboard → Tu Proyecto
2. Click en **"Deployments"**
3. Click en **"Deploy"** o **"Redeploy"**

### Triggers de Despliegue

Railway despliega cuando:
- ✅ Push a rama `master`
- ✅ Cambios en `/Backend/**`
- ✅ Modificación de variables de entorno
- ✅ Redeploy manual desde dashboard

---

## ✔️ Verificación

### 1. Verificar Build Exitoso

En Railway Dashboard → **Deployments** → Último deployment:

```
✅ Build Command: ./mvnw clean package -DskipTests
   [INFO] BUILD SUCCESS
   [INFO] Total time: 45.234 s

✅ Start Command: java -jar target/backend-0.0.1-SNAPSHOT.jar
   Started BackendApplication in 8.456 seconds
```

### 2. Verificar Logs de Aplicación

Railway Dashboard → **View Logs**. Busca:

```log
✅ HikariPool-1 - Start completed.
✅ Tomcat started on port 8080
✅ Started BackendApplication in X.XXX seconds

# CRITICAL: Verifica carga de variantes
📦 [GET] /api/productos/1 - Variantes: 1, Imagenes: 1
```

**⚠️ Si muestra "Variantes: 0"**, ver sección [Troubleshooting](#bug-crítico-railway-cache).

### 3. Test de Endpoints

```bash
# Health Check
curl https://tu-app.up.railway.app/actuator/health
# Respuesta: {"status":"UP"}

# Test API Productos
curl https://tu-app.up.railway.app/api/productos/1
```

**JSON Esperado**:
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

**❌ JSON Incorrecto** (si variantes vacías):
```json
{
  "id": 1,
  "nombre": "Torta Chocolate",
  "variantes": [],  // ❌ VACÍO
  "imagenes": []    // ❌ VACÍO
}
```

### 4. Verificar Frontend

Tu frontend en Vercel debe mostrar:

```
✅ Variantes disponibles: 1
✅ Dropdown con opciones de variantes
✅ Precios correctos
✅ Stock disponible
```

---

## 🔧 Troubleshooting

### Bug Crítico: Railway Cache

**Síntoma**: Logs muestran "Variantes: 0" a pesar de cambios en código.

**Diagnóstico**:
Railway tiene un bug conocido donde el cache de build NO se invalida correctamente con cambios de código Java.

**Evidencia**:
- ✅ Código local tiene `@Transactional(readOnly=true)` y `fetch=FetchType.EAGER`
- ✅ Git push exitoso con nuevos commits
- ✅ Railway muestra "Build Success"
- ❌ Logs Railway ejecutan código ANTIGUO sin las modificaciones

**Soluciones Implementadas**:

#### Solución 1: Workaround con `spring.jpa.open-in-view`

✅ **YA IMPLEMENTADO** en commit `07ce6ca`:

```properties
# application-production.properties
spring.jpa.open-in-view=true
```

```java
// ProductoService.java
@Transactional(readOnly = true)
public Optional<Producto> obtenerPorId(Long id) {
    Optional<Producto> producto = productoRepository.findById(id);
    if (producto.isPresent()) {
        Producto p = producto.get();
        // Force lazy initialization
        p.getVariantes().size();
        p.getImagenes().size();
    }
    return producto;
}
```

**Cómo funciona**:
- `spring.jpa.open-in-view=true`: Mantiene sesión Hibernate abierta durante JSON serialization
- `@Transactional(readOnly=true)`: Inicia transacción antes de cargar producto
- `.size()`: Fuerza carga de colecciones lazy dentro de transacción activa
- Resultado: Colecciones disponibles cuando Jackson serializa JSON

#### Solución 2: Clear Build Cache (Manual)

Si el workaround NO funciona:

1. Railway Dashboard → Tu Proyecto
2. Settings → **Clear Build Cache**
3. Redeploy manualmente
4. Espera 5-7 minutos
5. Verifica logs nuevamente

#### Solución 3: Contactar Railway Support

Si después de 2-3 redeploys TODAVÍA muestra "Variantes: 0":

**Template de Mensaje**:

```
Subject: Critical Cache Bug - Code Changes Not Applied After Multiple Deployments

Project: pasteleriafullstackfinal-production
GitHub Repo: TomasValdivia20/PasteleriaFullStackFinal

Issue:
Railway deployment pipeline caches compiled .jar and ignores ALL source code changes.

Evidence:
- 8+ different commits pushed to master (07ce6ca being latest)
- All deployments show "Build Success" status
- Logs confirm OLD code executing (missing @Transactional annotation)
- Manual "Clear Build Cache" and "Redeploy" have NO effect

Commits Attempted:
- 903ef65: Added fetch=FetchType.EAGER
- f07b078: Empty commit force rebuild
- 329434a: Dummy file rebuild.txt
- c8af336: Physical file modification with comments
- 07ce6ca: Workaround with spring.jpa.open-in-view (CURRENT)

Current State:
- Local code: ProductoService.obtenerPorId() has @Transactional(readOnly=true)
- Railway logs: Method executes WITHOUT @Transactional (old bytecode)
- Database: 37 variantes exist (verified with SQL query)
- JSON response: variantes[] and imagenes[] arrays are empty

Request:
Please manually clear Docker build cache and Maven .m2 cache for this project.
Suspected issue: Cached layer with old .jar persisting across builds.

Expected Behavior After Cache Clear:
Logs should show: "📦 [GET] /api/productos/1 - Variantes: 1"
Currently shows: "📦 [GET] /api/productos/1 - Variantes: 0"
```

Enviar a: [Railway Support](https://railway.app/support) o Discord oficial.

---

### Error: Database Connection Timeout

**Síntoma**:
```
HikariPool-1 - Connection is not available
```

**Solución**:
```properties
# application-production.properties
spring.datasource.hikari.maximum-pool-size=2
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=30000
spring.datasource.hikari.max-lifetime=60000
```

Railway free tier limita conexiones concurrentes.

---

### Error: CORS Blocked

**Síntoma**:
```
Access to fetch at 'https://railway.app/api/...' has been blocked by CORS policy
```

**Solución**:
1. Verifica variable `ALLOWED_ORIGINS` incluye tu dominio Vercel
2. Formato correcto: `https://tu-app.vercel.app` (sin trailing slash)
3. Múltiples orígenes: separar con comas SIN espacios

---

### Error: 502 Bad Gateway

**Síntoma**: Railway muestra error 502.

**Causas comunes**:
1. Aplicación no arrancó correctamente
2. Puerto incorrecto (debe escuchar en `$PORT` o 8080)
3. Health check falla

**Verificación**:
```bash
# Revisar logs de startup
Railway Dashboard → View Logs

# Buscar:
✅ "Tomcat started on port"
✅ "Started BackendApplication"
❌ Cualquier Exception o ERROR
```

---

## 🔄 Rollback

### Rollback a Deployment Anterior

1. Railway Dashboard → **Deployments**
2. Busca el deployment exitoso anterior
3. Click en **"..."** → **"Redeploy"**
4. Confirma el rollback

### Rollback Git (Emergencia)

```bash
# Ver commits recientes
git log --oneline -n 5

# Rollback a commit específico
git revert <commit-hash>
git push origin master

# O forzar reset (⚠️ destructivo)
git reset --hard <commit-hash>
git push origin master --force
```

---

## 📊 Monitoreo

### Logs en Tiempo Real

```bash
# Railway CLI
railway logs --follow

# O desde Dashboard → View Logs
```

### Métricas Importantes

Monitorea en Railway Dashboard:

- **CPU Usage**: < 80% (promedio)
- **Memory**: < 450 MB (free tier limit: 512 MB)
- **Response Time**: < 500ms (promedio)
- **Error Rate**: < 1%

---

## 🎯 Checklist Pre-Deployment

Antes de cada deployment:

- [ ] Tests locales pasan: `./mvnw test`
- [ ] Build local exitoso: `./mvnw clean package`
- [ ] Variables de entorno verificadas
- [ ] `ALLOWED_ORIGINS` incluye dominio Vercel
- [ ] Cambios commiteados y pusheados
- [ ] Base de datos Supabase accesible

---

## 🎯 Checklist Post-Deployment

Después de cada deployment:

- [ ] Build exitoso en Railway logs
- [ ] Aplicación arrancó sin errores
- [ ] Health check responde: `/actuator/health`
- [ ] API productos retorna JSON con variantes: `/api/productos/1`
- [ ] Logs muestran "Variantes: 1" (NO "Variantes: 0")
- [ ] Frontend carga productos correctamente
- [ ] Frontend muestra "Variantes disponibles: 1"
- [ ] CORS funciona desde Vercel

---

## 📚 Recursos Adicionales

- [Railway Documentation](https://docs.railway.app)
- [Spring Boot on Railway](https://docs.railway.app/guides/spring-boot)
- [Railway Support](https://railway.app/support)
- [Guía Despliegue Vercel Frontend](./DESPLIEGUE.md)

---

## ⚠️ Notas Importantes

### Railway Free Tier Limits

- **512 MB RAM**: Optimiza uso de memoria
- **2 conexiones DB**: Configurado con HikariCP
- **500 horas/mes**: Suficiente para desarrollo
- **Sleeps after inactivity**: Primera request puede tardar 10-15s

### Diferencias con Vercel

| Característica | Vercel | Railway |
|---------------|--------|---------|
| Auto-deploy | ✅ Push to branch | ✅ Push to branch |
| Variables | UI o CLI | UI o CLI |
| Logs | Real-time | Real-time |
| Build cache | Eficiente | ⚠️ Bug conocido |
| Rollback | UI simple | UI manual |
| Sleep mode | No (Pro plan) | Sí (Free tier) |

### Recomendaciones

1. **Siempre verifica logs** después de deployment
2. **Usa Railway CLI** para debugging rápido
3. **Monitorea métricas** para detectar problemas temprano
4. **Ten plan B**: Si Railway falla, considera Render.com o Fly.io
5. **Contacta Support** si bug de cache persiste más de 24h

---

## 🆘 Soporte

Si encuentras problemas:

1. **Revisa logs Railway**: Dashboard → View Logs
2. **Verifica variables**: Dashboard → Variables
3. **Clear build cache**: Settings → Clear Build Cache
4. **Consulta troubleshooting**: Ver sección correspondiente
5. **Contacta Railway Support**: Si bug de cache persiste

---

**Última actualización**: Diciembre 1, 2025  
**Versión Backend**: 0.0.1-SNAPSHOT  
**Commit actual**: `07ce6ca` (Workaround Railway cache bug)
