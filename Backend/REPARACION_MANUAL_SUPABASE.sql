-- ===================================================================
-- SCRIPT DE REPARACIÓN MANUAL PARA SUPABASE
-- ===================================================================
-- EJECUTAR SOLO SI RAILWAY SIGUE FALLANDO DESPUÉS DEL PUSH b79ac70
-- ===================================================================

-- PASO 1: Verificar estado actual de Flyway
SELECT 
    installed_rank,
    version,
    description,
    success,
    installed_on
FROM flyway_schema_history
ORDER BY installed_rank DESC;

-- PASO 2: Eliminar registro fallido de V6 (si existe)
-- ⚠️ IMPORTANTE: Solo ejecutar si ves success=false para version='6'
DELETE FROM flyway_schema_history 
WHERE version = '6' AND success = false;

-- PASO 3: Verificar eliminación
SELECT version, success FROM flyway_schema_history WHERE version = '6';
-- Debería retornar 0 filas

-- PASO 4: Confirmar que solo existe V1-V5 exitosas
SELECT version, description, success 
FROM flyway_schema_history 
ORDER BY installed_rank;

-- ===================================================================
-- DESPUÉS DE EJECUTAR ESTE SCRIPT:
-- ===================================================================
-- 1. Railway reiniciará automáticamente (ya está en progreso)
-- 2. Flyway verá: Current version = 5
-- 3. Flyway buscará migraciones pendientes en JAR
-- 4. Flyway encontrará solo V7 (V6 fue eliminado del código)
-- 5. Flyway ejecutará V7: DELETE ordenes -> DELETE usuarios -> CREATE admin/empleado
-- 6. Backend iniciará exitosamente
-- ===================================================================

-- VERIFICACIÓN POST-MIGRACIÓN (ejecutar después de que Railway inicie):
-- Ver usuarios creados por V7
SELECT id, rut, nombre, correo, rol_id 
FROM usuarios 
ORDER BY id;
-- Debería mostrar:
-- 1 | 11111111-1 | Administrador | admin@milsabores.cl | (rol ADMIN)
-- 2 | 22222222-2 | Empleado | empleado@milsabores.cl | (rol EMPLEADO)

-- Ver historial Flyway actualizado
SELECT installed_rank, version, description, success 
FROM flyway_schema_history 
ORDER BY installed_rank;
-- Debería incluir nuevo registro:
-- 6 | 7 | cleanup for bcrypt users | true

-- NOTA IMPORTANTE:
-- La versión en flyway_schema_history será "7" (no "6")
-- Esto es CORRECTO - Flyway permite saltar versiones
