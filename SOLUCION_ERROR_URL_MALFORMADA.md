# 🚨 ERROR: URL Malformada en Vercel

## ❌ PROBLEMA DETECTADO

**Tu configuración actual en Vercel**:
```
VITE_API_URL = pasteleriafullstackfinal-production.up.railway.app
```

**Errores**:
1. ❌ Falta `https://` al inicio
2. ❌ Falta `/api` al final

**Resultado**: Backend responde con **HTML del frontend** en vez de **JSON de la API**

---

## 📊 QUÉ ESTÁ PASANDO

```javascript
// Vercel intenta conectar a:
pasteleriafullstackfinal-production.up.railway.app/categorias

// Axios interpreta como ruta relativa (sin protocolo)
// Termina pidiendo:
https://pasteleria-full-stack-final.vercel.app/categorias

// Railway (servidor) responde con index.html del SPA
// Frontend recibe HTML en vez de JSON
// Cuando hace categorias.map() → ERROR: "o.map is not a function"
```

---

## ✅ SOLUCIÓN INMEDIATA

### 1. Ir a Vercel Dashboard

```
https://vercel.com → Tu Proyecto → Settings → Environment Variables
```

### 2. Editar `VITE_API_URL`

**BORRAR**:
```
pasteleriafullstackfinal-production.up.railway.app
```

**REEMPLAZAR CON** (copia esto EXACTAMENTE):
```
https://pasteleriafullstackfinal-production.up.railway.app/api
```

### 3. Verificar Formato

**✅ CORRECTO**:
```
https://pasteleriafullstackfinal-production.up.railway.app/api
│       │                                                  │
│       └─ Protocolo HTTPS (obligatorio)                   │
└─────────────────── Dominio Railway ─────────────────────┘
                                                           └─ Path /api
```

**Checklist**:
- ✅ Empieza con `https://` (8 caracteres)
- ✅ Incluye `.up.railway.app` (dominio Railway)
- ✅ Termina con `/api` (SIN `/` adicional)
- ✅ NO tiene espacios
- ✅ NO tiene saltos de línea

### 4. Guardar y Redeploy

1. **Save** (guardar variable)
2. Vercel auto-redesplegará (~2 min)
3. O manualmente: **Deployments → Redeploy**

---

## 🧪 VERIFICAR SOLUCIÓN

### Test 1: Ver Logs de Console

1. Abrir: https://pasteleria-full-stack-final.vercel.app/productos
2. F12 → Console

**✅ Deberías ver**:
```javascript
🔧 [API CONFIG] Inicializando cliente API con baseURL: 
   https://pasteleriafullstackfinal-production.up.railway.app/api

📤 [REQUEST] GET https://pasteleriafullstackfinal-production.up.railway.app/api/categorias

📥 [RESPONSE SUCCESS]
   Status: 200
   Data Type: Array  ← DEBE SER ARRAY, NO STRING
   Data Length: X items
```

**❌ NO deberías ver**:
```javascript
Data Type: string  ← Recibió HTML
Data: <!doctype html>  ← Respuesta incorrecta
TypeError: o.map is not a function  ← Error de .map()
```

### Test 2: Ver Validaciones

Con las validaciones agregadas, si la URL sigue mal verás:

```javascript
❌ [API CONFIG ERROR] URL malformada - falta protocolo (http:// o https://)
   URL actual: pasteleriafullstackfinal-production.up.railway.app
   ⚠️  Esto causará que las peticiones fallen
```

Si ves esto → La variable NO se actualizó correctamente

---

## 📋 CONFIGURACIÓN COMPLETA VERCEL

### Variables de Entorno Necesarias

**Solo necesitas 1 variable**:

| Variable | Valor | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | `https://pasteleriafullstackfinal-production.up.railway.app/api` | Production |

**NO necesitas**:
- ❌ `API_URL` (nombre incorrecto)
- ❌ `BACKEND_URL` (Vite no lo lee)
- ❌ `REACT_APP_*` (eso es para Create React App, no Vite)

**SOLO** `VITE_API_URL` (Vite lee variables que empiezan con `VITE_`)

---

## 🐛 SI SIGUE FALLANDO

### Error persiste después de cambiar variable

**Pasos**:
1. Vercel → Settings → Environment Variables
2. Verificar valor de `VITE_API_URL`:
   ```
   https://pasteleriafullstackfinal-production.up.railway.app/api
   ```
3. Delete la variable
4. Create nueva con valor correcto
5. Redeploy → Wait for Deployment

### Backend da 404 en /api/categorias

**Test**:
```powershell
curl https://pasteleriafullstackfinal-production.up.railway.app/api/categorias
```

**Si da 404**:
1. Backend no está sirviendo en `/api`
2. Railway no está corriendo
3. URL de Railway incorrecta

**Verifica Railway logs**:
```
Railway → Backend Service → Deployments → View Logs
Buscar: "Started BackendApplication"
```

### Console sigue mostrando HTML

**Causa**: Vercel no rebuildeó con nueva variable

**Solución**:
1. Deployments → Último deploy → Tres puntos
2. **Redeploy** (forzar rebuild)
3. Wait for completion
4. Hard refresh browser: `Ctrl + Shift + R`

---

## 🔧 CAMBIOS APLICADOS EN CÓDIGO

Para prevenir este error en el futuro, agregué validaciones:

### 1. `Frontend/src/api.js`

```javascript
// Detecta URLs sin protocolo
if (BASE_URL && !BASE_URL.startsWith('http://') && !BASE_URL.startsWith('https://')) {
    console.error('❌ [API CONFIG ERROR] URL malformada - falta protocolo');
    console.error('   URL actual:', BASE_URL);
    console.error('   ✅ Debe ser: https://backend.railway.app/api');
}

// Detecta URLs sin /api
if (BASE_URL && !BASE_URL.includes('/api')) {
    console.warn('⚠️  [API CONFIG WARNING] URL no incluye /api');
}
```

### 2. `Frontend/src/api.js` - Interceptor de Respuesta

```javascript
// Detecta cuando backend responde con HTML
if (typeof response.data === 'string' && response.data.trim().startsWith('<!doctype')) {
    console.error('❌ Backend respondió con HTML en vez de JSON');
    console.error('   ⚠️  VITE_API_URL no incluye /api al final');
    throw new Error('Backend respondió con HTML. Verifica VITE_API_URL');
}
```

### 3. `Frontend/src/assets/data/dataLoader.js`

```javascript
// Valida que response.data sea un array
if (typeof response.data === 'string') {
    console.error('❌ Backend respondió con STRING en vez de JSON');
    if (response.data.trim().startsWith('<!doctype')) {
        console.error('   ⚠️  Es HTML del frontend, no JSON del backend API');
        throw new Error('Backend respondió con HTML. Verifica VITE_API_URL');
    }
}

if (!Array.isArray(response.data)) {
    console.error('❌ response.data no es un array');
    throw new Error('Backend respondió con formato inválido');
}
```

**Beneficio**: Ahora verás errores claros en Console antes del crash

---

## 📞 RESUMEN ACCIÓN INMEDIATA

1. **Vercel → Settings → Environment Variables**
2. **Editar `VITE_API_URL`**:
   ```
   https://pasteleriafullstackfinal-production.up.railway.app/api
   ```
3. **Guardar**
4. **Redeploy**
5. **Verificar Console** (F12) - debe mostrar `Data Type: Array`

**Tiempo**: 5 minutos

---

**Creado**: Noviembre 30, 2025  
**Prioridad**: 🔴 CRÍTICA  
**Status**: Código actualizado con validaciones → Push pendiente
