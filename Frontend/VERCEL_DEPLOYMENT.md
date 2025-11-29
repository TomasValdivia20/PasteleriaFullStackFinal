# Vercel Deployment - Pastelería Mil Sabores Frontend

## Pasos para Deploy en Vercel

### 1. Preparación del Proyecto

Asegúrate de que el proyecto esté en un repositorio Git (GitHub, GitLab, o Bitbucket).

### 2. Importar Proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta de GitHub/GitLab/Bitbucket
3. Click en **"Add New Project"**
4. Selecciona el repositorio del frontend
5. Vercel detectará automáticamente que es un proyecto Vite

### 3. Configuración de Build

Vercel configurará automáticamente:

```bash
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Development Command: npm run dev
```

### 4. Variables de Entorno (CRÍTICO)

En la sección **Environment Variables** de Vercel, agrega:

```bash
# Variable obligatoria - URL de tu backend en Railway
VITE_API_URL=https://tu-backend.railway.app/api
```

**IMPORTANTE**: 
- Reemplaza `tu-backend.railway.app` con la URL real de tu backend desplegado en Railway
- La variable DEBE llamarse exactamente `VITE_API_URL`
- DEBE incluir el `/api` al final

### 5. Deploy

1. Click en **"Deploy"**
2. Vercel comenzará el build y deploy automáticamente
3. El proceso toma ~2-3 minutos

### 6. Configuración Post-Deploy

Una vez desplegado, verifica:

#### Actualizar CORS en Backend

Debes actualizar el `CorsConfig.java` en tu backend para permitir el dominio de Vercel:

```java
.allowedOrigins(
    "https://tu-app.vercel.app",
    "http://localhost:5173"  // Para desarrollo local
)
```

### 7. Verificación

Prueba tu aplicación:

```bash
# Abrir en navegador
https://tu-app.vercel.app

# Verificar que carga categorías
https://tu-app.vercel.app/categorias

# Verificar que carga productos
https://tu-app.vercel.app/productos
```

### 8. Dominios Personalizados (Opcional)

En Vercel puedes agregar dominios personalizados:

1. Ve a **Settings** → **Domains**
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones de Vercel

## Configuración de Variables de Entorno por Ambiente

Vercel soporta diferentes valores por ambiente:

```bash
# Production
VITE_API_URL=https://backend-production.railway.app/api

# Preview (branches)
VITE_API_URL=https://backend-staging.railway.app/api

# Development
VITE_API_URL=http://localhost:8080/api
```

## Re-Deploy

Vercel hace re-deploy automático cuando:
- Haces push a la rama principal (main/master)
- Haces push a cualquier rama (crea preview)
- Cambias variables de entorno

## Comandos Útiles

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Deploy desde CLI
vercel

# Deploy a producción
vercel --prod

# Ver logs
vercel logs
```

## Troubleshooting

### Error: API no responde

1. Verifica que `VITE_API_URL` esté configurada correctamente
2. Verifica que el backend en Railway esté corriendo
3. Verifica CORS en el backend

### Error: 404 en rutas

El archivo `vercel.json` ya está configurado con rewrites para SPA.

### Error: Assets no cargan

Verifica que las rutas de assets usen `/assets/` (no incluyen BASE_URL).

## Estructura de Archivos para Deploy

```
Frontend/
├── dist/                    # Generado por build
├── public/
│   └── assets/             # Imágenes y assets estáticos
├── src/
├── vercel.json             # Configuración de Vercel ✅
├── vite.config.js          # Configuración de Vite ✅
├── package.json            # Scripts y dependencias ✅
└── .env.production.example # Ejemplo de variables ✅
```

## Notas Importantes

- ✅ El proyecto está configurado para Vercel (base path en `/`)
- ✅ Los assets están optimizados con cache headers
- ✅ Las rutas SPA funcionan con rewrites
- ✅ El build está optimizado (minificación, tree-shaking, code splitting)
- ✅ Los console.logs se eliminan en producción
- ⚠️ Recuerda actualizar CORS en el backend con la URL de Vercel
