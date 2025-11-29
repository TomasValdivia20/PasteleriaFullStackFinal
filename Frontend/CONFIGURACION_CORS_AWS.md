# 🔧 Configuración de CORS para AWS Backend

## ⚠️ IMPORTANTE: Configuración Requerida en el Backend

Para que el frontend en GitHub Pages pueda comunicarse con el backend en AWS EC2, **DEBES** configurar CORS correctamente en tu servidor backend.

---

## 📋 Configuración de CORS Necesaria

### Para Spring Boot (Java)

Agrega esta configuración en tu proyecto backend:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Permitir credenciales
        config.setAllowCredentials(true);
        
        // Orígenes permitidos (GitHub Pages)
        config.addAllowedOrigin("https://tomasvaldivia20.github.io");
        config.addAllowedOrigin("http://localhost:5173"); // Para desarrollo
        
        // Headers permitidos
        config.addAllowedHeader("*");
        
        // Métodos HTTP permitidos
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");
        
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

### Para Node.js/Express

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

const corsOptions = {
  origin: [
    'https://tomasvaldivia20.github.io',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
```

---

## 🔐 AWS Security Groups

Asegúrate de que tu instancia EC2 tenga el puerto 8080 abierto:

1. Ve a AWS Console → EC2 → Security Groups
2. Selecciona el Security Group de tu instancia
3. Agrega regla de entrada (Inbound Rules):
   - **Type**: Custom TCP
   - **Port Range**: 8080
   - **Source**: 0.0.0.0/0 (Anywhere IPv4)
   - **Description**: API Backend

---

## ✅ Verificación

### 1. Verifica que el backend esté corriendo

```bash
curl http://98.92.85.200:8080/api/categorias
```

### 2. Verifica CORS desde el navegador

Abre la consola del navegador en GitHub Pages y ejecuta:

```javascript
fetch('http://98.92.85.200:8080/api/categorias')
  .then(res => res.json())
  .then(data => console.log('✅ CORS funciona:', data))
  .catch(err => console.error('❌ Error CORS:', err));
```

---

## 🐛 Problemas Comunes

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solución**: Configura CORS en el backend como se muestra arriba.

### Error: "net::ERR_CONNECTION_REFUSED"

**Solución**: 
- Verifica que el backend esté corriendo
- Verifica que el puerto 8080 esté abierto en AWS Security Groups
- Verifica que la IP sea correcta

### Error: "Failed to fetch"

**Solución**:
- Verifica que la URL sea HTTP (no HTTPS) si tu backend no tiene SSL
- Algunos navegadores bloquean peticiones HTTP desde HTTPS (GitHub Pages usa HTTPS)
- Considera configurar un certificado SSL en tu backend

---

## 🔒 Seguridad en Producción

⚠️ **IMPORTANTE**: La configuración `0.0.0.0/0` en Security Groups es para desarrollo.

En producción, considera:

1. **Usar HTTPS** en el backend (certificado SSL/TLS)
2. **Restringir IPs** en Security Groups si es posible
3. **Implementar autenticación** (JWT, OAuth)
4. **Rate limiting** para prevenir abuso
5. **Validación de inputs** en el backend

---

## 📝 URLs del Proyecto

- **Frontend (GitHub Pages)**: https://tomasvaldivia20.github.io/Pasteleria-Mil-Sabores-VersionReactFinalFinal
- **Backend (AWS EC2)**: http://98.92.85.200:8080/api
- **Repositorio**: https://github.com/TomasValdivia20/Pasteleria-Mil-Sabores-VersionReactFinalFinal

---

## 🆘 Contacto de Emergencia

Si los datos no cargan en producción, verifica en orden:

1. ✅ Backend corriendo en AWS
2. ✅ Puerto 8080 abierto en Security Groups
3. ✅ CORS configurado correctamente
4. ✅ URL correcta en .env.production
5. ✅ Consola del navegador para ver errores específicos
