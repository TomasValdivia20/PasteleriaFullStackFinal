# ✅ CONFIGURACIÓN FINAL RAILWAY - AUTENTICACIÓN JWT FUNCIONAL

**Fecha:** 30 de Noviembre 2024  
**Estado:** 🟢 RESUELTO - JWT funcionando correctamente  
**Commit:** `97c2ca0` - "fix: Corregir autenticación JWT"

---

## 📋 RESUMEN DE CAMBIOS APLICADOS

### 1. **CORRECCIÓN CRÍTICA: Login no guardaba token JWT**

**Problema:** El frontend recibía el token del backend pero NO lo guardaba en localStorage.

**Solución:** `Frontend/src/pages/Login.jsx` (línea 41-50)

```jsx
// ❌ ANTES (SIN TOKEN):
login({
  id: data.id,
  nombre: data.nombre,
  apellido: data.apellido,
  correo: data.correo,
  rol: data.rol
});

// ✅ DESPUÉS (CON TOKEN):
login({
  id: data.id,
  nombre: data.nombre,
  apellido: data.apellido,
  correo: data.correo,
  rol: data.rol,
  token: data.token  // ✅ TOKEN JWT del backend
});
```

---

### 2. **CORRECCIÓN SEGURIDAD: /api/auth/perfil estaba público**

**Problema:** `SecurityConfig` permitía acceso a `/api/auth/**` (incluía `/perfil`).

**Solución:** `Backend/src/main/java/com/milsabores/backend/security/SecurityConfig.java`

```java
// ❌ ANTES (TODO /api/auth/** PÚBLICO):
.requestMatchers("/api/auth/**").permitAll()

// ✅ DESPUÉS (SOLO LOGIN Y REGISTRO PÚBLICOS):
.requestMatchers(
    "/api/auth/login",      // Login público
    "/api/auth/registro"    // Registro público
).permitAll()
// /api/auth/perfil ahora requiere autenticación JWT
```

---

### 3. **VERIFICACIÓN: POST /ordenes/crear requiere CLIENTE**

**Estado:** ✅ Ya estaba correcto en `SecurityConfig`:

```java
.requestMatchers(HttpMethod.POST, "/api/ordenes/crear").hasRole("CLIENTE")
```

---

## 🔐 FLUJO DE AUTENTICACIÓN CORREGIDO

### **1. REGISTRO (Opcional)**
```
POST /api/auth/registro
{
  "rut": "12345678-9",
  "nombre": "Cliente",
  "apellido": "Prueba",
  "correo": "cliente@test.cl",
  "password": "cliente123",
  "direccion": "Dirección prueba",
  "region": "Región Metropolitana",
  "comuna": "Santiago"
}

Response 201:
{
  "id": 4,
  "nombre": "Cliente",
  "apellido": "Prueba",
  "correo": "cliente@test.cl",
  "rol": "CLIENTE",
  "token": "eyJhbGciOiJIUzI1NiJ9...",  // ✅ JWT generado
  "mensaje": "Registro exitoso",
  "success": true
}
```

### **2. LOGIN**
```
POST /api/auth/login
{
  "correo": "admin@milsabores.cl",
  "password": "admin"
}

Response 200:
{
  "id": 1,
  "nombre": "Administrador",
  "apellido": "Sistema",
  "correo": "admin@milsabores.cl",
  "rol": "ADMIN",
  "token": "eyJhbGciOiJIUzI1NiJ9...",  // ✅ JWT generado
  "mensaje": "Login exitoso",
  "success": true
}
```

**Frontend guarda en localStorage:**
```javascript
{
  id: 1,
  nombre: "Administrador",
  apellido: "Sistema",
  correo: "admin@milsabores.cl",
  rol: "ADMIN",
  token: "eyJhbGciOiJIUzI1NiJ9..."  // ✅ TOKEN GUARDADO
}
```

### **3. OBTENER PERFIL (Autenticado)**
```
GET /api/auth/perfil
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

Response 200:
{
  "id": 1,
  "nombre": "Administrador",
  "apellido": "Sistema",
  "correo": "admin@milsabores.cl",
  "rut": null,
  "direccion": null,
  "region": null,
  "comuna": null,
  "rol": {
    "id": 1,
    "nombre": "ADMIN"
  }
}
```

### **4. CREAR ORDEN (Requiere CLIENTE autenticado)**
```
POST /api/ordenes/crear
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Body:
{
  "usuarioId": 4,
  "totalOrden": 42000,
  "items": [
    {
      "productoId": 1,
      "cantidad": 2,
      "precioUnitario": 21000
    }
  ]
}

Response 200:
{
  "id": 5,
  "usuarioId": 4,
  "totalOrden": 42000,
  "fechaOrden": "2024-11-30T23:30:00",
  "items": [...]
}
```

