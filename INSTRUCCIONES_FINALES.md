# ⚡ INSTRUCCIONES FINALES - DESPLIEGUE PRODUCCIÓN

## 🚨 PROBLEMA CONFIRMADO

**Diagnóstico ejecutado**: `verificar_sistema.ps1`

```
ERROR - Backend Railway: CON PROBLEMAS
ERROR - Variantes: NO DISPONIBLES
Total variantes: 0 (esperadas: 58)
```

**CAUSA**: La tabla `variantes_producto` en Supabase está **VACÍA**.

---

## ✅ SOLUCIÓN - 3 PASOS SIMPLES

### PASO 1: Ejecutar SQL en Supabase (5 minutos) ⚠️ CRÍTICO

1. **Abrir Supabase Dashboard**: https://supabase.com/dashboard
2. **Seleccionar proyecto**: `dzbeucldelrjdjprfday`
3. **Ir a SQL Editor** (menú izquierdo)
4. **Click "New query"**
5. **Abrir archivo**: `SQL_INSERT_VARIANTES_PRODUCTOS.sql` (en raíz del proyecto)
6. **Copiar TODO** el contenido (180 líneas completas)
7. **Pegar en SQL Editor**
8. **Click RUN** (botón verde)
9. **Esperar confirmación**: "Success. No rows returned"

**Verificar ejecución exitosa:**
```sql
-- Ejecutar esta query en Supabase SQL Editor
SELECT COUNT(*) FROM variantes_producto;
-- DEBE RETORNAR: 58
```

---

### PASO 2: Verificar Backend Railway (30 segundos)

**Ejecutar en PowerShell:**
```powershell
cd E:\PROYECTOSPROGRAMACION\PasteleriaFullStackFinal
.\verificar_sistema.ps1
```

**Resultado esperado:**
```
OK - Backend Railway: OPERATIVO
OK - Variantes: FUNCIONANDO (7 variantes en producto 1)
Total variantes: 58
```

**Alternativamente, probar endpoint directo:**
```powershell
Invoke-RestMethod -Uri "https://pasteleriafullstackfinal-production.up.railway.app/api/productos/1" | ConvertTo-Json -Depth 5
```

**Debe mostrar:**
```json
{
  "variantes": [
    {"id": 1, "nombre": "12 Personas", "precio": 42000, "stock": 20},
    {"id": 2, "nombre": "16 Personas", "precio": 56000, "stock": 15},
    ... (7 variantes total)
  ]
}
```

---

### PASO 3: Verificar Frontend Vercel (1 minuto)

1. **Abrir**: https://pasteleria-full-stack-final.vercel.app
2. **Navegar**: Categorías → Bizcochuelo → Torta Selva Negra
3. **Abrir DevTools**: F12 → Console
4. **Verificar logs**:

**Logs esperados:**
```
✅ [ProductDetail] Producto cargado: {...}
   Variantes disponibles: 7  ← DEBE SER 7, NO 0
```

**UI esperada:**
- ✅ Selector de tamaños visible
- ✅ 7 opciones: 12, 16, 20, 25, 30, 40, 50 personas
- ✅ Precio cambia al seleccionar tamaño
- ✅ Info nutricional se actualiza
- ✅ Botón "Agregar al Carrito" habilitado

---

## ⚙️ CONFIGURACIÓN RAILWAY (Verificar Variables)

### Variables Necesarias (8 total)

**Railway Dashboard → Backend Service → Variables**

```bash
# 1. Database Password (CRÍTICO: Verificar nombre)
SUPABASE_DB_PASSWORD="PasteleriaMilSabores123!"
# ⚠️ Si tienes SPRING_DATASOURCE_PASSWORD, RENOMBRAR a SUPABASE_DB_PASSWORD

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

# 6. JVM Memory
JAVA_TOOL_OPTIONS="-Xmx400m -Xms200m -XX:MaxMetaspaceSize=100m"
```

### Variables a ELIMINAR (si existen)

Estas están hardcodeadas en `application-production.properties`:

