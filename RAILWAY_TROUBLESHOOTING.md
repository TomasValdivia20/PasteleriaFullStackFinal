# 🚨 Railway Troubleshooting - Mil Sabores Pastelería

## Tabla de Contenidos

1. [Crash: Logback Configuration Error](#1-crash-logback-configuration-error)
2. [Variantes: 0 - LazyInitializationException](#2-variantes-0---lazyinitializationexception)
3. [Database Connection Pool Exhausted](#3-database-connection-pool-exhausted)
4. [Memory Leak - Out of Memory](#4-memory-leak---out-of-memory)
5. [Frontend No Conecta con Backend](#5-frontend-no-conecta-con-backend)

---

## 1. Crash: Logback Configuration Error

### 🔴 Síntomas

```log
ERROR in ch.qos.logback.core.pattern.parser.Compiler - There is no conversion class registered for composite conversion word [clr]
ERROR in ch.qos.logback.core.pattern.parser.Compiler - Failed to create converter for [%clr] keyword
ERROR in ch.qos.logback.core.pattern.parser.Compiler - [wEx] is not a valid conversion word
Logging system failed to initialize using configuration from 'null'
java.lang.IllegalStateException: Logback configuration error detected
```

- Railway crash **ANTES** de iniciar Spring Boot
- Stack trace: `LogbackLoggingSystem.loadConfiguration` → `LogbackLoggingSystem.reportConfigurationErrorsIfNecessary`
- Aplicación nunca arranca (Exit Code 1)

### 🔍 Diagnóstico

**Railway usa Logback ESTÁNDAR**, NO Spring Boot embedded con extensiones.

Extensiones incompatibles:
- `%clr(...)` → Color highlighting (solo funciona con Spring Boot ConsoleAppender personalizado)
- `%wEx` → WhitespaceThrowable (extensión no estándar)

### ✅ Solución

**Archivo:** `Backend/src/main/resources/logback-spring.xml`

**Antes (INCOMPATIBLE):**
```xml
<property name="CONSOLE_LOG_PATTERN_PROD" 
          value="%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){faint} %clr(%5p) %m%n%wEx"/>
```

**Después (RAILWAY-COMPATIBLE):**
```xml
<property name="CONSOLE_LOG_PATTERN_PROD" 
          value="%d{yyyy-MM-dd HH:mm:ss.SSS} %5p [%t] %-40.40logger{39} : [correlationId=%X{correlationId}] %m%n%ex{short}"/>
```

**Cambios:**
1. `%clr(...)` → Removido (usar patrones estándar: `%d`, `%p`, `%logger`)
2. `%wEx` → `%ex{short}` (producción) o `%ex{full}` (desarrollo)
3. Mantener MDC: `[correlationId=%X{correlationId}] [userId=%X{userId}]`

### 📝 Validación

```powershell
# Compilar y test local con perfil production
cd Backend
.\mvnw.cmd clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=production --server.port=8081

# Buscar errores Logback
# ✅ Esperado: Sin "ERROR in ch.qos.logback.core.pattern.parser.Compiler"
# ✅ Esperado: "Started BackendApplication in X seconds"
```

### 🎯 Prevención

- **NUNCA usar extensiones Spring Boot** en `logback-spring.xml` para deployments en Railway
- **Test con perfil production** localmente ANTES de pushear a Railway
- **Monitorear logs Railway** primeros 30 segundos después de deploy

---

## 2. Variantes: 0 - LazyInitializationException

### 🔴 Síntomas

```json
{
  "id": 1,
  "nombre": "Torta de Chocolate",
  "variantes": [],  // ❌ VACÍO (esperado: array con variantes)
  "imagenes": []
}
```

**Railway log:**
```log
org.hibernate.LazyInitializationException: failed to lazily initialize a collection of role: com.milsabores.backend.model.Producto.variantes: could not initialize proxy - no Session
```

### 🔍 Diagnóstico

**Railway BUG:** Cache corrupto ignora `fetch=EAGER` en annotations JPA.

**Health Check automático** detecta el problema:
```bash
curl https://tu-app.up.railway.app/actuator/health
```

```json
{
  "status": "DOWN",
  "components": {
    "hibernate": {
      "status": "DOWN",
      "details": {
        "lazyLoadingWorking": false,  // ❌ Bug detectado
        "error": "LazyInitializationException: ..."
      }
    }
  }
}
```

### ✅ Solución

**Workaround 1: spring.jpa.open-in-view**

`Backend/src/main/resources/application-production.properties`
```properties
spring.jpa.open-in-view=true
```

**Workaround 2: @Transactional en Controller**

```java
@GetMapping("/{id}")
@Transactional(readOnly = true)  // ✅ Forzar sesión abierta
public ResponseEntity<Producto> getProducto(@PathVariable Long id) {
    Producto producto = productoService.findById(id);
    producto.getVariantes().size();  // Force initialization
    return ResponseEntity.ok(producto);
}
```

**Workaround 3: Railway Build Cache Clear**

```bash
# Railway Dashboard → Settings → General → Clear Build Cache
# Redeploy
```

### 🎯 Prevención

- **Health check** post-deployment: Verificar `/actuator/health` → `lazyLoadingWorking: true`
- **Monitorear logs** Railway: Buscar `LazyInitializationException`
- **Test API** inmediato: `curl /api/productos/1` → Verificar `variantes.length > 0`

---

## 3. Database Connection Pool Exhausted

### 🔴 Síntomas

```log
HikariPool - Connection is not available, request timed out after 30000ms
java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available
```

- Requests lentas (timeout 30s+)
- Errores 500 intermitentes
- Railway logs muestran active connections = max pool size

### 🔍 Diagnóstico

**PostgreSQL Railway Free Tier:**
- Max connections: 100
- Default HikariCP pool: 10

**Causas:**
1. Connection leaks (transacciones no cerradas)
2. Long-running queries
3. Pool size muy bajo para carga

### ✅ Solución

**Ajustar HikariCP:**

`application-production.properties`
```properties
# Connection Pool
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000

# Connection leak detection
spring.datasource.hikari.leak-detection-threshold=60000
```

**Monitoreo con Actuator:**

```bash
curl https://tu-app.up.railway.app/actuator/metrics/hikaricp.connections.active
curl https://tu-app.up.railway.app/actuator/metrics/hikaricp.connections.idle
```

### 📝 Validación

Railway logs:
```log
HikariPool-1 - Pool stats (total=20, active=3, idle=17, waiting=0)
```

✅ Esperado:
- `active` < `total * 0.8` (buffer 20%)
- `waiting` = 0 (sin requests bloqueados)

---

## 4. Memory Leak - Out of Memory

### 🔴 Síntomas

```log
java.lang.OutOfMemoryError: Java heap space
Exception in thread "http-nio-8080-exec-23" java.lang.OutOfMemoryError: GC overhead limit exceeded
```

- Railway crashea después de 2-6 horas
- Restart automático cada pocas horas
- Performance degradada progresivamente

### 🔍 Diagnóstico

**Railway Free Tier:** 512MB RAM

**Causas comunes:**
1. **MDC no limpiado** → Thread pool retiene correlationId
2. **Logging excesivo** → StringBuilder acumula logs
3. **Collections sin límite** → Cache crece indefinidamente

### ✅ Solución

**1. MDC Cleanup (CRÍTICO):**

`CorrelationIdFilter.java`
```java
@Override
protected void doFilterInternal(HttpServletRequest request, 
                                 HttpServletResponse response, 
                                 FilterChain filterChain) throws ServletException, IOException {
    try {
        String correlationId = // ... generar/extraer
        MDC.put("correlationId", correlationId);
        filterChain.doFilter(request, response);
    } finally {
        MDC.clear();  // ✅ CRÍTICO: Limpiar MDC
    }
}
```

**2. JVM Memory Settings:**

Railway Environment Variables:
```bash
JAVA_TOOL_OPTIONS=-Xmx400m -Xms200m -XX:MaxMetaspaceSize=100m
```

**3. Logging Batch Límites:**

`LogController.java`
```java
private static final int MAX_BATCH_SIZE = 50;  // ✅ Prevenir payloads gigantes
```

### 📝 Validación

```bash
# Monitorear memoria Railway
curl https://tu-app.up.railway.app/actuator/metrics/jvm.memory.used
curl https://tu-app.up.railway.app/actuator/metrics/jvm.memory.max
```

---

## 5. Frontend No Conecta con Backend

### 🔴 Síntomas

**Frontend (Vercel) errors:**
```javascript
Failed to fetch
ERR_CONNECTION_REFUSED
CORS policy: No 'Access-Control-Allow-Origin' header
```

**Backend Railway logs:**
```log
// Silencio total (no recibe requests)
```

### 🔍 Diagnóstico

**3 problemas comunes:**

1. **CORS no configurado** → Backend rechaza requests de dominio diferente
2. **URL incorrecta** → Frontend apunta a localhost o URL antigua
3. **Railway sleeping** → Free tier duerme después de inactividad

### ✅ Solución

**1. CORS Backend:**

`SecurityConfig.java`
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "https://tu-frontend.vercel.app",
        "http://localhost:5173"  // Desarrollo local
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", configuration);
    return source;
}
```

**2. Frontend Environment Variables (Vercel):**

```bash
VITE_API_URL=https://pasteleriafullstackfinal-production.up.railway.app/api
VITE_ENABLE_LOGS=true
```

`api.js`
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

**3. Railway Keep-Alive (Prevenir sleep):**

**Opción A: Cron Job** (GitHub Actions)

`.github/workflows/keep-railway-alive.yml`
```yaml
name: Keep Railway Alive
on:
  schedule:
    - cron: '*/10 * * * *'  # Cada 10 minutos
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Railway
        run: curl -f https://tu-app.up.railway.app/actuator/health || exit 1
```

**Opción B: UptimeRobot** (gratuito)
- URL: `https://tu-app.up.railway.app/actuator/health`
- Interval: 5 minutos
- Alert: Email si DOWN

### 📝 Validación

**Test CORS:**
```bash
curl -H "Origin: https://tu-frontend.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS https://tu-app.up.railway.app/api/productos \
     -v
```

✅ Esperado:
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: https://tu-frontend.vercel.app
< Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
< Access-Control-Allow-Credentials: true
```

**Test conectividad end-to-end:**
```bash
# Desde Vercel Console (F12 → Console)
fetch('https://tu-app.up.railway.app/api/productos')
  .then(r => r.json())
  .then(console.log)
```

✅ Esperado: Array de productos con variantes/imagenes

---

## 📚 Recursos Adicionales

- [DEBUGGING_RAILWAY.md](./DEBUGGING_RAILWAY.md) - Sistema de logging completo
- [RAILWAY_CONFIGURACION_FINAL.md](./RAILWAY_CONFIGURACION_FINAL.md) - Variables de entorno
- [INSTRUCCIONES_RAILWAY.md](./INSTRUCCIONES_RAILWAY.md) - Deployment paso a paso

## 🆘 Contacto Soporte

Si ninguna solución funciona:

1. **Railway Dashboard** → Settings → Logs → Download full logs
2. **GitHub Issue** con:
   - Logs completos (primeros 100 líneas + últimas 100 líneas)
   - Variables de entorno (sin secrets)
   - Comando `curl` reproducible del error
3. **Railway Discord** → #help channel

---

**Última actualización:** Diciembre 2025  
**Mantenedor:** Sistema Forense Automático Mil Sabores
