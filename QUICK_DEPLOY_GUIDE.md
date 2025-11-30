# 🚀 Guía Rápida de Deployment

## Backend en Railway

### 1. Crear Proyecto
1. Ir a [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Seleccionar repositorio

### 2. Agregar MySQL
1. New → Database → Add MySQL
2. Railway crea variables automáticamente

### 3. Configurar Variables de Entorno

```bash
SPRING_PROFILES_ACTIVE=production
DATABASE_URL=${{MYSQL_URL}}
DB_USERNAME=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}
FRONTEND_URL=https://tu-app.vercel.app
PORT=${{PORT}}
```

### 4. Deploy
Railway despliega automáticamente. Tiempo: ~5-7 min

### 5. Obtener URL
`https://tu-backend.railway.app`

---

## Frontend en Vercel

### 1. Crear Proyecto
1. Ir a [vercel.com](https://vercel.com)
2. Add New Project
3. Import Git Repository

### 2. Configurar Build
Vercel detecta Vite automáticamente:
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

### 3. Configurar Variable de Entorno

```bash
VITE_API_URL=https://tu-backend.railway.app/api
```

⚠️ **IMPORTANTE**: 
- Reemplaza `tu-backend.railway.app` con tu URL real de Railway
- DEBE incluir `/api` al final

### 4. Deploy
Vercel despliega automáticamente. Tiempo: ~2-3 min

### 5. Obtener URL
`https://tu-app.vercel.app`

---

## Post-Deployment

### Actualizar CORS
1. Ir a Railway → Variables
2. Actualizar: `FRONTEND_URL=https://tu-app-real.vercel.app`
3. Railway redespliega automáticamente

### Verificar
```bash
# Backend
curl https://tu-backend.railway.app/api/categorias

# Frontend
https://tu-app.vercel.app
```

---

## Variables de Entorno - Resumen

| Plataforma | Variable | Valor |
|------------|----------|-------|
| Railway | `SPRING_PROFILES_ACTIVE` | `production` |
| Railway | `DATABASE_URL` | `${{MYSQL_URL}}` |
| Railway | `DB_USERNAME` | `${{MYSQLUSER}}` |
| Railway | `DB_PASSWORD` | `${{MYSQLPASSWORD}}` |
| Railway | `FRONTEND_URL` | `https://tu-app.vercel.app` |
| Railway | `PORT` | `${{PORT}}` |
| Vercel | `VITE_API_URL` | `https://tu-backend.railway.app/api` |

---

## Checklist Pre-Deploy

### Backend
- [ ] Código commiteado y pusheado
- [ ] Build local exitoso: `./mvnw clean package`
- [ ] MySQL agregado en Railway
- [ ] Variables de entorno configuradas

### Frontend
- [ ] Código commiteado y pusheado
- [ ] Build local exitoso: `npm run build`
- [ ] Variable `VITE_API_URL` configurada
- [ ] Backend ya desplegado (para obtener URL)

---

## Solución de Problemas Comunes

### Railway: "Permission denied" al ejecutar mvnw
✅ **Solucionado**: `nixpacks.toml` ejecuta `chmod +x ./mvnw` automáticamente

### Railway: "Cannot connect to database"
🔧 Verificar:
1. MySQL está en el mismo proyecto
2. Variables `DATABASE_URL`, `DB_USERNAME`, `DB_PASSWORD` correctas
3. Usar referencias Railway: `${{MYSQL_URL}}`

### Vercel: "API no responde"
🔧 Verificar:
1. `VITE_API_URL` tiene URL correcta de Railway
2. URL incluye `/api` al final
3. Backend está desplegado y funcionando

### CORS Error
🔧 Verificar:
1. `FRONTEND_URL` en Railway tiene URL exacta de Vercel
2. Sin `/` al final
3. Railway ha redesplegado después del cambio

---

## Endpoints Disponibles

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

**Tiempo total estimado**: 15-20 minutos
**Costo**: Gratis (tier gratuito de Railway y Vercel)
