# 🚀 Guía de Despliegue - Pastelería Mil Sabores

## 📋 Índice
- [Resumen del Sistema](#resumen-del-sistema)
- [Requisitos Previos](#requisitos-previos)
- [Configuración del Backend (AWS EC2)](#configuración-del-backend-aws-ec2)
- [Configuración del Frontend (GitHub Pages)](#configuración-del-frontend-github-pages)
- [Verificación y Diagnóstico](#verificación-y-diagnóstico)
- [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Resumen del Sistema

### Arquitectura
```
┌─────────────────────────────────────────────┐
│  Frontend (GitHub Pages)                    │
│  https://tomasvaldivia20.github.io/...      │
│  - React + Vite                             │
│  - React Router                             │
│  - Axios para peticiones HTTP               │
└────────────────┬────────────────────────────┘
                 │
                 │ HTTP Requests
                 │ (CORS habilitado)
                 ▼
┌─────────────────────────────────────────────┐
│  Backend (AWS EC2)                          │
│  http://98.92.85.200:8080/api               │
│  - Spring Boot / Node.js                    │
│  - Base de datos                            │
│  - API REST                                 │
└─────────────────────────────────────────────┘
```

---

## ✅ Requisitos Previos

### Backend (AWS EC2)
- [ ] Servidor corriendo en AWS EC2
- [ ] Puerto 8080 abierto en Security Groups
- [ ] CORS configurado correctamente
- [ ] Endpoints funcionando:
  - `GET /api/categorias`
  - `GET /api/productos`
  - `GET /api/productos/categoria/{id}`
  - `GET /api/productos/{id}`

### Frontend (GitHub Pages)
- [ ] Repositorio en GitHub
- [ ] GitHub Pages habilitado
- [ ] Node.js instalado (v18+)
- [ ] npm o yarn instalado

---

## 🔧 Configuración del Backend (AWS EC2)

### 1. Verificar que el Backend está Corriendo

```bash
# Desde tu servidor AWS
curl http://localhost:8080/api/categorias

# Desde tu computadora local
curl http://98.92.85.200:8080/api/categorias
```

### 2. Configurar CORS

**⚠️ CRÍTICO**: Sin CORS, el frontend NO podrá comunicarse con el backend.

Ver archivo: `CONFIGURACION_CORS_AWS.md` para instrucciones detalladas.

### 3. Verificar Security Groups

1. Ir a AWS Console → EC2 → Security Groups
2. Seleccionar el Security Group de tu instancia
3. Verificar regla de entrada:
   - Type: Custom TCP
   - Port: 8080
   - Source: 0.0.0.0/0

---

## 🌐 Configuración del Frontend (GitHub Pages)

### 1. Instalar Dependencias

```bash
cd Pasteleria-Mil-Sabores-VersionReactFinalFinal
npm install
```

### 2. Configurar Variables de Entorno

El proyecto ya incluye:
- `.env` - Configuración para desarrollo
- `.env.production` - Configuración para producción
- `.env.local.example` - Ejemplo para desarrollo local

**No necesitas modificar nada si usas la configuración por defecto.**

### 3. Probar en Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# El navegador abrirá automáticamente en http://localhost:5173
```

**Verifica en la consola del navegador:**
- Logs de conexión API
- Datos de categorías y productos
- No debe haber errores CORS

### 4. Construir para Producción

```bash
# Crear build optimizado
npm run build

# Esto genera la carpeta 'dist' con los archivos optimizados
```

### 5. Desplegar a GitHub Pages

```bash
# Desplegar automáticamente
npm run deploy

# Esto ejecuta:
# 1. npm run build (construye el proyecto)
# 2. gh-pages -d dist (despliega a GitHub Pages)
```

### 6. Verificar Despliegue

Visita: `https://tomasvaldivia20.github.io/Pasteleria-Mil-Sabores-VersionReactFinalFinal`

---

## 🔍 Verificación y Diagnóstico

### Opción 1: Consola del Navegador

Abre la consola (F12) y verás logs automáticos:

```
🔧 [API CONFIG] Inicializando cliente API con baseURL: http://98.92.85.200:8080/api
✅ [API CONFIG] Cliente API configurado correctamente
📚 [CategoriasList] Iniciando carga de categorías
📤 [REQUEST] 2025-11-29T...
   Method: GET
   URL: http://98.92.85.200:8080/api/categorias
📥 [RESPONSE SUCCESS] 2025-11-29T...
   Status: 200 OK
   Data Length: 8 items
✅ [CategoriasList] 8 categorías cargadas
```

### Opción 2: Script de Diagnóstico

En la consola del navegador:

```javascript
// Importar y ejecutar diagnóstico
import { diagnosticarConexion } from '/src/utils/diagnostico.js';
diagnosticarConexion();
```

### Opción 3: Network Tab

1. Abrir DevTools (F12)
2. Ir a la pestaña "Network"
3. Filtrar por "XHR" o "Fetch"
4. Recargar la página
5. Ver las peticiones a `/api/categorias`, `/api/productos`, etc.

---

## 🐛 Solución de Problemas

### ❌ Error: "CORS policy: No 'Access-Control-Allow-Origin'"

**Causa**: Backend no tiene CORS configurado

**Solución**:
1. Revisar `CONFIGURACION_CORS_AWS.md`
2. Agregar configuración CORS en el backend
3. Reiniciar el servidor backend
4. Verificar que permite `https://tomasvaldivia20.github.io`

---

### ❌ Error: "Failed to fetch" o "net::ERR_CONNECTION_REFUSED"

**Causa**: Backend no está accesible

**Solución**:
1. Verificar que el backend esté corriendo:
   ```bash
   curl http://98.92.85.200:8080/api/categorias
   ```
2. Verificar Security Groups en AWS
3. Verificar que la IP no haya cambiado (AWS EC2 reiniciado)

---

### ❌ Las imágenes no cargan

**Causa**: Rutas de imágenes incorrectas en producción

**Solución**: Ya implementado con `assetHelpers.js`
- Las rutas se ajustan automáticamente
- Imagen por defecto cuando falla: `etiqueta-vacia.png`

---

### ❌ Rutas no funcionan al recargar página en GitHub Pages

**Causa**: GitHub Pages no soporta SPAs por defecto

**Solución**: Agregar `404.html` (opcional):
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <script>
      sessionStorage.redirect = location.href;
    </script>
    <meta http-equiv="refresh" content="0;URL='/Pasteleria-Mil-Sabores-VersionReactFinalFinal'">
  </head>
</html>
```

---

## 📝 Checklist Pre-Despliegue

Antes de ejecutar `npm run deploy`, verifica:

- [ ] Backend está corriendo en AWS
- [ ] CORS está configurado
- [ ] Puerto 8080 está abierto
- [ ] `npm run build` funciona sin errores
- [ ] Probado en desarrollo local (`npm run dev`)
- [ ] No hay errores en la consola del navegador
- [ ] Las imágenes cargan correctamente
- [ ] La navegación funciona

---

## 📞 Soporte

### Logs Importantes

**Frontend (Navegador)**:
- Abrir consola (F12)
- Buscar logs con emojis: 🔧, 📤, 📥, ✅, ❌

**Backend (AWS)**:
```bash
# Ver logs del servidor
tail -f /var/log/tu-aplicacion.log

# O si usas PM2
pm2 logs
```

### Contacto

Si encuentras problemas, revisa:
1. La consola del navegador
2. El archivo `CONFIGURACION_CORS_AWS.md`
3. Los logs del backend en AWS

---

## 🎉 ¡Listo!

Si seguiste todos los pasos, tu aplicación debería estar funcionando en:

**Frontend**: https://tomasvaldivia20.github.io/Pasteleria-Mil-Sabores-VersionReactFinalFinal

**Backend**: http://98.92.85.200:8080/api

---

## 📚 Documentación Adicional

- [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/)
- [GitHub Pages](https://pages.github.com/)
- [AWS EC2](https://aws.amazon.com/ec2/)
- [CORS](https://developer.mozilla.org/es/docs/Web/HTTP/CORS)
