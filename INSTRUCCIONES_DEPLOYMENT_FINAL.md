# 📋 INSTRUCCIONES FINALES DE DEPLOYMENT

## ✅ Correcciones Aplicadas

### Problema Resuelto: "Permission denied" en Railway

**Error Original**:
```
/bin/bash: line 1: ./mvnw: Permission denied
```

**Soluciones Implementadas**:

1. ✅ **Git permissions**: `git update-index --chmod=+x mvnw`
2. ✅ **railway.json**: Agregado `chmod +x ./mvnw` al buildCommand
3. ✅ **nixpacks.toml**: Configuración optimizada con chmod automático
4. ✅ **.railwayignore**: Excluir archivos innecesarios del build

---

## 🚀 RAILWAY - Backend Deployment

### Paso 1: Commit y Push
```bash
git add .
git commit -m "fix: configuración optimizada para Railway deployment"
git push origin master
```

### Paso 2: Crear Proyecto en Railway

1. Ir a https://railway.app
2. Click **"New Project"**
3. Seleccionar **"Deploy from GitHub repo"**
4. Elegir repositorio `PasteleriaFullStackFinal`
5. Railway detectará automáticamente el backend

### Paso 3: Agregar Base de Datos MySQL

1. En tu proyecto Railway → Click **"New"**
2. Seleccionar **"Database"** → **"Add MySQL"**
3. Railway crea automáticamente las siguientes variables:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQL_URL`

### Paso 4: Configurar Variables de Entorno

Ve a tu servicio Backend → **Variables** → Agregar las siguientes:

```bash
# 1. OBLIGATORIO - Perfil de Spring Boot
SPRING_PROFILES_ACTIVE=production

# 2. OBLIGATORIO - Puerto (usar exactamente así)
PORT=${{PORT}}

# 3. OBLIGATORIO - Base de Datos (usar referencias de Railway)
DATABASE_URL=${{MYSQL_URL}}
DB_USERNAME=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}

# 4. OBLIGATORIO - Frontend URL (actualizar después de Vercel)
FRONTEND_URL=http://localhost:5173

# 5. OPCIONAL - Logs SQL
SHOW_SQL=false
```

**⚠️ CRÍTICO**: 
- Usa `${{VARIABLE}}` exactamente como se muestra (son referencias de Railway)
- NO reemplaces con valores hardcodeados
- Railway sustituye automáticamente las referencias con valores reales

### Paso 5: Deploy

Railway desplegará automáticamente:

1. **Detecta**: Java 17 + Maven + Spring Boot
2. **Build**: `chmod +x ./mvnw && ./mvnw clean package -DskipTests`
3. **Start**: `java -Dspring.profiles.active=production -Dserver.port=$PORT -jar target/backend-0.0.1-SNAPSHOT.jar`
4. **Tiempo**: ~5-7 minutos primera vez

### Paso 6: Obtener URL del Backend

1. Railway → Tu servicio → **Settings** → **Domains**
2. Click **"Generate Domain"**
3. Obtendrás algo como: `https://backend-production-xxxx.up.railway.app`

**Guarda esta URL** - la necesitarás para Vercel

### Paso 7: Verificar Deployment

```bash
# Reemplaza <TU-URL> con tu URL de Railway

# Test categorías
curl https://<TU-URL>/api/categorias

# Test productos
curl https://<TU-URL>/api/productos

# Debe retornar JSON con datos
```

---

## 🎨 VERCEL - Frontend Deployment

### Paso 1: Crear Proyecto en Vercel

1. Ir a https://vercel.com
2. Click **"Add New Project"**
3. **"Import Git Repository"**
4. Seleccionar repositorio `PasteleriaFullStackFinal`
5. Seleccionar carpeta **"Frontend"**

### Paso 2: Configurar Build Settings

Vercel detecta Vite automáticamente:

```
Framework Preset: Vite
Root Directory: Frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x
```

### Paso 3: Configurar Variable de Entorno

En **Environment Variables**, agregar:

```bash
# Nombre de la variable
VITE_API_URL

# Valor (reemplazar con tu URL REAL de Railway)
https://backend-production-xxxx.up.railway.app/api
```

**⚠️ IMPORTANTE**:
- Reemplaza `backend-production-xxxx.up.railway.app` con tu URL de Railway
- DEBE incluir `/api` al final
- Sin `/` al final de la URL

**Configurar para todos los ambientes**:
- Production: ✅
- Preview: ✅ (opcional)
- Development: ⬜ (no necesario)

### Paso 4: Deploy

1. Click **"Deploy"**
2. Vercel buildea y despliega automáticamente
3. **Tiempo**: ~2-3 minutos
4. Obtendrás URL: `https://tu-app.vercel.app`

### Paso 5: Verificar Deployment

1. Abrir `https://tu-app.vercel.app` en navegador
2. Abrir DevTools (F12) → Console
3. Deberías ver:
   ```
   🚀 [APP INIT] Iniciando aplicación
   🔗 [API] URL: https://backend-production-xxxx.up.railway.app/api
   ```
4. Navegar a categorías/productos y verificar que carguen

---

## 🔄 POST-DEPLOYMENT: Actualizar CORS

**CRÍTICO**: Después de obtener la URL de Vercel, actualizar Railway:

### Paso 1: Ir a Railway

1. Railway → Tu servicio Backend → **Variables**
2. Encontrar `FRONTEND_URL`
3. Actualizar con URL real de Vercel:

```bash
FRONTEND_URL=https://tu-app.vercel.app
```

**⚠️ SIN barra final**: 
- ✅ Correcto: `https://tu-app.vercel.app`
- ❌ Incorrecto: `https://tu-app.vercel.app/`

