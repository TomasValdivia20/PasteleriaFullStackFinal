# 🚀 GUÍA COMPLETA DE DESPLIEGUE - RAILWAY & VERCEL

## 📊 DIAGNÓSTICO ACTUAL

### ✅ Backend (Railway) - CONFIGURACIÓN CORRECTA
- **Repository**: `ProductoRepository.findByIdWithCollections()` usa `JOIN FETCH`
- **Service**: `ProductoService.obtenerPorId()` con `@Transactional(readOnly = true)`
- **Entity**: `Producto` tiene `@JsonManagedReference("producto-variantes")`
- **Controller**: `ProductoController` retorna objeto completo con variantes

### ❌ Database (Supabase) - DATOS FALTANTES
- **Problema**: Tabla `variantes_producto` está VACÍA
- **Evidencia**: Endpoint retorna `"variantes": []`
- **Causa**: SQL `SQL_INSERT_VARIANTES_PRODUCTOS.sql` NO fue ejecutado

### ✅ Frontend (Vercel) - CÓDIGO CORRECTO
- **dataLoader**: `cargarProductoPorId()` llama `/api/productos/{id}`
- **ProductDetail**: Usa `data.variantes` correctamente
- **Mapping**: Frontend espera array `variantes` con propiedades: `id`, `nombre`, `precio`, `stock`, `infoNutricional`

---

## 🔧 SOLUCIÓN - PASOS OBLIGATORIOS

### PASO 1: Insertar Datos en Supabase ⚠️ CRÍTICO

**¿Por qué fallan las variantes?**
La tabla `variantes_producto` en Supabase está vacía. El backend no puede retornar lo que no existe.

**Acción requerida:**

1. **Abrir Supabase Dashboard**:
   - URL: https://supabase.com/dashboard
   - Proyecto: `dzbeucldelrjdjprfday`

2. **Ir al SQL Editor**:
   - Menú izquierdo → **SQL Editor**
   - Click **"New query"**

3. **Ejecutar Script Completo**:
   - Abrir archivo: `SQL_INSERT_VARIANTES_PRODUCTOS.sql`
   - Copiar **TODO** el contenido (180 líneas)
   - Pegar en Supabase SQL Editor
   - Click **RUN** (botón verde)

4. **Verificar Inserción**:
   ```sql
   -- Ejecutar estas queries después del INSERT
   
   -- Debe retornar 58
   SELECT COUNT(*) FROM variantes_producto;
   
   -- Debe retornar 7 filas (variantes del producto 1)
   SELECT id, nombre, precio, stock, producto_id 
   FROM variantes_producto 
   WHERE producto_id = 1 
   ORDER BY precio;
   ```

**Resultado esperado:**
```
total_variantes: 58

Producto 1 variantes:
id | nombre         | precio  | stock | producto_id
---+----------------+---------+-------+-------------
1  | 12 Personas    | 42000   | 20    | 1
2  | 16 Personas    | 56000   | 15    | 1
3  | 20 Personas    | 70000   | 12    | 1
4  | 25 Personas    | 87500   | 10    | 1
5  | 30 Personas    | 105000  | 8     | 1
6  | 40 Personas    | 119550  | 5     | 1
7  | 50 Personas    | 134100  | 3     | 1
```

---

### PASO 2: Verificar Backend Railway

**Después de insertar datos en Supabase**, probar endpoint:

```powershell
# PowerShell - Probar endpoint
Invoke-RestMethod -Uri "https://pasteleriafullstackfinal-production.up.railway.app/api/productos/1" | ConvertTo-Json -Depth 10
```

**Resultado esperado:**
```json
{
  "id": 1,
  "nombre": "Torta Selva Negra",
  "descripcion": "Bizcocho negro, crema chantilly...",
  "imagen": "/assets/img/torta-selva-negra.jpg",
  "precioBase": 42000,
  "categoria": {
    "id": 1,
    "nombre": "Bizcochuelo ",
    "descripcion": "Deliciosas tortas...",
    "imagen": "bizcochuelo.jpg"
  },
  "variantes": [
    {
      "id": 1,
      "nombre": "12 Personas",
      "precio": 42000,
      "stock": 20,
      "infoNutricional": "Peso: 2.2kg | Energía: 6480kcal..."
    },
    {
      "id": 2,
      "nombre": "16 Personas",
      "precio": 56000,
      "stock": 15,
      "infoNutricional": "Peso: 2.9kg | Energía: 8640kcal..."
    }
    // ... 5 variantes más (total 7)
  ],
  "imagenes": []
}
```

