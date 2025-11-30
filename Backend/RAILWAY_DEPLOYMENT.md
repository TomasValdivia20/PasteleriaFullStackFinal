# Railway Deployment - Pastelería Mil Sabores Backend

## 🚀 Configuración de Variables de Entorno en Railway

### Variables Obligatorias

Configura estas variables en el dashboard de Railway (Settings → Variables):

```bash
# 1. Perfil de Spring Boot (OBLIGATORIO)
SPRING_PROFILES_ACTIVE=production

# 2. Puerto (Railway lo asigna automáticamente - NO CAMBIAR)
PORT=${{PORT}}

# 3. Base de Datos MySQL
# Opción A: Si usas MySQL de Railway (RECOMENDADO)
DATABASE_URL=${{MYSQL_URL}}
DB_USERNAME=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}

# Opción B: Si usas MySQL externo
# DATABASE_URL=jdbc:mysql://tu-host.com:3306/nombre_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
# DB_USERNAME=tu_usuario
# DB_PASSWORD=tu_contraseña

# 4. Frontend URL (actualizar después de desplegar en Vercel)
FRONTEND_URL=https://tu-app.vercel.app

# 5. Opcional: Control de logs SQL
SHOW_SQL=false
```

### ⚠️ IMPORTANTE: Formato de DATABASE_URL

Si usas MySQL de Railway, la URL debe tener este formato:

```bash
# Railway provee MYSQL_URL pero Spring Boot necesita formato JDBC
# Por eso usamos DATABASE_URL con el formato correcto:

DATABASE_URL=jdbc:mysql://${{MYSQLHOST}}:${{MYSQLPORT}}/${{MYSQLDATABASE}}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
```

O simplemente usa las referencias de Railway:
```bash
DATABASE_URL=${{MYSQL_URL}}
```

## 📦 Cómo Agregar MySQL en Railway

1. En tu proyecto de Railway → **New** → **Database** → **Add MySQL**
2. Railway creará automáticamente estas variables:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQL_URL`

3. Usa las variables como se muestra arriba

## 🔧 Configuración Automática

Railway detectará automáticamente:
- Java 17
- Maven
- Spring Boot

### Archivos de Configuración (ya incluidos)

✅ **nixpacks.toml** - Configuración de build optimizada
✅ **railway.json** - Comandos de build y deploy
✅ **.railwayignore** - Excluir archivos innecesarios

### Proceso de Build

Railway ejecutará automáticamente:

```bash
# 1. Setup
chmod +x ./mvnw

# 2. Build
./mvnw clean package -DskipTests

# 3. Start
java -Dspring.profiles.active=production -Dserver.port=$PORT -jar target/backend-0.0.1-SNAPSHOT.jar
```

## ✅ Verificación Post-Deploy

Una vez desplegado, verifica los endpoints:

```bash
# Reemplaza <tu-app> con tu URL de Railway

# Health check
curl https://<tu-app>.railway.app/api/categorias

# Verificar productos
curl https://<tu-app>.railway.app/api/productos

# Verificar producto por ID
curl https://<tu-app>.railway.app/api/productos/1

# Productos por categoría
curl https://<tu-app>.railway.app/api/productos/categoria/1
```

## 🐛 Troubleshooting

### Error: "Permission denied" al ejecutar mvnw

**Solución**: Los archivos ya están configurados correctamente. Si persiste:
1. Verifica que `nixpacks.toml` existe
2. Railway ejecuta `chmod +x ./mvnw` automáticamente

### Error: "Failed to connect to database"

**Causas posibles**:
1. MySQL no está agregado al proyecto
2. Variables de entorno incorrectas
3. Formato de DATABASE_URL incorrecto

**Solución**:
1. Verifica que MySQL esté en el mismo proyecto de Railway
2. Revisa que las variables estén configuradas según arriba
3. Verifica en logs: Railway → Deployments → View Logs

### Error: "Port already in use"

**Solución**: No configures el puerto manualmente. Railway lo asigna vía `$PORT`

### Error: CORS en producción

**Solución**: 
1. Asegúrate de configurar `FRONTEND_URL` con la URL exacta de Vercel
2. No incluyas `/` al final
3. Ejemplo: `https://mi-app.vercel.app` ✅
4. No: `https://mi-app.vercel.app/` ❌

## 📊 Monitoreo

### Logs en Tiempo Real
1. Railway Dashboard → Tu servicio → Deployments
2. Click en el deployment activo
3. View Logs

### Métricas
1. Railway Dashboard → Tu servicio → Metrics
2. Observa: CPU, RAM, Network

## 🔄 Re-Deploy

Railway hace re-deploy automático cuando:
- Haces push a la rama conectada (main/master)
- Cambias variables de entorno
- Agregas/modificas servicios

### Forzar Re-Deploy Manual
1. Railway → Deployments
2. Click en ⋯ (tres puntos)
3. Redeploy

## 📝 Checklist de Deployment

Antes de hacer deploy, verifica:

- [ ] MySQL agregado al proyecto Railway
- [ ] Variable `SPRING_PROFILES_ACTIVE=production`
- [ ] Variables de base de datos configuradas
- [ ] Variable `PORT` usando `${{PORT}}`
- [ ] Código commiteado y pusheado
- [ ] Backend compila localmente sin errores (`./mvnw clean package`)

## 🎯 Resultado Esperado

Después del deploy exitoso:

✅ URL del backend: `https://tu-app.railway.app`
✅ API disponible en: `https://tu-app.railway.app/api/*`
✅ Base de datos conectada y tablas creadas automáticamente
✅ CORS configurado para el frontend

## 🔐 Seguridad

✅ Variables sensibles en environment variables (no en código)
✅ CORS configurado solo para dominio específico
✅ SSL/TLS habilitado automáticamente por Railway
✅ Stack traces ocultos en producción
✅ SQL logs deshabilitados en producción

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0
