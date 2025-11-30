# 🔒 PASO 1: Configurar HTTPS en Backend (CRÍTICO)

## 🚨 PROBLEMA ACTUAL

**Error en Vercel**:
```
Mixed Content: The page at 'https://pasteleria-full-stack-final.vercel.app/productos' 
was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint 
'http://3.235.30.235:8080/api/categorias'. This request has been blocked
```

**¿Por qué falla?**

```
┌──────────────────────────────────────────────┐
│  VERCEL (Frontend)                           │
│  🔒 HTTPS (Seguro)                           │
│  https://pasteleria-full-stack-final.vercel.app
└───────────────┬──────────────────────────────┘
                │
                │ ❌ BLOQUEADO POR NAVEGADOR
                │ (Mixed Content Security)
                ▼
┌──────────────────────────────────────────────┐
│  BACKEND                                     │
│  🔓 HTTP (Inseguro)                          │
│  http://3.235.30.235:8080/api                │
└──────────────────────────────────────────────┘
```

**Regla de Seguridad Web**: 
- Páginas HTTPS **NO PUEDEN** hacer peticiones a endpoints HTTP
- Navegadores modernos BLOQUEAN esto automáticamente
- Es una protección contra ataques Man-in-the-Middle

---

## ✅ SOLUCIÓN: Backend DEBE usar HTTPS

Tienes **3 opciones**:

### OPCIÓN 1: Railway (RECOMENDADO) ⭐

**Ventajas**:
- ✅ **HTTPS automático** (Railway provee certificado SSL gratis)
- ✅ MySQL integrado
- ✅ Deploy automático desde Git
- ✅ Logs en tiempo real
- ✅ URL estable: `https://backend-production-xxxx.up.railway.app`

**Proceso**:
1. Ve a [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Select `Backend` folder
4. Railway automáticamente:
   - Detecta Spring Boot
   - Genera URL HTTPS
   - Provee variables de entorno

**Variables a configurar** (ver más abajo):
```bash
SPRING_PROFILES_ACTIVE=production
PORT=$PORT
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app
```

---

### OPCIÓN 2: AWS EC2 con HTTPS

**Requiere configuración manual**:
1. Comprar/configurar dominio (ej: `api.tudominio.com`)
2. Configurar certificado SSL (Let's Encrypt o AWS Certificate Manager)
3. Configurar NGINX como reverse proxy
4. Configurar Security Groups para puerto 443

**Comandos AWS EC2**:
```bash
# Instalar Certbot (Let's Encrypt)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d api.tudominio.com

# Configurar NGINX
sudo nano /etc/nginx/sites-available/default
```

**Configuración NGINX**:
```nginx
server {
    listen 443 ssl;
    server_name api.tudominio.com;
    
    ssl_certificate /etc/letsencrypt/live/api.tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.tudominio.com/privkey.pem;
    
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Security Groups (AWS)**:
- Puerto 443 (HTTPS) abierto
- Puerto 80 (HTTP) redirigir a 443

---

### OPCIÓN 3: Cloudflare Tunnel (Alternativa)

**Si quieres mantener AWS EC2 sin dominio propio**:
1. Crear cuenta en Cloudflare
2. Instalar `cloudflared` en EC2
3. Crear tunnel: `cloudflared tunnel create pasteleria-backend`
4. Cloudflare provee URL HTTPS automática

---

## 📋 PASO A PASO - RAILWAY (OPCIÓN RECOMENDADA)

### 1️⃣ Crear Proyecto Railway

**a) Ir a Railway**:
```
https://railway.app → New Project → Deploy from GitHub repo
```

**b) Seleccionar Repositorio**:
- Repo: `PasteleriaFullStackFinal`
- Root Directory: `Backend`
- Branch: `master`

**c) Railway detecta automáticamente**:
```
✓ Detectado: Maven project (pom.xml)
✓ Build Command: ./mvnw clean package -DskipTests
✓ Start Command: java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### 2️⃣ Agregar MySQL Database

**a) En el proyecto Railway**:
```
New → Database → Add MySQL
```

**b) Railway genera automáticamente** (NO crear manualmente):
```bash
MYSQLHOST=mysql.railway.internal
MYSQLPORT=3306
MYSQLDATABASE=railway
MYSQLUSER=root
MYSQLPASSWORD=xxxxxxxxxx
MYSQL_URL=mysql://root:xxxxxxxxxx@mysql.railway.internal:3306/railway
```

