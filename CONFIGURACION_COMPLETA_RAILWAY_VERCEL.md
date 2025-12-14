# 🚀 CONFIGURACIÓN COMPLETA: RAILWAY + VERCEL

## 📋 RESUMEN EJECUTIVO

**ÚLTIMO FIX APLICADO (2025-12-13 22:30):**
- **Commit:** `30e65fa`
- **Problema resuelto:** equals/hashCode causaba que HashSet descartara variantes
- **Causa raíz:** `@Data` de Lombok generaba comparación circular (Variante↔Producto)
- **Solución:** equals/hashCode manual usando solo ID, sin incluir 'producto'
- **Status:** ✅ BUILD SUCCESS, pusheado a GitHub, esperando Railway auto-deploy

---

## 🏗️ RAILWAY - BACKEND SPRING BOOT

### ⚙️ VARIABLES DE ENTORNO (9 TOTAL)

Railway auto-detecta el backend como Java/Maven. Configuración requerida:

#### 1. **SUPABASE_DB_PASSWORD** ⚡ CRÍTICO
```
PasteleriaMilSabores123!
```
- **Descripción:** Password de PostgreSQL en Supabase
- **Uso:** `application-production.properties` línea 4
- **Validación:** Railway logs debe mostrar "HikariPool started"

#### 2. **SUPABASE_URL** ⚡ CRÍTICO
```
https://dzbeucldelrjdjprfday.supabase.co
```
- **Descripción:** URL base del proyecto Supabase
- **Uso:** Almacenamiento de imágenes en Supabase Storage
- **Bucket:** `pasteles`

#### 3. **SUPABASE_KEY** ⚡ CRÍTICO
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6YmV1Y2xkZWxyamRqcHJmZGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDg3MjEsImV4cCI6MjA0ODQ4NDcyMX0.0WdBM6Dn-qPNd3Fhz5SIPcwvEI6MnU-LhxN2xWLN1hg
```
- **Descripción:** Anon key pública de Supabase
- **Uso:** Autenticación con Supabase Storage API
- **Tipo:** Public key (segura para cliente)

#### 4. **SUPABASE_BUCKET** ⚡ CRÍTICO
```
pasteles
```
- **Descripción:** Nombre del bucket de almacenamiento
- **Configuración:** Public bucket en Supabase Storage
- **Política:** Public read access

#### 5. **JWT_SECRET** 🔐 SEGURIDAD
```
milsabores-secret-key-super-secure-2024-production-do-not-share-this-secret-key-with-anyone-keep-it-safe
```
- **Descripción:** Clave secreta para firmar JWT tokens
- **Longitud:** 64+ caracteres recomendado
- **⚠️ IMPORTANTE:** Cambiar en producción real

#### 6. **JWT_EXPIRATION** ⏱️ SEGURIDAD
```
86400000
```
- **Descripción:** Tiempo de expiración JWT en milisegundos
- **Equivale:** 24 horas (86400000ms)
- **Uso:** `JwtUtil.java` para generar tokens

#### 7. **FRONTEND_URL** 🌐 CORS
```
https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app
```
- **Descripción:** URLs permitidas para CORS
- **Formato:** Separadas por comas
- **Incluye:** Dominio principal + preview deploys de Vercel
- **Configuración:** `SecurityConfig.java` línea 45

#### 8. **SPRING_PROFILES_ACTIVE** 🏷️ ENTORNO
```
production
```
- **Descripción:** Perfil de Spring Boot activo
- **Efecto:** Usa `application-production.properties`
- **Database:** Supabase Session Pooler (port 5432)

#### 9. **JAVA_TOOL_OPTIONS** 💾 MEMORIA
```
-Xmx400m -Xms200m -XX:MaxMetaspaceSize=100m -XX:+UseG1GC
```
- **Descripción:** Optimización memoria para Railway Free Tier (512MB)
- **-Xmx400m:** Heap máximo 400MB
- **-Xms200m:** Heap inicial 200MB
- **-XX:MaxMetaspaceSize=100m:** Metaspace 100MB
- **-XX:+UseG1GC:** Garbage collector G1 (eficiente)

---

### 📝 CONFIGURACIÓN ADICIONAL RAILWAY

#### Build Command (Auto-detectado)
```bash
./mvnw clean package -DskipTests
```

#### Start Command (Auto-detectado)
```bash
java $JAVA_TOOL_OPTIONS -jar target/backend-0.0.1-SNAPSHOT.jar
```

#### Root Directory
```
Backend/
```

#### Health Check Endpoint
```
https://pasteleriafullstackfinal-production.up.railway.app/actuator/health
```

**Respuesta esperada:**
```json
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "diskSpace": {"status": "UP"},
    "ping": {"status": "UP"}
  }
}
```

---

### 🗄️ CONEXIÓN DATABASE SUPABASE

**application-production.properties:**
```properties
# Session Pooler (port 5432) - Mantiene conexión abierta
spring.datasource.url=jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:5432/postgres
spring.datasource.username=postgres.dzbeucldelrjdjprfday
spring.datasource.password=${SUPABASE_DB_PASSWORD}