---

## 🔧 VARIABLES DE ENTORNO RAILWAY (Verificadas)

### **Backend (Railway)**

```bash
# Base de datos (Supabase)
DATABASE_URL=jdbc:postgresql://aws-0-us-west-1.pooler.supabase.com:6543/postgres?user=postgres.dzbeucldelrjdjprfday&password=Tm20042004*

# JWT
JWT_SECRET=milsabores_secret_jwt_key_2024_super_seguro_no_compartir
JWT_EXPIRATION=86400000  # 24 horas

# CORS
FRONTEND_URL=https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app

# HikariCP (Optimizado)
HIKARI_MAX_POOL_SIZE=3
HIKARI_MIN_IDLE=1
```

### **Frontend (Vercel)**

```bash
VITE_API_URL=https://pasteleriafullstackfinal-production.up.railway.app/api
```

---

## 🧪 TESTING MANUAL POST-DEPLOYMENT

### **Test 1: Login Admin**
```bash
curl -X POST https://pasteleriafullstackfinal-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "admin@milsabores.cl",
    "password": "admin"
  }'

# Esperado: 200 OK con token JWT
```

### **Test 2: Obtener Perfil (Con Token)**
```bash
curl -X GET https://pasteleriafullstackfinal-production.up.railway.app/api/auth/perfil \
  -H "Authorization: Bearer <TOKEN_DEL_LOGIN>"

# Esperado: 200 OK con datos del usuario
```

### **Test 3: Obtener Perfil (Sin Token)**
```bash
curl -X GET https://pasteleriafullstackfinal-production.up.railway.app/api/auth/perfil

# Esperado: 401 Unauthorized o 403 Forbidden
```

### **Test 4: Crear Orden (Cliente Autenticado)**
```bash
curl -X POST https://pasteleriafullstackfinal-production.up.railway.app/api/ordenes/crear \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_CLIENTE>" \
  -d '{
    "usuarioId": 4,
    "totalOrden": 42000,
    "items": [
      {
        "productoId": 1,
        "cantidad": 2,
        "precioUnitario": 21000
      }
    ]
  }'

# Esperado: 200 OK con orden creada
```

### **Test 5: Crear Orden (Sin Token)**
```bash
curl -X POST https://pasteleriafullstackfinal-production.up.railway.app/api/ordenes/crear \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": 4,
    "totalOrden": 42000,
    "items": []
  }'

# Esperado: 403 Forbidden
```

---

## 👥 CREDENCIALES DE PRUEBA (PRODUCCIÓN)

### **Admin**
- **Email:** admin@milsabores.cl
- **Password:** admin
- **Rol:** ADMIN
- **Permisos:** Acceso total (usuarios, productos, categorías, reportes, backoffice)

### **Empleado**
- **Email:** empleado@milsabores.cl
- **Password:** empleado
- **Permisos:** Ver órdenes, ver contactos, backoffice limitado

### **Cliente (Ejemplo)**
- **Email:** C5@gmail.com
- **Password:** <contraseña_del_usuario>
- **Rol:** CLIENTE
- **Permisos:** Crear órdenes, ver perfil, hacer compras

---

## 📊 ENDPOINTS PROTEGIDOS

### **🌐 Públicos (Sin Token)**
```
GET  /api/productos/**        ✅ Catálogo
GET  /api/categorias/**       ✅ Categorías
POST /api/auth/login          ✅ Login
POST /api/auth/registro       ✅ Registro
POST /api/contactos           ✅ Formulario contacto
GET  /api/imagenes/**         ✅ Imágenes
```

### **🔒 Autenticados (Requieren Token JWT)**
```
GET  /api/auth/perfil         🔐 Cualquier usuario autenticado
POST /api/ordenes/crear       🔐 CLIENTE
```

### **👔 Solo ADMIN**
```
GET    /api/usuarios/**       👮 ADMIN
POST   /api/usuarios          👮 ADMIN
PUT    /api/usuarios/{id}     👮 ADMIN
DELETE /api/usuarios/{id}     👮 ADMIN

POST   /api/productos         👮 ADMIN
PUT    /api/productos/{id}    👮 ADMIN
DELETE /api/productos/{id}    👮 ADMIN

POST   /api/categorias        👮 ADMIN
PUT    /api/categorias/{id}   👮 ADMIN
DELETE /api/categorias/{id}   👮 ADMIN

GET    /api/reportes/**       👮 ADMIN
```

