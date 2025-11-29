# ⚡ Quick Start - Despliegue Rápido

## 🚀 Para Desplegar AHORA

```bash
# 1. Instalar dependencias (si no lo has hecho)
npm install

# 2. Probar en desarrollo
npm run dev

# 3. Si todo funciona, desplegar
npm run deploy
```

## ✅ Verificación Rápida

### En Desarrollo (http://localhost:5173)
1. Abre la consola del navegador (F12)
2. Deberías ver logs como:
   ```
   🔧 [API CONFIG] Inicializando cliente API...
   📤 [REQUEST] GET /api/categorias
   📥 [RESPONSE SUCCESS] 200 OK - 8 items
   ✅ [CategoriasList] 8 categorías cargadas
   ```
3. Las categorías y productos deben cargar

### En Producción (GitHub Pages)
1. Después de `npm run deploy`, espera 1-2 minutos
2. Visita: https://tomasvaldivia20.github.io/Pasteleria-Mil-Sabores-VersionReactFinalFinal
3. Abre la consola (F12) y verifica los mismos logs

## ❌ Si NO Funciona

### Problema: CORS Error
**Solución**: El backend necesita configuración CORS
- Lee: `CONFIGURACION_CORS_AWS.md`
- Agrega configuración al backend
- Reinicia el servidor backend

### Problema: Connection Refused
**Solución**: El backend no está accesible
1. Verifica que esté corriendo: `curl http://98.92.85.200:8080/api/categorias`
2. Verifica Security Groups en AWS (puerto 8080 abierto)
3. Verifica que la IP sea correcta

### Problema: Las imágenes no cargan
**Solución**: Ya está solucionado con `assetHelpers.js`
- Si persiste, verifica que las imágenes existan en `public/assets/img/`

## 🔍 Diagnóstico Automático

En la consola del navegador:
```javascript
import { diagnosticarConexion } from './src/utils/diagnostico.js';
diagnosticarConexion();
```

## 📚 Documentación Completa

- `RESUMEN_CAMBIOS.md` - Qué se cambió y por qué
- `DESPLIEGUE.md` - Guía completa paso a paso
- `CONFIGURACION_CORS_AWS.md` - Configurar CORS en backend

## 🆘 Ayuda Rápida

**Backend no responde?**
```bash
# Verificar desde terminal
curl http://98.92.85.200:8080/api/categorias
```

**Variables de entorno?**
- `.env` ya está configurado con AWS EC2
- `.env.production` ya está configurado para GitHub Pages
- NO necesitas cambiar nada

**Build falla?**
```bash
# Limpiar y reinstalar
rm -rf node_modules dist
npm install
npm run build
```

## ✅ Checklist Mínimo

- [ ] `npm install` ejecutado
- [ ] `npm run dev` funciona y muestra datos
- [ ] Backend AWS está corriendo
- [ ] CORS configurado en backend
- [ ] Puerto 8080 abierto en AWS
- [ ] `npm run deploy` sin errores

## 🎉 ¡Listo!

Si completaste el checklist, tu app está en:
https://tomasvaldivia20.github.io/Pasteleria-Mil-Sabores-VersionReactFinalFinal

---

**¿Problemas?** Abre `DESPLIEGUE.md` para instrucciones detalladas.
