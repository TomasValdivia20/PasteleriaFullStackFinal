# Railway Deployment - Pastelería Mil Sabores Backend

## Configuración de Variables de Entorno en Railway

Debes configurar las siguientes variables de entorno en Railway:

### Variables Obligatorias

```bash
# Perfil de Spring Boot
SPRING_PROFILES_ACTIVE=production

# Puerto (Railway lo asigna automáticamente)
PORT=${{PORT}}

# Base de Datos MySQL (Railway provee MySQL addon)
DATABASE_URL=${{MYSQL_URL}}
DB_USERNAME=${{MYSQL_USER}}
DB_PASSWORD=${{MYSQL_PASSWORD}}

# Opcional: Control de logs SQL
SHOW_SQL=false
```

### Cómo agregar la base de datos MySQL en Railway:

1. En tu proyecto de Railway, ve a la pestaña **Plugins**
2. Haz clic en **New** → **Database** → **Add MySQL**
3. Railway creará automáticamente las variables `MYSQL_URL`, `MYSQL_USER`, `MYSQL_PASSWORD`
4. Conecta estas variables al servicio backend usando las variables de entorno arriba

### Formato de DATABASE_URL

Si configuras manualmente, el formato debe ser:
```
jdbc:mysql://HOST:PORT/DATABASE_NAME?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
```

Ejemplo con MySQL de Railway:
```
jdbc:mysql://roundhouse.proxy.rlwy.net:12345/railway?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
```

## Comandos de Build y Deploy

Railway ejecutará automáticamente:

1. **Build**: `./mvnw clean package -DskipTests`
2. **Start**: `java -Dserver.port=$PORT -Dspring.profiles.active=production -jar target/backend-0.0.1-SNAPSHOT.jar`

## Verificación Post-Deploy

Una vez desplegado, verifica:

```bash
# Health check
curl https://tu-app.railway.app/api/categorias

# Verificar productos
curl https://tu-app.railway.app/api/productos
```

## Notas Importantes

- Railway asigna el puerto dinámicamente vía variable `$PORT`
- El perfil `production` reduce logs y optimiza rendimiento
- El pool de conexiones está configurado para 5 conexiones máximas
- El `ddl-auto=update` creará las tablas automáticamente en el primer deploy