**Si aún retorna `variantes: []`**:
1. Verificar que Supabase tiene los datos: `SELECT COUNT(*) FROM variantes_producto;`
2. Reiniciar Railway: Dashboard → Backend Service → **Restart**
3. Esperar 2-3 minutos
4. Probar endpoint nuevamente

---

### PASO 3: Verificar Frontend Vercel

**Después de confirmar que backend retorna variantes:**

1. **Abrir aplicación**: https://pasteleria-full-stack-final.vercel.app
2. **Ir a Categorías** → "Bizcochuelo"
3. **Seleccionar producto**: "Torta Selva Negra"
4. **Abrir DevTools** (F12) → Console

**Logs esperados:**
```
🎯 [ProductDetail] Cargando producto con ID: 1
🔍 [dataLoader] Iniciando carga de producto ID: 1
🎯 [dataLoader] Intento 1: GET /productos/1
✅ [dataLoader] Producto cargado exitosamente desde endpoint directo
   Producto ID: 1
   Nombre: Torta Selva Negra
✅ [ProductDetail] Producto cargado: {...}
   Variantes disponibles: 7  ← ✅ DEBE SER 7, NO 0
```

**UI esperada:**
- Selector de tamaños visible (dropdown o botones)
- 7 opciones: "12 Personas", "16 Personas", "20 Personas", "25 Personas", "30 Personas", "40 Personas", "50 Personas"
- Precio cambia al seleccionar tamaño
- Info nutricional se actualiza
- Botón "Agregar al Carrito" habilitado

---

## ⚙️ CONFIGURACIÓN RAILWAY (Backend)

### Variables de Entorno Actuales ✅

Railway ya tiene configuradas estas variables (NO MODIFICAR):

```bash
# 1. Database Connection
SUPABASE_DB_PASSWORD="PasteleriaMilSabores123!"
# Nota: Si tu variable se llama SPRING_DATASOURCE_PASSWORD, renómbrala a SUPABASE_DB_PASSWORD

# 2. Supabase Storage
SUPABASE_URL="https://dzbeucldelrjdjprfday.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_BUCKET="pasteles"

# 3. JWT Authentication
JWT_SECRET="milsabores-secret-key-super-secure-2024-pasteleria-jwt-token-security-production"
JWT_EXPIRATION="86400000"

# 4. CORS Configuration
FRONTEND_URL="https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app"

# 5. Spring Boot
SPRING_PROFILES_ACTIVE="production"

# 6. JVM Memory Optimization
JAVA_TOOL_OPTIONS="-Xmx400m -Xms200m -XX:MaxMetaspaceSize=100m"
```

### Variables a ELIMINAR (si existen)

Estas variables están hardcodeadas en `application-production.properties`, elimínalas:

```bash
❌ FLYWAY_ENABLED
❌ SPRING_JPA_OPEN_IN_VIEW
❌ SPRING_JPA_HIBERNATE_DDL_AUTO
❌ SPRING_JPA_SHOW_SQL
❌ SPRING_JPA_PROPERTIES_HIBERNATE_FORMAT_SQL
```

### Verificar Nombre de Variable Database

**IMPORTANTE**: Verificar que tengas `SUPABASE_DB_PASSWORD` y NO `SPRING_DATASOURCE_PASSWORD`.

**Si tienes `SPRING_DATASOURCE_PASSWORD`:**
1. Railway Dashboard → Backend Service → Variables
2. Click editar en `SPRING_DATASOURCE_PASSWORD`
3. Cambiar nombre a: `SUPABASE_DB_PASSWORD`
4. Mantener valor: `PasteleriaMilSabores123!`
5. Click Update

**Razón**: `application-production.properties` línea 19 espera:
```properties
spring.datasource.password=${SUPABASE_DB_PASSWORD}
```

### Configuración Hardcodeada (NO requiere variables)

Estos valores están hardcodeados en `application-production.properties`:

