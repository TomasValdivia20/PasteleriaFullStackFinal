# 🚀 INSTRUCCIONES FINALES - RAILWAY + VERCEL + SUPABASE

## ✅ RESUMEN DE CAMBIOS APLICADOS

### **BACKEND (Commits: 1ac3a14 → a7a075c)**

1. ✅ **Migración MySQL → PostgreSQL (Supabase)**
   - Dependencias: PostgreSQL driver + Flyway
   - Scripts SQL: V1__create_initial_schema.sql (7 tablas)
   - Configuración: Transaction Pooler (puerto 6543)

2. ✅ **Logging CORS detallado**
   - CorsConfig.java: @PostConstruct muestra configuración al iniciar
   - CategoriaController.java: Logs de cada request (Origin, Method, Headers)

3. ✅ **RLS deshabilitado por defecto**
   - V2__enable_rls_MANUAL.sql → renombrado a `.disabled`
   - Solo ejecutar manualmente si conectas frontend directo a Supabase

4. ✅ **Builds exitosos**
   - Backend: 8.2s
   - Frontend: 2.5s

---

## 🔧 CONFIGURACIÓN RAILWAY (CRÍTICO)

### **PASO 1: Variables de Entorno**

Ir a: **Railway Dashboard → Tu Proyecto → Variables**

```properties
# 1. BASE DE DATOS SUPABASE
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:6543/postgres
SPRING_DATASOURCE_USERNAME=postgres.dzbeucldelrjdjprfday
SPRING_DATASOURCE_PASSWORD=TU_PASSWORD_SUPABASE

# 2. PERFIL
SPRING_PROFILES_ACTIVE=production

# 3. CORS - FRONTEND (INCLUYE WILDCARD PARA PREVIEWS)
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app

# 4. FLYWAY (opcional - ya habilitado por defecto)
SPRING_FLYWAY_ENABLED=true
```

### **PASO 2: Obtener Password de Supabase**

1. Ir a: **Supabase Dashboard** → Settings → Database
2. Sección: **Connection String**
3. Método: **Transaction pooler**
4. Copiar password de la URL:
   ```
   postgresql://postgres.dzbeucldelrjdjprfday:[TU-PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
   ```

---

## 🌐 CONFIGURACIÓN VERCEL

### **Variable de Entorno**

Ir a: **Vercel Dashboard → Settings → Environment Variables**

```properties
VITE_API_URL=https://pasteleriafullstackfinal-production.up.railway.app/api
```

⚠️ **IMPORTANTE:** Debe terminar en `/api` (NO olvidar)

### **Redeploy**

Después de cambiar variables: **Deployments → Redeploy**

---

## 🧪 VERIFICACIÓN DE DEPLOYMENT

### **PASO 1: Railway - Ver Logs de CORS**

Al hacer deploy, buscar en logs:

```
========================================
🔧 [CORS CONFIG] Inicializando configuración CORS
📋 [CORS CONFIG] Orígenes permitidos (raw): https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app
   ✅ Permitido: https://pasteleria-full-stack-final.vercel.app
   ✅ Permitido: https://*.vercel.app
🔐 [CORS CONFIG] Métodos permitidos: GET, POST, PUT, DELETE, OPTIONS, PATCH
🍪 [CORS CONFIG] Credenciales: HABILITADAS
⏱️  [CORS CONFIG] MaxAge preflight: 3600s (1 hora)
🎯 [CORS CONFIG] Aplicado a: /api/**
========================================
```

### **PASO 2: Railway - Ver Logs de Flyway**

```
INFO  org.flywaydb.core.FlywayExecutor : Database: jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:6543/postgres (PostgreSQL 17.6)
INFO  o.f.core.internal.command.DbValidate : Successfully validated 1 migration
INFO  o.f.core.internal.command.DbMigrate : Current version of schema "public": 1
INFO  com.milsabores.backend.BackendApplication : Started BackendApplication in XX.XXX seconds
```

⚠️ **NOTA:** Si ves "Successfully applied 2 migrations", significa que V2 (RLS) se ejecutó. Ver sección "Deshabilitar RLS" más abajo.

### **PASO 3: Railway - Ver Logs de Requests**

Cuando frontend haga una petición:

```
📥 [REQUEST] GET /api/categorias
   Origin: https://pasteleria-full-stack-final-b0a11gg1t-tomasvaldivia20s-projects.vercel.app
   User-Agent: Mozilla/5.0...
   Method: GET
📤 [RESPONSE] 3 categorías encontradas
```

