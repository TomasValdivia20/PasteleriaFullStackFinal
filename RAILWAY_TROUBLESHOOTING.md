# 🚨 RAILWAY BUILD TARDANDO - ACCIONES MANUALES

## 🎯 PROBLEMA ACTUAL

**Commits pusheados**:
- ✅ `f47b6ff` - Fix FetchType.LAZY → EAGER (hace 15 min)
- ✅ `0abf4c1` - Trigger force redeploy (hace 5 min)

**Estado Railway**: ⏳ Build/Deploy tardando más de 10 minutos (normal: 5-7 min)

**Posibles causas**:
1. Railway Free Tier con cola de builds
2. Railway no detectó el GitHub webhook
3. Build fallando silenciosamente
4. Deployment stuck en "Building"

---

## ✅ SOLUCIÓN - VERIFICAR Y REDEPLOY MANUAL EN RAILWAY

### PASO 1: Verificar Estado Deployment

1. **Abrir Railway Dashboard**: https://railway.app/dashboard
2. **Seleccionar proyecto Backend**
3. **Tab "Deployments"**
4. **Ver último deployment**:
   - ¿Commit hash es `0abf4c1` o `f47b6ff`?
   - ¿Status es "Building", "Deploying", "Success", o "Failed"?

**Si status es**:
- **"Building"** (más de 10 min) → Continuar PASO 2
- **"Failed"** → Continuar PASO 3
- **"Success" pero endpoint sin variantes** → Continuar PASO 4
- **Último commit es viejo** (no f47b6ff) → Continuar PASO 5

---

### PASO 2: Build Tardando (Status "Building" > 10 min)

**Acción**: Cancelar y redeploy manual

1. Railway Dashboard → Deployments
2. Click en deployment actual
3. **"Cancel Deployment"** (botón rojo superior derecha)
4. Esperar 30 segundos
5. **"Redeploy"** (botón en deployment anterior exitoso)
6. O crear nuevo deployment:
   - Tab **"Settings"**
   - Sección **"Service"**
   - Click **"Redeploy"**

Esperar 5-7 minutos y verificar con `.\verificar_sistema.ps1`

---

### PASO 3: Build Fallido (Status "Failed")

**Acción**: Revisar logs y corregir

1. Railway Dashboard → Deployments → Failed deployment
2. **"View Logs"**
3. Buscar errores (Ctrl+F):
   - `ERROR`
   - `FAILED`
   - `Exception`
   - `could not resolve`

**Errores comunes**:

**A) "Could not resolve dependencies"**:
```
[ERROR] Failed to execute goal on project backend
```

**Solución**:
- Verificar `pom.xml` válido
- Railway → Settings → "Clear Cache"
- Redeploy

**B) "Out of memory"**:
```
java.lang.OutOfMemoryError: Java heap space
```

**Solución**:
- Verificar variable `JAVA_TOOL_OPTIONS="-Xmx400m -Xms200m -XX:MaxMetaspaceSize=100m"`
- Reducir a `-Xmx350m` si persiste

**C) "Port already in use"**:
```
Port 8080 is already in use
```

**Solución**:
- Railway → Restart
- Si persiste, cambiar puerto en application.properties

**D) "Database connection failed"**:
```
Connection refused: connect
```

**Solución**:
- Verificar variable `SUPABASE_DB_PASSWORD`
- Verificar Supabase no pausó database (Free Tier pausa después inactividad)
- Supabase Dashboard → Database → "Resume"

---

### PASO 4: Build Exitoso pero Sin Variantes

**Acción**: Verificar que el código correcto está deployed

**Verificación 1**: Confirmar commit deployed

Railway → Deployments → Latest Success → Ver commit hash

Debe ser `0abf4c1` o `f47b6ff`.

Si es commit viejo → Railway no detectó push → Continuar PASO 5

**Verificación 2**: Revisar logs de startup

Railway → Deployments → Latest → View Logs

Buscar estas líneas (Ctrl+F):

```
✅ DEBE APARECER:
Started BackendApplication in X.XX seconds
HikariPool-1 - Start completed
Server started on port 8080

❌ NO DEBE APARECER:
LazyInitializationException
could not initialize proxy
no Session
```

**Si ves `LazyInitializationException`**: El fix EAGER no se aplicó
- Continuar PASO 5 (Redeploy manual)

**Si NO ves `LazyInitializationException`**: Otro problema
- Continuar PASO 6 (Troubleshooting avanzado)

---

### PASO 5: Railway No Detectó Push (GitHub Webhook)

**Acción**: Trigger deployment manual

**Opción A - Redeploy Último Commit**:

1. Railway Dashboard → Deployments
2. Buscar deployment exitoso más reciente
3. Click **"..."** (tres puntos) → **"Redeploy"**

