# 🔍 Guía de Debugging - Railway y Vercel

## 📋 Tabla de Contenidos
1. [Sistema de Logging Implementado](#sistema-de-logging-implementado)
2. [Interpretación de Logs Railway](#interpretación-de-logs-railway)
3. [Debugging con Railway CLI](#debugging-con-railway-cli)
4. [Variables de Entorno para Logging](#variables-de-entorno-para-logging)
5. [Health Checks y Métricas](#health-checks-y-métricas)
6. [Frontend Logging (Vercel)](#frontend-logging-vercel)
7. [Troubleshooting Común](#troubleshooting-común)
8. [Correlation ID Tracing](#correlation-id-tracing)

---

## 🎯 Sistema de Logging Implementado

### Backend (Spring Boot + Logback)

**Componentes clave**:

1. **Logback-spring.xml**: Configuración centralizada de logging
   - Perfiles: `development` (verbose + colores) y `production` (estructurado para Railway)
   - MDC (Mapped Diagnostic Context): `correlationId`, `userId`, `requestUri`
   - Appenders: CONSOLE (Railway captura), FILE (desarrollo local)

2. **CorrelationIdFilter**: Genera ID único por request
   - Header: `X-Correlation-ID`
   - Permite rastrear request completo en logs

3. **LoggingAspect**: AOP para logging automático
   - Intercepta métodos `@Controller` y `@Service`
   - Log entrada/salida con duración de ejecución
   - Detecta métodos lentos (>1s)

4. **GlobalExceptionHandler**: Captura todas las excepciones
   - `LazyInitializationException`: Diagnóstico detallado del bug Railway
   - `DataIntegrityViolationException`: Errores de constraints DB
   - Stack traces solo en desarrollo

5. **Custom Health Indicators**:
   - `DatabaseHealthIndicator`: Verifica conexión DB y cuenta productos
   - `HibernateHealthIndicator`: Detecta si lazy loading funciona (bug Railway)

### Frontend (React + Custom Logger)

**Componentes clave**:

1. **logger.js**: Sistema centralizado de logging
   - Niveles: `DEBUG`, `INFO`, `WARN`, `ERROR`
   - Formateo con timestamp y correlation ID
   - Batch de logs enviados a backend
   - Filtrado por nivel según entorno

2. **Integración con axios**:
   - Request/response interceptors
   - Logging automático de API calls
   - Detección de errores de configuración

3. **Endpoint backend**: `POST /api/logs`
   - Recibe logs del frontend
   - Escribe en sistema Logback con categoría `[FRONTEND]`
   - Unifica logs frontend/backend en Railway

---

## 📊 Interpretación de Logs Railway

### Formato de Logs Production

```
2025-12-01 05:30:15.234 INFO  [http-nio-8080-exec-1] c.m.b.controller.ProductoController : [correlationId=a1b2c3d4] [userId=N/A] [uri=/api/productos/1] [CONTROLLER] >>> ProductoController.obtenerProductoPorId()
2025-12-01 05:30:15.256 INFO  [http-nio-8080-exec-1] c.m.b.service.ProductoService       : [correlationId=a1b2c3d4] [userId=N/A] [uri=/api/productos/1] [SERVICE] >>> ProductoService.obtenerPorId()
2025-12-01 05:30:15.298 INFO  [http-nio-8080-exec-1] c.m.b.service.ProductoService       : [correlationId=a1b2c3d4] [userId=N/A] [uri=/api/productos/1] [SERVICE] <<< ProductoService.obtenerPorId() (took 42ms)
2025-12-01 05:30:15.310 INFO  [http-nio-8080-exec-1] c.m.b.controller.ProductoController : [correlationId=a1b2c3d4] [userId=N/A] [uri=/api/productos/1] 📦 [GET] /api/productos/1 - Variantes: 1, Imagenes: 1
2025-12-01 05:30:15.315 INFO  [http-nio-8080-exec-1] c.m.b.controller.ProductoController : [correlationId=a1b2c3d4] [userId=N/A] [uri=/api/productos/1] [CONTROLLER] <<< ProductoController.obtenerProductoPorId() (took 81ms)
```

**Lectura de log**:
- ✅ **correlationId**: `a1b2c3d4` - ID único para rastrear request completo
- ✅ **uri**: `/api/productos/1` - Endpoint solicitado
- ✅ **>>>**: Entrada a método
- ✅ **<<<**: Salida de método con duración
- ✅ **Variantes: 1**: Producto tiene variantes cargadas correctamente

### Logs de Error Típicos

#### LazyInitializationException (Bug Railway)

```
2025-12-01 05:30:15.345 ERROR [http-nio-8080-exec-1] c.m.b.e.GlobalExceptionHandler : 🔴 [LAZY INIT ERROR] Hibernate session closed before accessing lazy collection
   Path: /api/productos/1
   Message: failed to lazily initialize a collection of role: com.milsabores.backend.model.Producto.variantes
   Correlation ID: a1b2c3d4
```

**Diagnóstico**:
- ❌ `fetch=EAGER` NO está aplicado (bug de cache Railway)
- ❌ `spring.jpa.open-in-view=true` NO está funcionando
- Solución: Verificar commit deployed en Railway

#### Connection Pool Exhausted

```
2025-12-01 05:30:15.400 ERROR [http-nio-8080-exec-5] com.zaxxer.hikari.pool.HikariPool : HikariPool-1 - Connection is not available, request timed out after 5000ms.
```

**Diagnóstico**:
- ❌ Supabase Free Tier saturado (>20 conexiones)
- ❌ Conexiones no se liberan (leak)
- Solución: Reducir `spring.datasource.hikari.maximum-pool-size` o verificar leaks

#### CORS Error

```
2025-12-01 05:30:15.450 WARN  [http-nio-8080-exec-3] o.s.w.s.m.s.DefaultHandlerExceptionResolver : Rejected request from origin 'https://milsabores.vercel.app'
```

**Diagnóstico**:
- ❌ `ALLOWED_ORIGINS` no incluye dominio Vercel
- Solución: Actualizar variable de entorno en Railway

### Logs de Frontend

```
2025-12-01 05:30:15.500 INFO  [http-nio-8080-exec-7] FRONTEND : [a1b2c3d4] [session=2025-12-01T05:00:00] [url=https://milsabores.vercel.app/productos/1] API GET /api/productos/1 failed | Context: {status=500, data={...}}
```

**Lectura**:
- ✅ Categoría `FRONTEND` identifica log del navegador
- ✅ Mismo `correlationId` que backend para tracing end-to-end
- ✅ `url` muestra página donde ocurrió error

---

## 🚂 Debugging con Railway CLI

### Instalación

```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# Verificar instalación
railway --version
```

### Login

```bash
railway login
```

### Ver Logs en Tiempo Real

```bash
# Logs de deployment actual
railway logs

# Logs con follow (real-time)
railway logs --follow

# Filtrar por nivel
railway logs | Select-String "ERROR"
railway logs | Select-String "correlationId"

# Últimas 100 líneas
railway logs --tail 100
```

### Comandos Útiles

```bash
# Ver variables de entorno
railway variables

# Ejecutar comando en Railway
railway run <comando>

# Abrir dashboard en navegador
railway open

# Ver status de deployment
railway status

# Redeploy manual
railway up
```

### Debugging Específico

```bash
# Buscar errores de LazyInitializationException
railway logs | Select-String "LAZY INIT ERROR"

# Buscar logs con correlation ID específico
railway logs | Select-String "a1b2c3d4"

# Ver health check failures
railway logs | Select-String "health.*DOWN"

# Monitorear conexiones HikariCP
railway logs | Select-String "HikariPool"
```

---

## ⚙️ Variables de Entorno para Logging

### Railway (Backend)

```bash
# Perfil activo (development o production)
SPRING_PROFILES_ACTIVE=production

# Nivel de logging (opcional, por defecto usa logback-spring.xml)
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_MILSABORES_BACKEND=INFO
LOGGING_LEVEL_ORG_HIBERNATE=WARN
LOGGING_LEVEL_COM_ZAXXER_HIKARI=DEBUG

# Habilitar SQL logging (solo debugging)
SPRING_JPA_SHOW_SQL=false

# Actuator endpoints habilitados
MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info,metrics,loggers
```

### Vercel (Frontend)

```bash
# URL del backend (para envío de logs)
VITE_API_URL=https://pasteleriafullstackfinal-production.up.railway.app/api

# Nivel de logging (implícito por MODE)
# development: DEBUG
# production: INFO
```

### Testing Local

```bash
# Backend
SPRING_PROFILES_ACTIVE=development
SPRING_JPA_SHOW_SQL=true
LOGGING_LEVEL_COM_MILSABORES_BACKEND=DEBUG

# Frontend (.env.development)
VITE_API_URL=http://localhost:8080/api
```

---

## 🏥 Health Checks y Métricas

### Endpoints Disponibles

```bash
# Health check general
GET https://pasteleriafullstackfinal-production.up.railway.app/actuator/health

# Health con detalles
GET https://pasteleriafullstackfinal-production.up.railway.app/actuator/health?details=true

# Info del servicio
GET https://pasteleriafullstackfinal-production.up.railway.app/actuator/info

# Métricas
GET https://pasteleriafullstackfinal-production.up.railway.app/actuator/metrics

# Loggers (ver/cambiar niveles)
GET https://pasteleriafullstackfinal-production.up.railway.app/actuator/loggers

# Frontend logs health
GET https://pasteleriafullstackfinal-production.up.railway.app/api/logs/health
```

### Interpretar Health Check

**✅ Estado OK**:
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
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 10737418240,
        "free": 8589934592,
        "threshold": 10485760
      }
    }
  }
}
```

**❌ Bug Railway Detectado**:
```json
{
  "status": "DOWN",
  "components": {
    "hibernate": {
      "status": "DOWN",
      "details": {
        "lazyLoadingWorking": false,
        "testProductoId": 1,
        "variantesLoaded": 0,
        "imagenesLoaded": 0,
        "error": "LazyInitializationException: failed to lazily initialize...",
        "solution": "Verificar fetch=EAGER o spring.jpa.open-in-view=true"
      }
    }
  }
}
```

**Acción**: Si `hibernate.status=DOWN`, significa Railway NO aplicó workaround. Contactar Railway Support.

---

## 🌐 Frontend Logging (Vercel)

### Cómo Funciona

1. **logger.js** captura eventos en navegador
2. Logs se acumulan en buffer (max 10 o 5 segundos)
3. Batch se envía a `POST /api/logs`
4. Backend escribe logs con categoría `[FRONTEND]`
5. Railway muestra logs unificados

### Uso en Componentes

```javascript
import logger from '@/utils/logger';

// Información general
logger.info('Producto cargado', { productoId: 1, nombre: 'Torta' });

// Warning
logger.warn('Variantes vacías', { productoId: 1 });

// Error con exception
try {
  // código
} catch (error) {
  logger.error('Error cargando productos', error, { 
    url: '/api/productos' 
  });
}

// Métodos específicos
logger.api('GET', '/api/productos/1', 200, { duration: '45ms' });
logger.carrito('Producto agregado', { productoId: 1, cantidad: 2 });
logger.auth('Login exitoso', { userId: 123 });
logger.variantes(1, 0, []); // Auto-warn si count=0
```

### Debugging en Consola Browser

**Desarrollo** (localhost):
- Logs aparecen en consola con colores y emojis
- Click en grupo expandido para ver contexto
- Stack traces completos

**Producción** (Vercel):
- Solo errores en consola
- Logs enviados a backend Railway
- Consultar Railway logs para ver logs frontend

### Ver Logs Frontend en Railway

```bash
# Filtrar solo logs frontend
railway logs | Select-String "FRONTEND"

# Buscar errores específicos
railway logs | Select-String "FRONTEND.*ERROR"

# Rastrear sesión específica
railway logs | Select-String "session=2025-12-01T05:00:00"
```

---

## 🔧 Troubleshooting Común

### Problema: Logs no muestran correlation ID

**Síntoma**:
```
2025-12-01 05:30:15.234 INFO  ... [correlationId=N/A]
```

**Causa**: CorrelationIdFilter no está ejecutándose

**Solución**:
1. Verificar `@Component` en `CorrelationIdFilter.java`
2. Verificar orden de filtros en Security
3. Logs Railway: buscar `CorrelationIdFilter` en startup

---

### Problema: LazyInitializationException persiste

**Síntoma**:
```
Health check muestra: "lazyLoadingWorking": false
```

**Causa**: Railway cache bug - código antiguo deployed

**Solución**:
1. Verificar commit actual en Railway Dashboard
2. Railway CLI: `railway logs | Select-String "LAZY INIT"`
3. Si persiste: Clear Build Cache manual
4. Último recurso: Contactar Railway Support con template

---

### Problema: Frontend logs no llegan a Railway

**Síntoma**: No aparecen logs `[FRONTEND]` en Railway

**Diagnóstico**:
```bash
# Test endpoint
curl -X POST https://tu-app.up.railway.app/api/logs/health
# Debe retornar: {"status":"UP","service":"Frontend Logging"}

# Test envío de log
curl -X POST https://tu-app.up.railway.app/api/logs \
  -H "Content-Type: application/json" \
  -d '{"logs":[{"timestamp":"2025-12-01T05:30:00","level":"INFO","category":"TEST","message":"Test log","context":{}}]}'
```

**Causas**:
1. CORS bloqueando request desde Vercel
2. `VITE_API_URL` incorrecta
3. Network error (timeout)

**Solución**:
1. Verificar `ALLOWED_ORIGINS` incluye dominio Vercel
2. Frontend console: buscar error CORS
3. Verificar variable entorno en Vercel dashboard

---

### Problema: Health check retorna 404

**Síntoma**:
```
GET /actuator/health -> 404 Not Found
```

**Causa**: Actuator endpoints no expuestos

**Solución**:
Verificar `application-production.properties`:
```properties
management.endpoints.web.exposure.include=health,info,metrics,loggers
```

---

### Problema: Logs muy verbosos en producción

**Síntoma**: Railway logs inundados de mensajes DEBUG

**Solución**:
Ajustar niveles en Railway variables:
```bash
LOGGING_LEVEL_COM_MILSABORES_BACKEND=INFO
LOGGING_LEVEL_ORG_SPRINGFRAMEWORK=WARN
LOGGING_LEVEL_ORG_HIBERNATE_SQL=WARN
```

O actualizar `logback-spring.xml` perfil production.

---

## 🔗 Correlation ID Tracing

### End-to-End Request Tracking

**Flujo completo**:

1. **Frontend genera correlation ID**:
   ```javascript
   // logger.js
   correlationId: "a1b2c3d4"
   ```

2. **Axios agrega header**:
   ```javascript
   config.headers['X-Correlation-ID'] = logger.correlationId
   ```

3. **Backend recibe y agrega a MDC**:
   ```java
   // CorrelationIdFilter.java
   MDC.put("correlationId", "a1b2c3d4")
   ```

4. **Todos los logs backend incluyen ID**:
   ```
   [correlationId=a1b2c3d4] [SERVICE] >>> ProductoService.obtenerPorId()
   ```

5. **Frontend logs enviados con mismo ID**:
   ```
   [FRONTEND] [a1b2c3d4] API GET /api/productos/1 failed
   ```

### Rastrear Request Completo

```bash
# Railway logs
railway logs | Select-String "a1b2c3d4"
```

**Resultado**:
```
[Frontend] API GET /api/productos/1 started
[Backend] [CONTROLLER] >>> ProductoController.obtenerProductoPorId()
[Backend] [SERVICE] >>> ProductoService.obtenerPorId()
[Backend] [SERVICE] <<< ProductoService.obtenerPorId() (42ms)
[Backend] [CONTROLLER] <<< ProductoController.obtenerProductoPorId() (81ms)
[Frontend] API GET /api/productos/1 completed (120ms)
```

Permite ver **timeline completa** de request desde click usuario hasta response.

---

## 📚 Recursos Adicionales

- [Logback Documentation](http://logback.qos.ch/documentation.html)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
- [Railway Logging Guide](https://docs.railway.app/develop/logs)
- [MDC Best Practices](https://www.baeldung.com/mdc-in-log4j-2-logback)
- [AOP Logging Patterns](https://www.baeldung.com/spring-aop-advice-tutorial)

---

**Última actualización**: Diciembre 1, 2025  
**Sistema de logging**: Backend (Logback + AOP) + Frontend (Custom Logger)  
**Health checks**: Database + Hibernate LazyLoading detector