```properties
# Database Connection (Session Pooler)
spring.datasource.url=jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require&options=-c%20idle_in_transaction_session_timeout=30s&connectTimeout=10
spring.datasource.username=postgres.dzbeucldelrjdjprfday
spring.datasource.driver-class-name=org.postgresql.Driver

# HikariCP Pool
spring.datasource.hikari.maximum-pool-size=2
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.max-lifetime=1200000
spring.datasource.hikari.leak-detection-threshold=15000

# Flyway
spring.flyway.enabled=false

# JPA
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false
spring.jpa.open-in-view=true
```

---

## 🌐 CONFIGURACIÓN VERCEL (Frontend)

### Variables de Entorno Necesarias

Vercel → Project Settings → Environment Variables:

```bash
# Backend API URL
VITE_API_BASE_URL=https://pasteleriafullstackfinal-production.up.railway.app

# Environment
VITE_ENVIRONMENT=production
```

**¿Dónde se usan?**
- `Frontend/src/api.js`: Configura axios con `import.meta.env.VITE_API_BASE_URL`

### Verificar en Local

Antes de desplegar en Vercel, probar localmente:

```powershell
# Frontend/.env.production
VITE_API_BASE_URL=https://pasteleriafullstackfinal-production.up.railway.app
VITE_ENVIRONMENT=production
```

```powershell
# Instalar dependencias
cd Frontend
npm install

# Build de producción
npm run build

# Preview local
npm run preview
```

Abrir: http://localhost:4173 y verificar que productos carguen con variantes.

---

## 🔍 TROUBLESHOOTING

### Problema: Backend retorna variantes: []

**Diagnóstico:**
```powershell
# Verificar endpoint
Invoke-RestMethod -Uri "https://pasteleriafullstackfinal-production.up.railway.app/api/productos/1"
```

**Soluciones:**

1. **Verificar datos en Supabase**:
   ```sql
   -- Ejecutar en Supabase SQL Editor
   SELECT COUNT(*) FROM variantes_producto;
   -- Debe retornar 58
   
   SELECT * FROM variantes_producto WHERE producto_id = 1;
   -- Debe retornar 7 filas
   ```

2. **Verificar foreign keys**:
   ```sql
   -- No debe retornar filas (sin FKs rotas)
   SELECT vp.id, vp.nombre, vp.producto_id, p.nombre AS producto
   FROM variantes_producto vp
   LEFT JOIN productos p ON vp.producto_id = p.id
   WHERE p.id IS NULL;
   ```

3. **Reiniciar Railway**:
   - Railway Dashboard → Backend Service → **Restart**
   - Esperar 2-3 minutos
   - Probar endpoint nuevamente

4. **Verificar logs Railway**:
   - Railway → Deployments → Latest → View Logs
   - Buscar (Ctrl+F): `HikariPool-1 - Start completed`
   - Buscar: `jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:5432/postgres`
   - No debe haber: `FATAL: Max client connections reached`

### Problema: Frontend no muestra variantes pero backend sí

**Diagnóstico:**
1. F12 → Console → Buscar logs de dataLoader
2. Verificar que `Variantes disponibles: 7` (no 0)
3. Verificar que no hay errores de CORS

**Soluciones:**

1. **Verificar mapeo de datos**:
   ```javascript
   // ProductDetail.jsx debe usar:
   producto.variantes?.length
   producto.variantes.map(...)
   ```

2. **Verificar CORS**:
   - Railway debe tener: `FRONTEND_URL="https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app"`
   - Logs Railway deben mostrar: `🌍 [CORS] Orígenes permitidos: [...]`

3. **Limpiar caché Vercel**:
   - Vercel Dashboard → Project → Settings → Clear Cache
   - Redeploy

### Problema: CORS errors en frontend

**Síntoma:**
```
Access to XMLHttpRequest at 'https://pasteleriafullstackfinal-production.up.railway.app/api/productos/1' 
from origin 'https://pasteleria-full-stack-final.vercel.app' has been blocked by CORS policy
```

**Solución:**

1. **Verificar variable Railway**:
   ```bash
   FRONTEND_URL="https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app"
   ```

2. **Verificar SecurityConfig.java** (línea 139):
   ```java
   .setAllowedOriginPatterns(allowedOrigins) // Soporta wildcards
   ```