**⚠️ IMPORTANTE**: Spring Boot en `application.properties` ya está configurado para leer estas variables.

### 3️⃣ Configurar Variables de Entorno

**a) Ve a Backend Service → Variables**

**b) Agregar estas 3 variables** (copiar exactamente):

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `SPRING_PROFILES_ACTIVE` | `production` | Activa perfil de producción |
| `PORT` | `$PORT` | Puerto dinámico de Railway |
| `FRONTEND_URL` | `https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app` | CORS para Vercel |

**c) Variables que Railway provee automáticamente** (NO crear):
- ❌ `MYSQL_URL`
- ❌ `MYSQLUSER`
- ❌ `MYSQLPASSWORD`
- ❌ `DATABASE_URL`

### 4️⃣ Deploy Backend

**a) Railway despliega automáticamente**:
```
[1/4] Building...
[2/4] Pushing image...
[3/4] Deploying...
[4/4] Success!
```

**b) Ver logs en tiempo real**:
```
Railway → Backend Service → Deployments → Click último deploy → View Logs
```

**c) Logs exitosos deberían mostrar**:
```
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
Hibernate: create table...
Started BackendApplication in 12.345 seconds
Tomcat started on port 8080
```

**d) Si hay errores MySQL**:
```
Connection refused
```
→ Verifica que MySQL Service esté "Running"  
→ Verifica que Backend y MySQL estén en el MISMO proyecto

### 5️⃣ Obtener URL HTTPS del Backend

**a) Railway → Backend Service → Settings → Networking**

**b) Click "Generate Domain"**

**c) Railway genera**:
```
https://backend-production-a1b2.up.railway.app
```

**⚠️ NOTA**: Es **HTTPS automáticamente** - NO HTTP

### 6️⃣ Verificar Backend Funciona

**Test desde terminal**:
```bash
curl https://backend-production-a1b2.up.railway.app/api/categorias
```

**Respuesta esperada**:
```json
[]
```
O lista de categorías si ya hay datos.

**Si da error 404**:
- ✅ URL correcta: `https://tu-backend.railway.app/api/categorias`
- ❌ URL incorrecta: `https://tu-backend.railway.app/categorias` (falta `/api`)

---

## 🎨 CONFIGURAR VERCEL (PASO 2)

Una vez que Railway esté corriendo con **HTTPS**:

### 1️⃣ Ir a Vercel Dashboard

```
https://vercel.com → Tu Proyecto → Settings → Environment Variables
```

### 2️⃣ Configurar VITE_API_URL

**CRÍTICO: Debe ser la URL HTTPS de Railway**

| Variable | Valor | Environments |
|----------|-------|--------------|
| `VITE_API_URL` | `https://backend-production-a1b2.up.railway.app/api` | ✅ Production |

**⚠️ IMPORTANTE**:
- ✅ Debe empezar con `https://` (NO `http://`)
- ✅ Debe terminar en `/api` (sin `/` al final)
- ✅ Ejemplo correcto: `https://backend-production-a1b2.up.railway.app/api`
- ❌ Ejemplo incorrecto: `http://3.235.30.235:8080/api` (HTTP bloqueado)

### 3️⃣ Redeploy Vercel

**a) Vercel → Deployments**

**b) Tres puntos → "Redeploy"**

**c) Esperar build** (~2-3 min)

### 4️⃣ Verificar Frontend

**a) Abrir en navegador**:
```
https://pasteleria-full-stack-final.vercel.app/productos
```

**b) Abrir DevTools (F12) → Console**

**c) Deberías ver**:
```
🔧 [API CONFIG] Inicializando cliente API con baseURL: https://backend-production-a1b2.up.railway.app/api
📤 [REQUEST] GET https://backend-production-a1b2.up.railway.app/api/categorias
📥 [RESPONSE SUCCESS] Status: 200 OK
```

**d) NO deberías ver**:
```
❌ Mixed Content (bloqueado)
❌ Network Error
❌ CORS error
```

---

## 🔄 ACTUALIZAR CORS EN BACKEND

**Railway → Backend Service → Variables → Editar FRONTEND_URL**:

### Opción A: URL Específica
```bash
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app
```

### Opción B: Con Wildcard (RECOMENDADO)
```bash
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app
```

