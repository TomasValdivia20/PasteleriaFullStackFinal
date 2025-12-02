# 🚂 INSTRUCCIONES DE DEPLOYMENT - RAILWAY

## 📋 TABLA DE CONTENIDOS
1. [Variables de Entorno Obligatorias](#variables-de-entorno-obligatorias)
2. [Variables de Entorno Opcionales](#variables-de-entorno-opcionales)
3. [Configuración del Proyecto](#configuración-del-proyecto)
4. [Pasos de Deployment](#pasos-de-deployment)
5. [Verificación Post-Deployment](#verificación-post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## 🔐 VARIABLES DE ENTORNO OBLIGATORIAS

### Base de Datos (Supabase)
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:6543/postgres?prepareThreshold=0
SPRING_DATASOURCE_USERNAME=postgres.dzbeucldelrjdjprfday
SPRING_DATASOURCE_PASSWORD=<TU_PASSWORD_SUPABASE>
```

### Configuración de Spring Boot
```bash
SPRING_PROFILES_ACTIVE=production
PORT=8080
```

### JWT Security
```bash
JWT_SECRET=<TU_JWT_SECRET_ALEATORIO_MINIMO_256_BITS>
JWT_EXPIRATION=86400000
```

**Ejemplo para generar JWT_SECRET seguro:**
```bash
# En PowerShell
$bytes = New-Object byte[] 32; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)

# En Linux/Mac
openssl rand -base64 32
```

### Frontend URL (CORS)
```bash
FRONTEND_URL=https://tu-frontend.vercel.app
```

### Supabase Storage (opcional si usas imágenes)
```bash
SUPABASE_URL=https://dzbeucldelrjdjprfday.supabase.co
SUPABASE_KEY=<TU_SUPABASE_ANON_KEY>
SUPABASE_BUCKET=pasteles
```

---

## ⚙️ VARIABLES DE ENTORNO OPCIONALES

### HikariCP Connection Pool (valores seguros por defecto)
Estas variables **NO son necesarias** porque el código ya tiene valores seguros por defecto (2, 1).  
Solo configúralas si necesitas ajustar el pool de conexiones:

```bash
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=2
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=1
SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT=20000
SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT=600000
SPRING_DATASOURCE_HIKARI_MAX_LIFETIME=1200000
SPRING_DATASOURCE_HIKARI_LEAK_DETECTION_THRESHOLD=15000
```

**⚠️ IMPORTANTE:** No aumentes `MAXIMUM_POOL_SIZE` más de 3 si usas Supabase Free Tier (15 conexiones totales).

---

## 🛠️ CONFIGURACIÓN DEL PROYECTO EN RAILWAY

### 1. Configuración del Root Directory
```
Root Directory: Backend
```

### 2. Build Command (Railway detecta Maven automáticamente)
```bash
mvn clean package -DskipTests
```

### 3. Start Command
```bash
java -Xmx400m -Xms200m -XX:MaxMetaspaceSize=100m -jar target/backend-0.0.1-SNAPSHOT.jar
```

**Explicación de flags JVM:**
- `-Xmx400m`: Memoria máxima heap (ajustado para Railway Free Tier)
- `-Xms200m`: Memoria inicial heap
- `-XX:MaxMetaspaceSize=100m`: Memoria máxima para metadatos de clases

### 4. Port
Railway asignará el puerto automáticamente vía variable `PORT` (configurada en código con `${PORT:8080}`).

---

## 🚀 PASOS DE DEPLOYMENT

### Paso 1: Conectar Repositorio GitHub
1. Ve a Railway Dashboard → New Project
2. Selecciona "Deploy from GitHub repo"
3. Conecta el repositorio: `TomasValdivia20/PasteleriaFullStackFinal`
4. Railway detectará que es un proyecto Spring Boot (Maven)

### Paso 2: Configurar Variables de Entorno
1. Ve a tu proyecto en Railway → Variables
2. Agrega todas las **variables obligatorias** listadas arriba
3. Guarda los cambios

### Paso 3: Configurar Build Settings
1. Ve a Settings → Root Directory
2. Configura: `Backend`
3. Guarda

### Paso 4: Trigger Deploy
1. Railway deployará automáticamente al hacer push a `master`
2. O haz click en "Deploy" manualmente desde el dashboard

### Paso 5: Verificar Logs
1. Ve a Deployments → Latest Deployment → Logs
2. Busca líneas como:
```log
HikariPool-1 - Starting...
maximumPoolSize.................2
minimumIdle.....................1
Tomcat started on port 8080
Started BackendApplication
```

---

## ✅ VERIFICACIÓN POST-DEPLOYMENT

### 1. Health Check
Accede a:
```
https://tu-backend.railway.app/actuator/health
```

Deberías ver:
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

### 2. Endpoint de Productos (público)
```
https://tu-backend.railway.app/api/productos
```

### 3. Logs de HikariCP
Verifica en los logs de Railway que el pool de conexiones se inicializó correctamente:
```log
2025-12-02 16:52:00.981 DEBUG [...] maximumPoolSize.................2
2025-12-02 16:52:00.982 DEBUG [...] minimumIdle.....................1
2025-12-02 16:52:00.982 INFO  [...] HikariPool-1 - Start completed.
```

---

## 🔧 TROUBLESHOOTING

### Error: "Max client connections reached"
**Causa:** Pool de conexiones excede límite de Supabase (15 conexiones).

**Solución:**
1. Verifica que `SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=2`
2. Verifica que `SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=1`
3. Reinicia Supabase Connection Pooler:
   - Dashboard Supabase → Database → Connection Pooler → Restart

### Error: "Unable to start web server"
**Causa:** Variables de entorno mal configuradas.

**Solución:**
1. Verifica que todas las **variables obligatorias** estén configuradas
2. Verifica que `SPRING_DATASOURCE_PASSWORD` sea correcto
3. Verifica que `SPRING_PROFILES_ACTIVE=production`

### Error: "Flyway failed to initialize"
**Causa:** Flyway está habilitado en producción (no debería).

**Solución:**
- Verifica que `SPRING_PROFILES_ACTIVE=production` (el perfil production deshabilita Flyway)
- Si el error persiste, agrega: `SPRING_FLYWAY_ENABLED=false`

### Logs muestran "maximumPoolSize.................10"
**Causa:** Variables de entorno NO se están aplicando.

**Solución:**
1. **Ya está corregido** con los cambios recientes (defaults seguros en código)
2. Haz nuevo deploy para aplicar los cambios
3. Verifica que después del deploy los logs muestren `maximumPoolSize.................2`

### Error: "JWT secret key is null or empty"
**Causa:** Variable `JWT_SECRET` no configurada.

**Solución:**
1. Genera un secret seguro (ver sección "Variables Obligatorias")
2. Configura `JWT_SECRET` en Railway
3. Redeploy

---

## 📊 MÉTRICAS Y MONITOREO

### Endpoints de Actuator disponibles:
```
/actuator/health       # Health checks
/actuator/info         # Información de la app
/actuator/metrics      # Métricas JVM/HTTP
/actuator/loggers      # Configuración de logs
```

### Monitoreo de Conexiones HikariCP:
```
/actuator/metrics/hikaricp.connections.active
/actuator/metrics/hikaricp.connections.idle
/actuator/metrics/hikaricp.connections.max
/actuator/metrics/hikaricp.connections.min
```

---

## 🔄 ACTUALIZACIÓN DE CONFIGURACIÓN

Si necesitas modificar variables de entorno:

1. Railway Dashboard → Tu Proyecto → Variables
2. Modifica las variables necesarias
3. Railway **NO redeploya automáticamente** al cambiar variables
4. Haz click en "Redeploy" manualmente

---

## 📝 NOTAS ADICIONALES

### Diferencias entre Perfiles:
- **development** (`application.properties`):
  - Flyway habilitado
  - SQL logging habilitado
  - Pool de conexiones: 2 max, 1 min

- **production** (`application-production.properties`):
  - Flyway deshabilitado (migraciones ya aplicadas)
  - SQL logging deshabilitado (performance)
  - Pool de conexiones: 2 max, 1 min (optimizado para Supabase Free Tier)

### Optimizaciones aplicadas:
✅ Pool de conexiones reducido (2 max, 1 min) para Supabase Free Tier  
✅ Timeouts ajustados (20s connection-timeout, 20min max-lifetime)  
✅ Leak detection habilitado (15s threshold)  
✅ Flyway deshabilitado en producción  
✅ SQL logging deshabilitado en producción  
✅ Variables de entorno estandarizadas entre perfiles  

---

## 🆘 SOPORTE

Si encuentras errores no documentados aquí:
1. Revisa los logs completos en Railway Dashboard
2. Busca excepciones Java (stack traces)
3. Verifica configuración de Supabase Connection Pooler
4. Confirma que las migraciones de Flyway estén aplicadas en Supabase

**Última actualización:** 2 de diciembre de 2025