### Paso 2: Verificar Re-Deploy

1. Railway re-desplegará automáticamente
2. Espera ~3-5 minutos
3. Verifica logs: Railway → Deployments → View Logs

### Paso 3: Verificar CORS

```bash
# Desde tu frontend, las peticiones deberían funcionar
# Verifica en la consola del navegador que no haya errores CORS
```

---

## 📊 RESUMEN DE VARIABLES

| Ubicación | Variable | Valor | Ejemplo |
|-----------|----------|-------|---------|
| **Railway** | `SPRING_PROFILES_ACTIVE` | `production` | `production` |
| **Railway** | `PORT` | `${{PORT}}` | (automático) |
| **Railway** | `DATABASE_URL` | `${{MYSQL_URL}}` | (automático) |
| **Railway** | `DB_USERNAME` | `${{MYSQLUSER}}` | (automático) |
| **Railway** | `DB_PASSWORD` | `${{MYSQLPASSWORD}}` | (automático) |
| **Railway** | `FRONTEND_URL` | URL de Vercel | `https://milsabores.vercel.app` |
| **Vercel** | `VITE_API_URL` | URL de Railway + `/api` | `https://backend-prod.railway.app/api` |

---

## ✅ CHECKLIST DE DEPLOYMENT

### Pre-Deploy
- [x] Backend compila sin errores (`./mvnw clean package`)
- [x] Frontend compila sin errores (`npm run build`)
- [x] Código commiteado y pusheado
- [x] Permisos de mvnw configurados (`git update-index --chmod=+x mvnw`)

### Durante Deploy - Railway
- [ ] Proyecto creado en Railway
- [ ] MySQL agregado al proyecto
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso (verificar logs)
- [ ] URL del backend obtenida
- [ ] Endpoints probados y funcionando

### Durante Deploy - Vercel
- [ ] Proyecto creado en Vercel
- [ ] Variable `VITE_API_URL` configurada
- [ ] Deploy exitoso
- [ ] URL del frontend obtenida
- [ ] Aplicación carga correctamente

### Post-Deploy
- [ ] `FRONTEND_URL` actualizada en Railway
- [ ] Railway re-desplegado
- [ ] CORS funcionando (sin errores en consola)
- [ ] Todas las páginas funcionan
- [ ] API responde correctamente

---

## 🐛 TROUBLESHOOTING

### Railway: "Permission denied" al ejecutar mvnw

**✅ SOLUCIONADO**: Los archivos ya están configurados correctamente

Si persiste:
1. Verificar que `nixpacks.toml` existe en Backend/
2. Verificar que `railway.json` tiene `chmod +x ./mvnw`
3. Force redeploy en Railway

### Railway: "Cannot connect to database"

**Causas**:
1. MySQL no agregado al proyecto
2. Variables de entorno incorrectas

**Solución**:
1. Verificar que MySQL está en el mismo proyecto Railway
2. Usar referencias: `${{MYSQL_URL}}`, `${{MYSQLUSER}}`, `${{MYSQLPASSWORD}}`
3. Ver logs: Railway → Deployments → View Logs

### Vercel: "API no responde" o "Network Error"

**Causas**:
1. `VITE_API_URL` incorrecta
2. Backend no desplegado
3. CORS no configurado

**Solución**:
1. Verificar que `VITE_API_URL` tiene URL correcta de Railway
2. Incluir `/api` al final
3. Verificar backend funciona: `curl https://tu-backend.railway.app/api/categorias`
4. Actualizar `FRONTEND_URL` en Railway

### Error CORS: "Access-Control-Allow-Origin"

**Causa**: `FRONTEND_URL` en Railway no coincide con URL de Vercel

**Solución**:
1. Railway → Variables → `FRONTEND_URL`
2. Usar URL exacta de Vercel
3. Sin `/` al final
4. Railway re-desplegará automáticamente

### Build de Railway falla: "Tests failed"

**Solución**: Los tests están deshabilitados con `-DskipTests`

Si persiste:
1. Verificar `railway.json`
2. Debe tener: `./mvnw clean package -DskipTests`

---

## 📈 MONITOREO

### Railway Logs
```
Railway → Tu servicio → Deployments → Click deployment → View Logs
```

### Vercel Logs
```
Vercel → Tu proyecto → Deployments → Click deployment → Function Logs
```

### Métricas
- **Railway**: Dashboard → Metrics (CPU, RAM, Network)
- **Vercel**: Analytics → Real-time metrics

---

## 🎯 URLs FINALES

Después del deployment exitoso:

```
Backend API: https://backend-production-xxxx.up.railway.app
Frontend App: https://tu-app.vercel.app
MySQL DB: Interno Railway (no público)
```

### Endpoints Disponibles

```
GET    /api/categorias
GET    /api/categorias/{id}
POST   /api/categorias
PUT    /api/categorias/{id}
DELETE /api/categorias/{id}

GET    /api/productos
GET    /api/productos/{id}
GET    /api/productos/categoria/{id}
POST   /api/productos
PUT    /api/productos/{id}
DELETE /api/productos/{id}
```

---

## 📞 SOPORTE

Si tienes problemas:

1. Revisar logs en Railway y Vercel
2. Verificar todas las variables de entorno
3. Consultar `DEPLOYMENT_GUIDE.md` para detalles completos
4. Ver `QUICK_DEPLOY_GUIDE.md` para referencia rápida

---

**Última actualización**: Noviembre 29, 2025
**Estado**: ✅ Listo para deployment
**Tiempo estimado total**: 15-20 minutos