✅ **ÉXITO:** Si ves el Origin en logs, CORS está funcionando  
❌ **FALLO:** Si NO ves el Origin, request bloqueado antes de llegar al backend

### **PASO 4: Supabase - Verificar Tablas**

Ir a: **Supabase Dashboard → Table Editor**

Verificar que existen:
- ✅ `roles` (3 registros: CLIENTE, ADMIN, EMPLEADO)
- ✅ `usuarios`
- ✅ `categorias`
- ✅ `productos`
- ✅ `variantes_producto`
- ✅ `ordenes`
- ✅ `detalles_orden`
- ✅ `flyway_schema_history` (1 registro)

### **PASO 5: Frontend - Console Logs**

Abrir: **https://pasteleria-full-stack-final.vercel.app**  
Presionar: **F12 → Console**

Buscar:
```
🔧 [API CONFIG] Inicializando cliente API con baseURL: https://pasteleriafullstackfinal-production.up.railway.app/api
✅ [API CONFIG] Cliente API configurado correctamente
📤 [REQUEST] 2025-11-30T...
   Method: GET
   URL: https://pasteleriafullstackfinal-production.up.railway.app/api/categorias
📥 [RESPONSE SUCCESS]
   Data Type: Array
   Data Length: 3 items
✅ [Categorias] 3 categorías cargadas
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "No 'Access-Control-Allow-Origin' header is present"

**CAUSA:** Variable `FRONTEND_URL` en Railway no incluye la URL del preview deployment.

**SOLUCIÓN RÁPIDA (Opción A - Recomendada):**
```properties
FRONTEND_URL=https://*.vercel.app
```
Esto permite TODOS los dominios de Vercel (producción + previews).

**SOLUCIÓN ESPECÍFICA (Opción B):**
```properties
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://pasteleria-full-stack-final-b0a11gg1t-tomasvaldivia20s-projects.vercel.app,https://*.vercel.app
```

**VERIFICAR:**
1. Railway → Variables → Editar `FRONTEND_URL`
2. Guardar cambios
3. Wait for automatic redeploy (2-3 minutos)
4. Ver logs: Buscar "🔧 [CORS CONFIG]" para confirmar nuevas URLs

---

### ❌ Error: RLS bloqueando queries (si V2 se ejecutó)

**SÍNTOMA:** Logs de Railway muestran "Successfully applied 2 migrations" en vez de 1.

**CAUSA:** Flyway ejecutó V2__enable_rls_MANUAL.sql que activa Row Level Security.

**SOLUCIÓN:**

1. Ir a: **Supabase Dashboard → SQL Editor**
2. Ejecutar este script:
   ```sql
   -- Deshabilitar RLS en todas las tablas
   ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
   ALTER TABLE ordenes DISABLE ROW LEVEL SECURITY;
   ALTER TABLE detalles_orden DISABLE ROW LEVEL SECURITY;
   
   -- Borrar políticas RLS
   DROP POLICY IF EXISTS "usuarios_select_own" ON usuarios;
   DROP POLICY IF EXISTS "usuarios_update_own" ON usuarios;
   DROP POLICY IF EXISTS "usuarios_select_admin" ON usuarios;
   DROP POLICY IF EXISTS "usuarios_insert_public" ON usuarios;
   DROP POLICY IF EXISTS "ordenes_select_own" ON ordenes;
   DROP POLICY IF EXISTS "ordenes_insert_own" ON ordenes;
   DROP POLICY IF EXISTS "ordenes_select_staff" ON ordenes;
   DROP POLICY IF EXISTS "ordenes_update_staff" ON ordenes;
   DROP POLICY IF EXISTS "detalles_select_own" ON detalles_orden;
   DROP POLICY IF EXISTS "detalles_insert_own" ON detalles_orden;
   DROP POLICY IF EXISTS "detalles_select_staff" ON detalles_orden;
   ```

3. Verificar en Railway logs que queries funcionen sin errores de permisos.

**NOTA:** RLS solo es necesario si conectas frontend directamente a Supabase (sin pasar por Backend). En tu arquitectura actual (Backend REST API), NO necesitas RLS.

---

### ❌ Error: "Connection refused"

**CAUSA:** Variables de entorno mal configuradas.

**SOLUCIÓN:**
1. Verificar `SPRING_DATASOURCE_URL` usa puerto **6543** (Transaction Pooler)
2. Verificar `SPRING_DATASOURCE_USERNAME` = `postgres.dzbeucldelrjdjprfday`
3. Verificar `SPRING_DATASOURCE_PASSWORD` correcto (resetear en Supabase si es necesario)

---

### ❌ Error: Frontend muestra "[]" (array vacío) pero no hay errores

**CAUSA:** Base de datos NO tiene datos iniciales cargados.

**SOLUCIÓN:**

**Opción A - DataInitializer (si existe):**
Verificar que `DataInitializer.java` esté ejecutándose al iniciar.

**Opción B - Inserción manual:**
Ir a **Supabase Dashboard → SQL Editor** y ejecutar:

```sql
-- Insertar categorías de prueba
INSERT INTO categorias (nombre, descripcion, imagen) VALUES
('Pasteles', 'Deliciosos pasteles artesanales', 'pasteles.jpg'),
('Tortas', 'Tortas para toda ocasión', 'tortas.jpg'),
('Galletas', 'Galletas caseras recién horneadas', 'galletas.jpg');