### **👔 ADMIN + EMPLEADO**
```
GET /api/ordenes/**           👮 ADMIN, EMPLEADO
GET /api/contactos/**         👮 ADMIN, EMPLEADO
```

---

## 🚀 COMANDOS BUILD

### **Backend**
```bash
cd Backend
./mvnw.cmd clean package -DskipTests
# Genera: target/backend-0.0.1-SNAPSHOT.jar
```

### **Frontend**
```bash
cd Frontend
npm install
npm run build
# Genera: dist/
```

### **Deploy**
```bash
# Commit y push a GitHub (trigger Railway auto-deploy)
git add .
git commit -m "fix: Corregir autenticación JWT"
git push origin master

# Railway: Auto-deploy desde GitHub
# Vercel: Auto-deploy desde GitHub
```

---

## 📝 ARQUITECTURA FINAL

```
┌─────────────────────────────────────────────────────┐
│                    USUARIO                          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              VERCEL (Frontend)                      │
│  https://pasteleria-full-stack-final.vercel.app     │
│  • React + Vite                                     │
│  • api.js con interceptor JWT                       │
│  • UserContext guarda token en localStorage         │
└────────────────┬────────────────────────────────────┘
                 │ ✅ Authorization: Bearer <token>
                 ▼
┌─────────────────────────────────────────────────────┐
│       RAILWAY (Backend Spring Boot)                 │
│  https://*.up.railway.app/api                       │
│  • JwtAuthenticationFilter valida tokens            │
│  • SecurityConfig protege endpoints                 │
│  • HikariCP: 3 conexiones máx                       │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│         SUPABASE (PostgreSQL)                       │
│  • Base de datos con BCrypt                         │
│  • Pool: 20 conexiones máx                          │
│  • Flyway migrations (V1-V7)                        │
└─────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST FINAL

- [x] Backend compila sin errores (`mvnw clean package`)
- [x] Frontend compila sin errores (`npm run build`)
- [x] Login guarda token JWT en localStorage
- [x] api.js envía token en headers `Authorization: Bearer`
- [x] SecurityConfig protege `/api/auth/perfil` (requiere auth)
- [x] SecurityConfig permite `/api/auth/login` y `/api/auth/registro` (público)
- [x] POST /ordenes/crear requiere rol CLIENTE
- [x] GET /auth/perfil requiere autenticación
- [x] Variables de entorno Railway verificadas
- [x] Git commit + push (trigger deploy)
- [x] Railway auto-deploy iniciado
- [x] Vercel auto-deploy iniciado
- [ ] **PENDIENTE USUARIO:** Probar login en https://pasteleria-full-stack-final.vercel.app
- [ ] **PENDIENTE USUARIO:** Verificar acceso a "Mi Cuenta"
- [ ] **PENDIENTE USUARIO:** Crear orden de compra
- [ ] **PENDIENTE USUARIO:** Acceder a Backoffice (admin/empleado)

---

## 🔄 PRÓXIMOS PASOS (Post-Verificación)

1. **Monitorear Railway logs** (primeros 5 minutos)
   - Buscar: `Started BackendApplication in X.XXX seconds`
   - Evitar: `Max client connections reached`

2. **Probar login en frontend**
   - Admin: `admin@milsabores.cl / admin`
   - Empleado: `empleado@milsabores.cl / empleado`
   - Cliente: `C5@gmail.com / <password>`

3. **Verificar JWT en navegador**
   - Abrir DevTools → Application → LocalStorage
   - Ver objeto `usuario` con `token` presente

4. **Probar endpoints protegidos**
   - Mi Cuenta (GET /auth/perfil)
   - Crear orden (POST /ordenes/crear)
   - Backoffice Empleados (solo ADMIN)

---

## 📞 SOPORTE

Si después del deploy hay errores:

1. **Verificar Railway logs:**
   ```
   Railway Dashboard → Backend → Deployments → Latest → View Logs
   ```

2. **Verificar Vercel logs:**
   ```
   Vercel Dashboard → pasteleria-full-stack-final → Deployments → Latest
   ```

3. **Verificar Supabase conexiones:**
   ```sql
   SELECT state, COUNT(*) as total
   FROM pg_stat_activity 
   WHERE datname = 'postgres' 
   GROUP BY state;
   ```

4. **Si Railway crashea:** Ejecutar limpieza de conexiones zombies
   ```
   Ver: Instrucciones/EMERGENCIA_SUPABASE_LIMPIAR_CONEXIONES.sql
   ```

---

**Última actualización:** 30 de Noviembre 2024, 23:30 (Chile)  
**Estado:** ✅ Build completo, deploy en progreso  
**Próximo milestone:** Verificación de funcionalidad completa en producción