**Por qué usar wildcard `*.vercel.app`?**
- Vercel crea URLs dinámicas para preview deployments
- Ejemplos:
  - `https://pasteleria-full-stack-final.vercel.app` (producción)
  - `https://pasteleria-full-stack-final-git-fix-bug.vercel.app` (preview)
  - `https://pasteleria-full-stack-final-c6xmo5klz.vercel.app` (preview)

**Código Backend ya actualizado**:
```java
// CorsConfig.java ya soporta wildcards con allowedOriginPatterns
configuration.setAllowedOriginPatterns(allowedOrigins);
```

---

## 📊 CHECKLIST COMPLETO

### Railway Backend
- [ ] Proyecto creado en Railway
- [ ] MySQL Service agregado (mismo proyecto)
- [ ] MySQL está "Running" (verde)
- [ ] Variables configuradas:
  - [ ] `SPRING_PROFILES_ACTIVE=production`
  - [ ] `PORT=$PORT`
  - [ ] `FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app`
- [ ] Deploy exitoso (ver logs)
- [ ] URL HTTPS generada: `https://backend-production-xxxx.up.railway.app`
- [ ] Test endpoint funciona: `curl https://backend-xxxx.railway.app/api/categorias`

### Vercel Frontend
- [ ] Variable `VITE_API_URL` configurada en dashboard
- [ ] Valor: `https://backend-xxxx.railway.app/api` (HTTPS obligatorio)
- [ ] Redeploy completado
- [ ] Aplicación carga sin errores
- [ ] Console NO muestra "Mixed Content"
- [ ] Console NO muestra "Network Error"
- [ ] Console NO muestra errores CORS

### Verificación Final
- [ ] Frontend carga categorías correctamente
- [ ] No hay errores en DevTools Console
- [ ] Logs de Railway muestran peticiones entrantes
- [ ] CORS permite peticiones desde Vercel

---

## 🐛 TROUBLESHOOTING

### Error: "Mixed Content" persiste

**Causa**: `VITE_API_URL` sigue usando HTTP

**Solución**:
1. Vercel → Settings → Environment Variables
2. Verificar que `VITE_API_URL` empiece con `https://`
3. Si está en `http://`, cambiarlo a `https://`
4. Redeploy Vercel

### Error: "CORS policy"

**Causa**: `FRONTEND_URL` en Railway no incluye URL de Vercel

**Solución**:
1. Railway → Backend → Variables
2. `FRONTEND_URL` debe ser: `https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app`
3. Railway re-desplegará automáticamente
4. Esperar 3-5 min

### Error: "Connection refused" (Railway)

**Causa**: MySQL no está conectado

**Solución**:
1. Railway → Verificar MySQL Service existe
2. MySQL debe estar "Running"
3. Backend y MySQL en el MISMO proyecto
4. NO crear variables `MYSQL_URL` manualmente

### Error: Backend no responde (404)

**Causa**: URL incorrecta

**Solución**:
```bash
# ✅ Correcto
https://backend-xxxx.railway.app/api/categorias

# ❌ Incorrecto
https://backend-xxxx.railway.app/categorias  # Falta /api
http://backend-xxxx.railway.app/api/categorias  # Debe ser HTTPS
```

---

## 🎯 RESUMEN VARIABLES

### Railway Backend

```bash
# CREAR MANUALMENTE (3 variables)
SPRING_PROFILES_ACTIVE=production
PORT=$PORT
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app

# PROVISTAS POR MYSQL SERVICE (NO crear)
MYSQL_URL=mysql://root:xxxxx@mysql.railway.internal:3306/railway
MYSQLUSER=root
MYSQLPASSWORD=xxxxx
MYSQLHOST=mysql.railway.internal
MYSQLPORT=3306
MYSQLDATABASE=railway
```

### Vercel Frontend

```bash
# CONFIGURAR EN DASHBOARD (1 variable)
VITE_API_URL=https://backend-production-xxxx.up.railway.app/api
```

---

## 📞 SIGUIENTE PASO

**Después de completar este PASO 1**:
1. ✅ Backend corriendo en Railway con HTTPS
2. ✅ Frontend conectándose correctamente
3. ✅ Sin errores Mixed Content
4. ✅ CORS funcionando

**Continuar con**:
- Configurar base de datos (crear tablas)
- Agregar datos iniciales (categorías, productos)
- Configurar backoffice/admin
- Testing end-to-end

---

**Última actualización**: Noviembre 30, 2025 01:50  
**Status**: ✅ Código actualizado con soporte HTTPS + CORS wildcards  
**Tiempo estimado**: 30-40 minutos