# HikariCP para Railway Free Tier (max 10 conexiones)
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.minimum-idle=2
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
```

**¿Por qué Session Pooler (5432) y no Transaction Pooler (6543)?**
- Session Pooler mantiene conexión abierta durante toda la @Transactional
- FetchType.EAGER + JOIN FETCH requieren session activa para cargar collections
- Transaction Pooler cierra conexión inmediatamente, causando LazyInitializationException
- Railway Free Tier tiene límite de conexiones, Session Pooler es más eficiente

---

## 🌐 VERCEL - FRONTEND REACT + VITE

### ⚙️ VARIABLES DE ENTORNO (2 TOTAL)

#### 1. **VITE_API_BASE_URL** ⚡ CRÍTICO
```
https://pasteleriafullstackfinal-production.up.railway.app
```
- **Descripción:** URL base del backend Railway
- **Uso:** `src/api.js` para todas las peticiones HTTP
- **Sin trailing slash:** `/` causa URLs duplicadas

**Verificar en código:**
```javascript
// src/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

#### 2. **VITE_ENVIRONMENT** 🏷️ ENTORNO
```
production
```
- **Descripción:** Identificador de entorno
- **Uso:** Condicionales en código para features específicas
- **Valores:** `development`, `production`

---

### 📝 CONFIGURACIÓN ADICIONAL VERCEL

#### Framework Preset
```
Vite
```

#### Root Directory
```
Frontend/
```

#### Build Command
```bash
npm run build
```

#### Output Directory
```
dist
```

#### Install Command (Auto-detectado)
```bash
npm install
```

#### Node Version (package.json)
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

### 🔄 AUTO-DEPLOY WORKFLOW

#### GitHub → Railway (Backend)
1. Push a `master` → Railway detecta cambios
2. Railway ejecuta: `./mvnw clean package -DskipTests`
3. Build exitoso → Deploy automático
4. Health check: `/actuator/health` debe retornar UP
5. Logs en Railway Dashboard

#### GitHub → Vercel (Frontend)
1. Push a `master` → Vercel detecta cambios
2. Vercel ejecuta: `npm install && npm run build`
3. Build exitoso → Deploy automático
4. Preview URL disponible inmediatamente
5. Production URL actualizada

---

## 🧪 VALIDACIÓN POST-DEPLOY

### Backend Railway

#### 1. Health Check
```bash
curl https://pasteleriafullstackfinal-production.up.railway.app/actuator/health
```

**Esperado:**
```json
{"status":"UP","components":{"db":{"status":"UP"}}}
```

#### 2. Endpoint Productos
```bash
curl https://pasteleriafullstackfinal-production.up.railway.app/api/productos/1
```

**Esperado (después del fix equals/hashCode):**
```json
{
  "id": 1,
  "nombre": "Torta Selva Negra",
  "descripcion": "...",
  "precioBase": 7000,
  "variantes": [
    {
      "id": 1,
      "nombre": "6 porciones",
      "precio": 7000,
      "stock": 15
    },
    {
      "id": 2,
      "nombre": "10 porciones",
      "precio": 15000,
      "stock": 12
    }
    // ... 5 variantes más (total 7)
  ],
  "imagenes": []
}
```