**Opción B - Trigger Desde GitHub**:

1. Railway → Settings → **"Deployments"**
2. Verificar **"Auto Deploy"** está ON
3. Verificar **"Branch"** es `master`
4. Si está OFF → Activarlo
5. Click **"Redeploy"**

**Opción C - Desconectar y Reconectar GitHub**:

1. Railway → Settings → **"General"**
2. Sección **"Source"**
3. Click **"Disconnect"**
4. Confirmar
5. Click **"Connect to GitHub"**
6. Seleccionar repositorio `PasteleriaFullStackFinal`
7. Branch `master`
8. Confirmar

Esto forzará nuevo deployment con código actual.

---

### PASO 6: Troubleshooting Avanzado

**Si después de todo sigue sin variantes**:

**Test 1**: Verificar FetchType en runtime

Railway → Deployments → View Logs

Buscar al inicio del log (después de "Started BackendApplication"):

```
Hibernate: 
    SELECT DISTINCT p.*, v.*, i.*, c.*
    FROM productos p
    LEFT JOIN variantes_producto v ON v.producto_id = p.id
    ...
```

Si NO aparece este JOIN → Query no se ejecuta → Problema en Repository

**Test 2**: Activar SQL logs temporalmente

1. Railway → Variables
2. Agregar temporalmente:
   ```
   SPRING_JPA_SHOW_SQL=true
   SPRING_JPA_PROPERTIES_HIBERNATE_FORMAT_SQL=true
   ```
3. Redeploy
4. Ver logs → Buscar queries ejecutadas
5. Verificar si `SELECT ... FROM variantes_producto` aparece

**Test 3**: Verificar conexión Supabase

Railway → Terminal (si disponible en plan) o usar curl desde local:

```bash
# Desde PowerShell
$env:SUPABASE_PASSWORD="PasteleriaMilSabores123!"
psql "postgresql://postgres.dzbeucldelrjdjprfday:$env:SUPABASE_PASSWORD@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require" -c "SELECT COUNT(*) FROM variantes_producto;"
```

Debe retornar 41-58.

---

## 🔧 SOLUCIÓN ALTERNATIVA - CAMBIO DIRECTO EN RAILWAY

**Si Railway sigue sin funcionar**, aplicar fix directo en Railway:

### Opción: Editar archivo en Railway (si tiene editor)

Algunos planes Railway permiten editar archivos directamente.

1. Railway → Service → Files (si disponible)
2. Navegar a `src/main/java/com/milsabores/backend/model/Producto.java`
3. Buscar línea ~50:
   ```java
   fetch = FetchType.LAZY
   ```
4. Cambiar a:
   ```java
   fetch = FetchType.EAGER
   ```
5. Guardar
6. Railway auto-redeploy

---

## 📋 CHECKLIST DEBUGGING RAILWAY

- [ ] Railway Dashboard → Deployments → Último commit es `0abf4c1` o `f47b6ff`
- [ ] Status es "Success" (verde)
- [ ] Logs muestran "Started BackendApplication"
- [ ] Logs muestran "HikariPool-1 - Start completed"
- [ ] Logs NO muestran "LazyInitializationException"
- [ ] Auto Deploy está ON en Settings
- [ ] Branch configurado es `master`
- [ ] Variables de entorno correctas (9 total)
- [ ] Test manual endpoint retorna variantes

---

## 🚀 DESPUÉS DE RESOLVER

**Cuando Railway deployment sea exitoso**:

```powershell
# Verificar
.\verificar_sistema.ps1

# Debe mostrar:
# OK - Backend Railway: OPERATIVO
# OK - Variantes: FUNCIONANDO (7 variantes en producto 1)
```

**Entonces**:
1. Probar frontend: https://pasteleria-full-stack-final.vercel.app
2. Ir a producto "Torta Selva Negra"
3. Verificar selector de tamaños con 7 opciones

---

## 📞 COMANDOS ÚTILES RAILWAY

```bash
# Instalar Railway CLI (opcional)
npm install -g @railway/cli

# Login
railway login

# Ver logs en vivo
railway logs

# Redeploy
railway up

# Ver variables
railway variables

# Abrir dashboard
railway open
```

---

## ⚠️ SI NADA FUNCIONA

**Último recurso**: Crear nuevo servicio Railway desde cero

1. Railway → New Project
2. Deploy from GitHub repo
3. Seleccionar `PasteleriaFullStackFinal`
4. Root directory: `Backend`
5. Agregar las 9 variables de entorno
6. Deploy

Esto forzará build completamente limpio.

---

**SIGUIENTE ACCIÓN**: Ve a Railway Dashboard y verifica estado actual del deployment. Avísame qué ves y continuamos desde ahí.