-- Insertar productos de prueba
INSERT INTO productos (nombre, descripcion, imagen, precio_base, categoria_id) VALUES
('Pastel de Chocolate', 'Pastel de chocolate con crema', 'pastel-chocolate.jpg', 15000, 1),
('Torta de Cumpleaños', 'Torta personalizada', 'torta-cumpleanos.jpg', 25000, 2),
('Galletas de Avena', 'Pack de 12 galletas', 'galletas-avena.jpg', 5000, 3);
```

---

## 📋 CHECKLIST FINAL

### **Railway**
- [ ] Variables de entorno configuradas:
  - [ ] `SPRING_DATASOURCE_URL` (puerto 6543)
  - [ ] `SPRING_DATASOURCE_USERNAME`
  - [ ] `SPRING_DATASOURCE_PASSWORD`
  - [ ] `SPRING_PROFILES_ACTIVE=production`
  - [ ] `FRONTEND_URL` (con wildcard `*.vercel.app`)
- [ ] Deploy exitoso
- [ ] Logs muestran "🔧 [CORS CONFIG]" con URLs correctas
- [ ] Logs muestran "Successfully validated 1 migration" (NO 2)
- [ ] API responde: `https://pasteleriafullstackfinal-production.up.railway.app/api/categorias`

### **Supabase**
- [ ] 7 tablas creadas
- [ ] `roles` tiene 3 registros
- [ ] RLS deshabilitado (o ejecutado script de deshabilitación)
- [ ] Conexión exitosa desde Railway (ver logs)

### **Vercel**
- [ ] Variable `VITE_API_URL` correcta (termina en `/api`)
- [ ] Redeploy ejecutado
- [ ] Console muestra "✅ [API CONFIG] Cliente API configurado"
- [ ] NO muestra "No 'Access-Control-Allow-Origin' header"
- [ ] Categorías cargan correctamente

---

## 🎯 PRÓXIMOS PASOS

Una vez que TODO funcione:

1. **Poblar base de datos** con datos reales (categorías, productos)
2. **Probar CRUD completo** (crear, editar, eliminar)
3. **Configurar backoffice/admin** (si lo tienes)
4. **Test end-to-end** del flujo de compra
5. **Optimización** de queries y caching

---

## 📖 DOCUMENTACIÓN ADICIONAL

- **CONFIGURACION_RAILWAY_SUPABASE.md**: Guía completa de migración MySQL → PostgreSQL
- **SOLUCION_ERROR_URL_MALFORMADA.md**: Troubleshooting VITE_API_URL
- **PASO_1_CONFIGURACION_HTTPS.md**: Configuración HTTPS original

---

## 🆘 SI NECESITAS AYUDA

**Ver logs detallados:**
```bash
# Railway CLI (si lo tienes instalado)
railway logs

# O en Railway Dashboard:
https://railway.app → Tu Proyecto → Deployments → View Logs
```

**Buscar en logs:**
- `🔧 [CORS CONFIG]` → Configuración CORS
- `📥 [REQUEST]` → Requests recibidos
- `org.flywaydb` → Migraciones de base de datos
- `HikariPool` → Conexión a PostgreSQL

---

**Última actualización:** 2025-11-30  
**Commit:** a7a075c (fix: Resolver error CORS + logging detallado)  
**Status:** ✅ Backend y Frontend compilando correctamente