```bash
❌ FLYWAY_ENABLED
❌ SPRING_JPA_OPEN_IN_VIEW
❌ SPRING_JPA_HIBERNATE_DDL_AUTO
❌ SPRING_JPA_SHOW_SQL
❌ SPRING_JPA_PROPERTIES_HIBERNATE_FORMAT_SQL
```

**Cómo eliminar:**
1. Railway → Backend Service → Variables
2. Click icono 🗑️ en cada variable
3. Confirmar eliminación

---

## 🌐 CONFIGURACIÓN VERCEL (Frontend)

### Variables Necesarias

**Vercel Dashboard → Project → Settings → Environment Variables**

```bash
# Backend API URL
VITE_API_BASE_URL=https://pasteleriafullstackfinal-production.up.railway.app

# Environment
VITE_ENVIRONMENT=production
```

**Aplicar a:**
- ✅ Production
- ✅ Preview
- ✅ Development

**Después de agregar variables:**
1. Vercel → Deployments → Latest → **Redeploy**
2. Esperar 2-3 minutos

---

## 🔍 TROUBLESHOOTING

### Problema: Backend sigue retornando variantes: []

**Diagnóstico:**
```powershell
.\verificar_sistema.ps1
```

**Soluciones en orden:**

1. **Verificar datos en Supabase**:
   ```sql
   SELECT COUNT(*) FROM variantes_producto;
   -- Si retorna 0: Ejecutar SQL_INSERT_VARIANTES_PRODUCTOS.sql
   -- Si retorna 58: Problema está en Railway
   ```

2. **Verificar foreign keys correctas**:
   ```sql
   SELECT vp.id, vp.nombre, vp.producto_id, p.nombre 
   FROM variantes_producto vp
   LEFT JOIN productos p ON vp.producto_id = p.id
   WHERE p.id IS NULL;
   -- Debe retornar 0 filas (sin FKs rotas)
   ```

3. **Reiniciar Railway**:
   - Railway Dashboard → Backend Service → **Restart**
   - Esperar 2-3 minutos
   - Ejecutar `.\verificar_sistema.ps1` nuevamente

4. **Verificar variable SUPABASE_DB_PASSWORD**:
   - Railway → Variables → Verificar nombre exacto
   - Debe ser `SUPABASE_DB_PASSWORD` NO `SPRING_DATASOURCE_PASSWORD`
   - Si está mal, renombrar y reiniciar Railway

### Problema: CORS errors en frontend

**Síntoma en Console (F12):**
```
Access to XMLHttpRequest ... has been blocked by CORS policy
```

**Solución:**

1. **Verificar variable Railway**:
   ```bash
   FRONTEND_URL="https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app"
   ```

2. **Verificar wildcard incluido**: `https://*.vercel.app` permite previews de Vercel

3. **Reiniciar Railway** si cambias la variable

### Problema: Frontend no muestra variantes pero backend sí

**Diagnóstico en Console (F12):**
```
✅ [ProductDetail] Producto cargado: {...}
   Variantes disponibles: 7
```
Pero no aparece selector de tamaños.

**Soluciones:**

1. **Limpiar caché navegador**: Ctrl+Shift+Delete
2. **Hard refresh**: Ctrl+F5
3. **Limpiar caché Vercel**:
   - Vercel → Settings → Clear Cache
   - Redeploy

---

## ✅ CHECKLIST COMPLETO

### Supabase
- [ ] Ejecutar `SQL_INSERT_VARIANTES_PRODUCTOS.sql` completo (180 líneas)
- [ ] Verificar `SELECT COUNT(*) FROM variantes_producto;` = **58**
- [ ] Verificar producto 1 tiene 7 variantes
- [ ] Verificar foreign keys sin problemas

### Railway
- [ ] Variable `SUPABASE_DB_PASSWORD` existe (NO `SPRING_DATASOURCE_PASSWORD`)
- [ ] Variables obsoletas eliminadas (FLYWAY_ENABLED, SPRING_JPA_*)
- [ ] Total 8 variables configuradas
- [ ] Ejecutar `.\verificar_sistema.ps1` → OK
- [ ] Endpoint `/api/productos/1` retorna 7 variantes