**❌ ANTES del fix (commit a70adb48):**
```json
{
  "variantes": [],  // ← VACÍO por equals/hashCode circular
  "imagenes": []
}
```

#### 3. Railway Logs
```bash
# En Railway Dashboard → Deployments → View Logs
```

**Buscar:**
```
✅ [SERVICE] Producto cargado - ID: 1, Variantes: 7, Imagenes: 0
```

**❌ ANTES del fix:**
```
✅ [SERVICE] Producto cargado - ID: 1, Variantes: 0, Imagenes: 0
```

---

### Frontend Vercel

#### 1. Página de Inicio
```
https://pasteleria-full-stack-final.vercel.app
```

#### 2. Categorías
```
https://pasteleria-full-stack-final.vercel.app/categorias
```

#### 3. Producto con Variantes
```
https://pasteleria-full-stack-final.vercel.app/categorias/1/productos/1
```

**Verificar:**
- ✅ Selector de tamaños visible
- ✅ 7 opciones en dropdown (6, 10, 15, 20, 30, 50, 80 porciones)
- ✅ Precio cambia al seleccionar tamaño
- ✅ Botón "Agregar al carrito" habilitado
- ✅ Sin errores en consola (F12)

**❌ ANTES del fix:**
- ❌ Selector de tamaños NO aparecía
- ❌ Console: `variantes: Array(0)` vacío
- ❌ Precio fijo sin variación

---

## 🐛 TROUBLESHOOTING

### Problema: Railway muestra "Variantes: 0" en logs

**Diagnóstico:**
```bash
# 1. Verificar tabla Supabase NO VACÍA
SELECT COUNT(*) FROM variantes_producto;
# Debe retornar: 58

# 2. Verificar datos específicos
SELECT * FROM variantes_producto WHERE producto_id = 1;
# Debe retornar: 7 registros
```

**Causas posibles:**
1. ✅ **FIX APLICADO:** equals/hashCode circular (commit 30e65fa)
2. ⏳ **ESPERAR:** Railway aún no deployó último commit
3. ❌ **DATOS:** Tabla vacía en Supabase

**Solución:**
```powershell
# Si tabla vacía, ejecutar:
.\ejecutar_carga_variantes.ps1
```

---

### Problema: CORS error en Vercel

**Error en consola:**
```
Access to XMLHttpRequest at 'https://pasteleriafullstackfinal...' from origin 'https://pasteleria-full-stack-final.vercel.app' has been blocked by CORS policy
```

**Solución:**
1. Verificar `FRONTEND_URL` en Railway incluya URL de Vercel
2. Formato correcto: `https://pasteleria-full-stack-final.vercel.app,https://*.vercel.app`
3. Reiniciar Railway después de cambiar variable

---

### Problema: 502 Bad Gateway en Railway

**Diagnóstico:**
```bash
# Railway logs debe mostrar:
Started BackendApplication in X seconds
```

**Causas:**
1. **Memoria insuficiente:** Verificar `JAVA_TOOL_OPTIONS` configurado
2. **Database down:** Verificar Supabase activo
3. **Build failed:** Verificar logs de build en Railway

---

## 📊 ARQUITECTURA TÉCNICA

### Stack Tecnológico

**Backend:**
- Spring Boot 3.2.3
- Java 17
- PostgreSQL (Supabase)
- JPA/Hibernate
- HikariCP (connection pool)
- JWT Authentication
- Maven

**Frontend:**
- React 18
- Vite 7
- Axios
- React Router
- Bootstrap 5

**Deployment:**
- Railway (Backend)
- Vercel (Frontend)
- GitHub (CI/CD trigger)
- Supabase (Database + Storage)

---

### Flujo de Datos

```
Usuario (Browser)
    ↓
Vercel Frontend (React)
    ↓ HTTPS
Railway Backend (Spring Boot)
    ↓ JDBC
Supabase PostgreSQL (Session Pooler :5432)
    ↓
Hibernate + FetchType.EAGER + JOIN FETCH
    ↓
Set<VarianteProducto> (equals/hashCode por ID)
    ↓
Jackson JSON Serialization
    ↓
API Response → Frontend
```

