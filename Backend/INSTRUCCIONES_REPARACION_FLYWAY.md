# 🔧 INSTRUCCIONES PARA REPARAR FLYWAY EN SUPABASE

## 📊 PROBLEMA DETECTADO

Railway logs muestran que Flyway está en un **estado de error permanente**:
- ✅ V7 existe en el código (commit a39fdb1)
- ❌ Railway NO ejecuta V7 
- ❌ Flyway solo intenta V6 repetidamente
- 🐛 CAUSA RAÍZ: Tabla `flyway_schema_history` tiene registro de V6 marcado como FAILED

## 🎯 SOLUCIÓN: Limpiar estado de Flyway manualmente en Supabase

### OPCIÓN 1: Ejecutar SQL directamente en Supabase (RECOMENDADO)

1. **Abrir Supabase SQL Editor**:
   - Ir a: https://supabase.com/dashboard/project/YOUR_PROJECT
   - Navegar a: SQL Editor

2. **Verificar estado actual**:
```sql
-- Ver historial de migraciones
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC;

-- Ver específicamente V6
SELECT * FROM flyway_schema_history WHERE version = '6';
```

3. **OPCIÓN A - Eliminar SOLO el registro fallido de V6**:
```sql
-- Eliminar registro de V6 fallido
DELETE FROM flyway_schema_history WHERE version = '6' AND success = false;

-- Verificar eliminación
SELECT * FROM flyway_schema_history WHERE version = '6';
```

4. **OPCIÓN B - Reset completo (SI OPCIÓN A NO FUNCIONA)**:
```sql
-- ADVERTENCIA: Esto elimina TODO el historial de Flyway
-- Solo usar si OPCIÓN A falla
TRUNCATE TABLE flyway_schema_history;

-- Insertar solo V1 (schema inicial que YA está aplicado)
INSERT INTO flyway_schema_history (
    installed_rank, version, description, type, script, checksum,
    installed_by, installed_on, execution_time, success
) VALUES (
    1, '1', 'create initial schema', 'SQL', 'V1__create_initial_schema.sql', 
    NULL, 'postgres', NOW(), 5000, true
);
```

5. **Forzar redeploy en Railway**:
   - Railway detectará el push anterior y reiniciará
   - Flyway intentará ejecutar V6 nuevamente
   - V6 fallará (esperado)
   - Flyway ejecutará V7 automáticamente
   
   ⚠️ **SI V6 sigue bloqueando**: Necesitamos ELIMINAR el archivo V6 completamente

### OPCIÓN 2: Eliminar V6 del código (SI OPCIÓN 1 FALLA)

Si después de limpiar `flyway_schema_history` Flyway sigue intentando V6:

```bash
# En PowerShell
cd e:\PROYECTOSPROGRAMACION\PasteleriaFullStackFinal\Backend

# Eliminar V6 (archivo problemático)
Remove-Item "src\main\resources\db\migration\V6__reset_admin_user_bcrypt.sql"

# Reconstruir
.\mvnw.cmd clean package -DskipTests

# Commit y push
git add -A
git commit -m "fix(flyway): eliminar V6 problemático, solo usar V7"
git push origin master
```

## 📋 VERIFICACIÓN POST-REPARACIÓN

Después de cualquier opción, verificar en Supabase:

```sql
-- Ver usuarios creados
SELECT id, rut, nombre, correo, rol_id FROM usuarios ORDER BY id;

-- Debería mostrar:
-- ID=1: admin@milsabores.cl
-- ID=2: empleado@milsabores.cl

-- Ver historial Flyway
SELECT version, description, success, installed_on 
FROM flyway_schema_history 
ORDER BY installed_rank DESC;
```

## 🚀 DESPUÉS DE REPARAR

1. **Probar admin login** en: https://pasteleria-full-stack-final.vercel.app/login
   - Email: admin@milsabores.cl
   - Password: admin

2. **Verificar Productos carga**: https://pasteleria-full-stack-final.vercel.app

3. **Probar Registro**: https://pasteleria-full-stack-final.vercel.app/registro

## ❓ PREGUNTAS

**Q: ¿Por qué Railway no ejecutó V7 automáticamente?**
A: Flyway marca el esquema como "corrupto" cuando una migración falla. No ejecutará migraciones futuras hasta que se repare manualmente.

**Q: ¿Perderé datos con estas opciones?**
A: 
- OPCIÓN 1A: NO - Solo elimina el registro de error de Flyway
- OPCIÓN 1B: NO - Reset de historial Flyway, NO de datos reales
- V7 execution: SÍ - V7 elimina TODOS los usuarios y órdenes (diseño intencional)

**Q: ¿Qué pasa si elimino V6?**
A: Flyway saltará la versión 6 y ejecutará V7 directamente (versión 5 → 7). Esto es válido en Flyway.