3. **Reiniciar Railway** si cambias la variable

---

## ✅ CHECKLIST FINAL

### Supabase
- [ ] Ejecutar `SQL_INSERT_VARIANTES_PRODUCTOS.sql` completo
- [ ] Verificar `SELECT COUNT(*) FROM variantes_producto;` retorna **58**
- [ ] Verificar `SELECT * FROM variantes_producto WHERE producto_id = 1;` retorna **7 filas**
- [ ] Verificar foreign keys: `SELECT ... WHERE p.id IS NULL;` retorna **0 filas**

### Backend Railway
- [ ] Variable `SUPABASE_DB_PASSWORD` existe (NO `SPRING_DATASOURCE_PASSWORD`)
- [ ] Endpoint `/api/productos/1` retorna array `variantes` con 7 elementos
- [ ] Logs muestran `HikariPool-1 - Start completed`
- [ ] Logs muestran puerto **5432** (Session Pooler)
- [ ] No hay errores `FATAL: Max client connections reached`

### Frontend Vercel
- [ ] Variable `VITE_API_BASE_URL` apunta a Railway
- [ ] Página producto muestra selector de tamaños
- [ ] 7 opciones disponibles para "Torta Selva Negra"
- [ ] Precio actualiza al cambiar tamaño
- [ ] No hay errores CORS en consola (F12)
- [ ] Console log muestra `Variantes disponibles: 7`

### Health Check
- [ ] Backend: `GET /actuator/health` retorna `{"status":"UP"}`
- [ ] Supabase: `SELECT COUNT(*) FROM pg_stat_activity WHERE datname='postgres'` retorna ≤4
- [ ] Frontend: Productos cargan sin errores

---

## 🎯 RESULTADO FINAL ESPERADO

### Backend Response (GET /api/productos/1):
```json
{
  "id": 1,
  "nombre": "Torta Selva Negra",
  "variantes": [
    {"id": 1, "nombre": "12 Personas", "precio": 42000, "stock": 20, "infoNutricional": "..."},
    {"id": 2, "nombre": "16 Personas", "precio": 56000, "stock": 15, "infoNutricional": "..."},
    {"id": 3, "nombre": "20 Personas", "precio": 70000, "stock": 12, "infoNutricional": "..."},
    {"id": 4, "nombre": "25 Personas", "precio": 87500, "stock": 10, "infoNutricional": "..."},
    {"id": 5, "nombre": "30 Personas", "precio": 105000, "stock": 8, "infoNutricional": "..."},
    {"id": 6, "nombre": "40 Personas", "precio": 119550, "stock": 5, "infoNutricional": "..."},
    {"id": 7, "nombre": "50 Personas", "precio": 134100, "stock": 3, "infoNutricional": "..."}
  ]
}
```

### Frontend Display:
- ✅ Selector "Selecciona un tamaño" visible
- ✅ 7 opciones en dropdown/botones
- ✅ Precio inicial: $42.000 (12 Personas)
- ✅ Al seleccionar "50 Personas" → Precio: $134.100
- ✅ Info nutricional actualiza según tamaño
- ✅ Stock disponible muestra correctamente
- ✅ Botón "Agregar al Carrito" funcional

---

## 🚨 IMPORTANTE

**EL BACKEND ESTÁ 100% CORRECTO**. El problema es únicamente que la tabla `variantes_producto` en Supabase está vacía.

**ACCIÓN CRÍTICA**: Ejecutar `SQL_INSERT_VARIANTES_PRODUCTOS.sql` en Supabase SQL Editor.

**DESPUÉS** de insertar los datos, todo funcionará automáticamente sin cambios de código.

---

## 📞 SOPORTE

Si después de ejecutar el SQL en Supabase siguen sin aparecer las variantes:

1. **Verificar datos**: `SELECT COUNT(*) FROM variantes_producto;` debe retornar 58
2. **Probar endpoint directo**: PowerShell `Invoke-RestMethod` como se mostró arriba
3. **Verificar logs Railway**: Buscar errores en Deployments → Latest → View Logs
4. **Reiniciar Railway**: Backend Service → Restart
5. **Limpiar caché Vercel**: Project Settings → Clear Cache → Redeploy

**99% de probabilidad**: El problema se resuelve ejecutando el SQL en Supabase.
