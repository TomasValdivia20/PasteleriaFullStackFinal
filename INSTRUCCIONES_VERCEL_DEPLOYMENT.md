# ▲ INSTRUCCIONES DE DEPLOYMENT - VERCEL (FRONTEND)

## 📋 TABLA DE CONTENIDOS
1. [Variables de Entorno](#variables-de-entorno)
2. [Configuración del Proyecto](#configuración-del-proyecto)
3. [Pasos de Deployment](#pasos-de-deployment)
4. [Verificación Post-Deployment](#verificación-post-deployment)
5. [Troubleshooting](#troubleshooting)

---

## 🔐 VARIABLES DE ENTORNO

### Backend API URL (Obligatoria)
```bash
VITE_API_URL=https://tu-backend.railway.app
```

**⚠️ IMPORTANTE:** 
- **NO** incluyas `/api` al final (el código ya lo agrega automáticamente)
- Ejemplo correcto: `https://pasteleria-backend.railway.app`
- Ejemplo incorrecto: ~~`https://pasteleria-backend.railway.app/api`~~

### Verificar en el código (Frontend/src/api.js):
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const API_BASE_URL = `${API_URL}/api`;
```

---

## 🛠️ CONFIGURACIÓN DEL PROYECTO EN VERCEL

### 1. Build Settings

**Framework Preset:** Vite  
**Root Directory:** `Frontend`

**Build Command:**
```bash
npm install && npm run build
```

**Output Directory:**
```bash
dist
```

**Install Command:**
```bash
npm install
```

### 2. Node.js Version
```
Node.js Version: 18.x (LTS)
```

---

## 🚀 PASOS DE DEPLOYMENT

### Paso 1: Conectar Repositorio GitHub
1. Ve a Vercel Dashboard → Add New Project
2. Selecciona "Import Git Repository"
3. Conecta el repositorio: `TomasValdivia20/PasteleriaFullStackFinal`
4. Autoriza acceso a Vercel

### Paso 2: Configurar Root Directory
1. En "Configure Project", busca **Root Directory**
2. Click en "Edit" → Selecciona `Frontend`
3. Vercel detectará automáticamente que es un proyecto Vite

### Paso 3: Configurar Variables de Entorno
1. En "Environment Variables", agrega:
   ```
   Name: VITE_API_URL
   Value: https://tu-backend.railway.app
   ```
2. Aplica para: **Production, Preview, Development** (marcar todas)

### Paso 4: Configurar Build Settings (verificar)
Vercel debería detectar automáticamente:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

Si no, configúralos manualmente.

### Paso 5: Deploy
1. Click en "Deploy"
2. Vercel construirá y deployará automáticamente
3. Espera ~2-3 minutos

---

## ✅ VERIFICACIÓN POST-DEPLOYMENT

### 1. Verifica que el sitio carga
```
https://tu-frontend.vercel.app
```

### 2. Verifica que la API se conecta correctamente
1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Navega a la página de productos
4. Busca requests a: `https://tu-backend.railway.app/api/productos`
5. Verifica que el status sea `200 OK`

### 3. Prueba funcionalidades críticas
- ✅ **Home Page:** Se cargan productos destacados
- ✅ **Catálogo:** Se muestran todos los productos
- ✅ **Detalle Producto:** Información completa con variantes e imágenes
- ✅ **Login:** Autenticación funciona correctamente
- ✅ **Registro:** Creación de usuarios nueva
- ✅ **Carrito:** Agregar/eliminar productos
- ✅ **Backoffice (Admin):** CRUD de productos/categorías

---

## 🔧 TROUBLESHOOTING

### Error: "Failed to fetch" en producción
**Causa:** CORS bloqueando requests del frontend al backend.

**Solución:**
1. Verifica que en Railway (Backend) tengas configurado:
   ```bash
   FRONTEND_URL=https://tu-frontend.vercel.app
   ```
2. Verifica que NO incluyas `/*` o `/` al final
3. Redeploy el backend en Railway
4. Limpia cache del navegador (Ctrl+Shift+Delete)

### Error: "Network Error" o "ERR_CONNECTION_REFUSED"
**Causa:** Variable `VITE_API_URL` mal configurada o backend caído.

**Solución:**
1. Verifica en Vercel → Settings → Environment Variables
2. Confirma que `VITE_API_URL` tenga la URL correcta de Railway
3. Verifica que el backend esté funcionando: `https://tu-backend.railway.app/actuator/health`
4. Si cambiaste la variable, haz **Redeploy** en Vercel (no se aplica automáticamente)

### Error 404 al recargar páginas (rutas de React Router)
**Causa:** Vercel necesita configuración de rewrites para SPA.

**Solución:**
El proyecto ya tiene `vercel.json` configurado:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Si no existe, créalo en la raíz de `Frontend/`.

### Build falla con "Module not found"
**Causa:** Dependencias no instaladas correctamente.

**Solución:**
1. Verifica `package.json` en `Frontend/`
2. En Vercel → Settings → General → Build & Output Settings
3. Confirma que **Root Directory** = `Frontend`
4. Limpia cache de build: Vercel Dashboard → Deployments → tres puntos → "Redeploy" → marcar "Clear cache and retry"

### Imágenes no cargan (404)
**Causa 1:** Rutas de imágenes incorrectas (referencias a `/public/assets/`).

**Solución:**
- En Vite, las imágenes en `/public/` se sirven desde la raíz
- Usa rutas absolutas: `/assets/img/producto.jpg`
- O usa `import` para imágenes en `/src/assets/`

**Causa 2:** Imágenes alojadas en Supabase Storage.

**Solución:**
1. Verifica que las URLs de imágenes apunten a Supabase correctamente
2. Confirma que el bucket de Supabase sea público
3. Formato correcto: `https://dzbeucldelrjdjprfday.supabase.co/storage/v1/object/public/pasteles/imagen.jpg`

### Error: "This site can't be reached"
**Causa:** Dominio de Vercel no resuelve (DNS issues).

**Solución:**
1. Espera 5-10 minutos (propagación DNS)
2. Limpia cache DNS local:
   ```powershell
   ipconfig /flushdns
   ```
3. Prueba en modo incógnito
4. Verifica en Vercel Dashboard que el deployment esté "Ready"

---

## 🔄 ACTUALIZACIÓN DE VARIABLES DE ENTORNO

Si necesitas cambiar `VITE_API_URL`:

1. Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
2. Modifica el valor de `VITE_API_URL`
3. **IMPORTANTE:** Vercel **NO redeploya automáticamente**
4. Ve a Deployments → Latest → tres puntos → "Redeploy"
5. Espera a que termine el nuevo deployment

---

## 🌐 CONFIGURACIÓN DE DOMINIO PERSONALIZADO (Opcional)

### Agregar dominio custom:
1. Vercel Dashboard → Tu Proyecto → Settings → Domains
2. Agrega tu dominio: `pasteleria.com`
3. Configura DNS en tu proveedor:
   - Tipo: `CNAME`
   - Name: `www` (o `@` para root)
   - Value: `cname.vercel-dns.com`
4. Espera propagación DNS (5-60 minutos)
5. Vercel emitirá certificado SSL automáticamente

### Actualizar CORS en Backend:
Si cambias de dominio Vercel → dominio custom, actualiza en Railway:
```bash
FRONTEND_URL=https://tu-dominio-custom.com
```

---

## 📊 MONITOREO Y ANALYTICS

### Vercel Analytics (incluido gratis):
1. Ve a tu proyecto en Vercel
2. Tab "Analytics"
3. Puedes ver:
   - Page views
   - Top pages
   - Top referrers
   - Devices/Browsers

### Web Vitals (Performance):
1. Tab "Speed Insights"
2. Métricas Core Web Vitals:
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

---

## 🔒 SEGURIDAD

### Headers de Seguridad (ya configurados en vercel.json):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Variables de Entorno Sensibles:
- ✅ **NO** expongas API keys en el código frontend
- ✅ Usa variables de entorno (`VITE_*`)
- ✅ **NO** commitees `.env.local` a GitHub
- ✅ Configura secretos en Vercel Environment Variables

---

## 📝 CHECKLIST PRE-DEPLOYMENT

Antes de hacer deploy a producción, verifica:

- [ ] Backend deployado en Railway y funcionando
- [ ] Variable `VITE_API_URL` configurada con URL correcta de Railway
- [ ] Variable `FRONTEND_URL` configurada en Railway (para CORS)
- [ ] `vercel.json` existe en `Frontend/` con rewrites configurados
- [ ] Build local funciona: `npm run build`
- [ ] Dependencias actualizadas: `npm install`
- [ ] No hay errores en consola del navegador (DevTools)
- [ ] Imágenes cargan correctamente
- [ ] Login/Registro funciona
- [ ] Carrito de compras funciona

---

## 🔗 INTEGRACIÓN BACKEND-FRONTEND

### Flujo de comunicación:
```
Usuario (Navegador)
    ↓
Vercel Frontend (React + Vite)
    ↓ HTTP Request (fetch/axios)
Railway Backend (Spring Boot REST API)
    ↓ JDBC
Supabase (PostgreSQL)
```

### CORS configurado correctamente:
**Backend (Spring Security - SecurityConfig.java):**
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(frontendUrl)); // Lee de FRONTEND_URL
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    // ...
}
```

**Frontend (api.js):**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const API_BASE_URL = `${API_URL}/api`;
```

---

## 🆘 SOPORTE

Si encuentras errores no documentados:
1. Revisa los **Build Logs** en Vercel Dashboard → Deployments
2. Revisa la **Consola del navegador** (F12 → Console)
3. Revisa la pestaña **Network** en DevTools para errores HTTP
4. Verifica que el backend esté respondiendo: `/actuator/health`

**Última actualización:** 2 de diciembre de 2025