---

### FIX CRÍTICO: equals/hashCode

**PROBLEMA:**
```java
// ❌ ANTES (con @Data):
@Data  // Genera equals/hashCode con TODOS los campos
public class VarianteProducto {
    private Long id;
    private Producto producto;  // ← CAUSA comparación circular
}

// RESULTADO:
Hibernate trae datos → HashSet.add(variante)
→ hashCode() incluye 'producto'
→ hashCode cambia cuando se asigna 'producto'
→ HashSet pierde elementos por hashCode inestable
→ variantes.size() = 0
```

**SOLUCIÓN:**
```java
// ✅ DESPUÉS:
@Getter @Setter  // Control manual
public class VarianteProducto {
    private Long id;
    private Producto producto;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof VarianteProducto)) return false;
        VarianteProducto that = (VarianteProducto) o;
        return id != null && Objects.equals(id, that.id);  // Solo ID
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();  // Constante
    }
}

// RESULTADO:
Hibernate trae datos → HashSet.add(variante)
→ hashCode constante
→ equals solo por ID
→ variantes.size() = 7 ✅
```

---

## ✅ CHECKLIST FINAL

### Pre-Deploy
- [x] Variables Railway configuradas (9 total)
- [x] Variables Vercel configuradas (2 total)
- [x] `application-production.properties` correcto
- [x] equals/hashCode implementado correctamente
- [x] Campo 'imagen' deprecated eliminado
- [x] Build backend exitoso: `mvnw clean package`
- [x] Build frontend exitoso: `npm run build`
- [x] Commit pusheado a GitHub: `30e65fa`

### Post-Deploy Railway
- [ ] Health check UP
- [ ] Logs muestran "Variantes: 7" (no 0)
- [ ] Endpoint `/api/productos/1` retorna variantes
- [ ] Sin LazyInitializationException en logs

### Post-Deploy Vercel
- [ ] Homepage carga correctamente
- [ ] Selector de tamaños visible en productos
- [ ] Sin errores CORS en consola
- [ ] Agregar al carrito funciona

### Validación End-to-End
- [ ] Usuario puede navegar categorías
- [ ] Usuario puede ver producto con variantes
- [ ] Usuario puede cambiar tamaño
- [ ] Precio actualiza correctamente
- [ ] Usuario puede agregar al carrito
- [ ] Carrito muestra productos con variante seleccionada

---

## 📚 DOCUMENTACIÓN RELACIONADA

- `LEEME_PRIMERO.md` - Resumen ejecutivo
- `SOLUCION_FINAL_VARIANTES.md` - Explicación técnica LAZY vs EAGER
- `RAILWAY_TROUBLESHOOTING.md` - Troubleshooting completo
- `RESUMEN_FINAL.md` - Auditoría completa de código
- `SQL_INSERT_VARIANTES_PRODUCTOS.sql` - Script de datos (58 variantes)
- `ejecutar_carga_variantes.ps1` - Script interactivo de carga

---

## 🎯 PRÓXIMOS PASOS

1. **Monitorear Railway Deploy:**
   - Railway Dashboard → Deployments
   - Esperar commit `30e65fa` deployed
   - Tiempo estimado: 1-3 minutos

2. **Validar Fix:**
   ```bash
   curl https://pasteleriafullstackfinal-production.up.railway.app/api/productos/1
   ```
   Debe retornar variantes[] con 7 elementos

3. **Probar Frontend:**
   - Abrir: https://pasteleria-full-stack-final.vercel.app
   - Navegar: Categorías → Bizcochuelo → Torta Selva Negra
   - Verificar: Selector de tamaños con 7 opciones

4. **Si persiste problema:**
   ```powershell
   .\verificar_sistema.ps1
   ```

---

**Última actualización:** 2025-12-13 22:30 (Commit 30e65fa)
**Status:** ✅ Fix aplicado, builds exitosos, esperando deploy Railway