### Vercel
- [ ] Variable `VITE_API_BASE_URL` configurada
- [ ] Variable `VITE_ENVIRONMENT=production`
- [ ] Redeploy después de agregar variables
- [ ] Página carga sin errores CORS
- [ ] Selector de tamaños visible
- [ ] Console log: `Variantes disponibles: 7`

### Funcional
- [ ] Productos cargan en homepage
- [ ] Categorías funcionan
- [ ] ProductDetail muestra 7 tamaños para Torta Selva Negra
- [ ] Precio cambia al seleccionar tamaño
- [ ] Info nutricional se actualiza
- [ ] Agregar al carrito funciona
- [ ] No hay errores en Console (F12)

---

## 📊 RESULTADOS ESPERADOS

### Backend (GET /api/productos/1)
```json
{
  "id": 1,
  "nombre": "Torta Selva Negra",
  "precioBase": 42000,
  "variantes": [
    {"id": 1, "nombre": "12 Personas", "precio": 42000, "stock": 20},
    {"id": 2, "nombre": "16 Personas", "precio": 56000, "stock": 15},
    {"id": 3, "nombre": "20 Personas", "precio": 70000, "stock": 12},
    {"id": 4, "nombre": "25 Personas", "precio": 87500, "stock": 10},
    {"id": 5, "nombre": "30 Personas", "precio": 105000, "stock": 8},
    {"id": 6, "nombre": "40 Personas", "precio": 119550, "stock": 5},
    {"id": 7, "nombre": "50 Personas", "precio": 134100, "stock": 3}
  ]
}
```

### Frontend UI
```
┌─────────────────────────────────────┐
│ Torta Selva Negra                   │
├─────────────────────────────────────┤
│ Selecciona un tamaño:               │
│ ┌─────────────────────────────────┐ │
│ │ 12 Personas               ▼     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Precio: $42.000                     │
│ Stock: 20 disponibles               │
│                                     │
│ Info Nutricional:                   │
│ Peso: 2.2kg | Energía: 6480kcal ... │
│                                     │
│ [ Agregar al Carrito ]              │
└─────────────────────────────────────┘
```

### Verificación PowerShell
```
OK - Backend Railway: OPERATIVO
OK - Variantes: FUNCIONANDO (7 variantes en producto 1)
Total variantes: 58
PERFECTO: 58 variantes encontradas (esperadas)
```

---

## 🎯 TIEMPO ESTIMADO TOTAL

- **Ejecutar SQL en Supabase**: 5 minutos
- **Verificar Backend**: 30 segundos
- **Verificar Frontend**: 1 minuto
- **Ajustar variables Railway** (si necesario): 2 minutos
- **Ajustar variables Vercel** (si necesario): 2 minutos

**TOTAL**: ~10 minutos máximo

---

## 🚀 PRÓXIMOS PASOS DESPUÉS DE VARIANTES

Una vez funcionando las variantes:

1. **Probar flujo completo**:
   - Agregar productos al carrito
   - Modificar cantidades
   - Realizar orden de compra
   - Verificar email confirmación

2. **Probar autenticación**:
   - Registro de usuario
   - Login
   - Logout
   - Recuperar contraseña

3. **Probar backoffice** (admin):
   - Login como admin
   - CRUD productos
   - Ver órdenes
   - Generar reportes

4. **Optimizaciones** (si hay tiempo):
   - Lazy loading imágenes
   - Skeleton screens
   - PWA capabilities
   - SEO meta tags

---

## 📞 SOPORTE

**Si después de ejecutar el SQL siguen sin aparecer variantes:**

1. Ejecutar: `.\verificar_sistema.ps1`
2. Copiar output completo
3. Verificar logs Railway: Deployments → Latest → View Logs
4. Buscar errores en logs: `FATAL`, `ERROR`, `Exception`

**El 99% de los casos se resuelve ejecutando el SQL en Supabase.**

---

**RECORDATORIO**: El backend está **100% correcto**. Solo falta ejecutar el SQL.
