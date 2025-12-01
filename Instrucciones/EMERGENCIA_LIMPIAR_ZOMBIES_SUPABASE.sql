-- ===================================================================
-- 🔴 SCRIPT DE EMERGENCIA - LIMPIAR CONEXIONES ZOMBIES SUPABASE
-- ===================================================================
-- CUÁNDO USAR: Si Railway crashea con "Max client connections reached"
-- DÓNDE: Supabase Dashboard → SQL Editor → Pegar y ejecutar
-- ===================================================================

-- PASO 1: Ver estado actual de conexiones
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change,
    now() - query_start as duracion_query,
    now() - state_change as duracion_estado,
    wait_event_type,
    wait_event,
    query
FROM pg_stat_activity 
WHERE datname = 'postgres'
ORDER BY state_change DESC;

-- ===================================================================

-- PASO 2: Contar conexiones por estado
SELECT 
    state,
    count(*) as cantidad
FROM pg_stat_activity 
WHERE datname = 'postgres'
GROUP BY state
ORDER BY cantidad DESC;

-- ===================================================================
-- 🔴 PASO 3: TERMINAR TODAS LAS CONEXIONES ZOMBIES (CRÍTICO)
-- ===================================================================
-- ⚠️ Este comando terminará TODAS las conexiones excepto la actual

SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'postgres' 
  AND pid <> pg_backend_pid()
  AND state IN (
      'idle', 
      'idle in transaction', 
      'idle in transaction (aborted)', 
      'disabled'
  );

-- Resultado esperado: 
-- pg_terminate_backend
-- ----------------------
--          t
--          t
--          t
-- (N rows) donde N = cantidad de conexiones zombies terminadas

-- ===================================================================

-- PASO 4: Verificar limpieza exitosa
SELECT count(*) as conexiones_activas 
FROM pg_stat_activity 
WHERE datname = 'postgres';

-- ✅ Resultado esperado: conexiones_activas = 1 (solo esta sesión SQL)
-- ❌ Si > 1: Repetir PASO 3

-- ===================================================================

-- PASO 5: Verificar que no hay zombies residuales
SELECT 
    pid,
    state,
    application_name,
    now() - state_change as tiempo_en_estado
FROM pg_stat_activity 
WHERE datname = 'postgres'
  AND state IN ('idle in transaction', 'idle in transaction (aborted)');

-- ✅ Resultado esperado: 0 rows (sin zombies)
-- ❌ Si encuentra rows: Ejecutar manualmente:
--     SELECT pg_terminate_backend(PID_AQUI);

-- ===================================================================
-- 📊 MONITOREO CONTINUO (Ejecutar cada 1-2 horas primeras 24h)
-- ===================================================================

-- Ver resumen de conexiones actuales
SELECT 
    count(*) as total,
    state,
    application_name
FROM pg_stat_activity 
WHERE datname = 'postgres'
GROUP BY state, application_name
ORDER BY total DESC;

-- ✅ Normal: total = 1-2
-- ⚠️ Investigar: total = 3-5
-- 🔴 CRÍTICO: total > 10 (zombies regresaron)

-- ===================================================================
-- 🆘 SI LOS ZOMBIES REGRESAN INMEDIATAMENTE
-- ===================================================================
-- Posibles causas:
-- 1. Railway aún no tiene configuración HIKARI_MAX_POOL_SIZE=1
-- 2. Flyway sigue habilitado (consume conexión extra)
-- 3. Application leak (código no cierra conexiones)

-- Verificar variables Railway:
-- - HIKARI_MAX_POOL_SIZE=1 ✅
-- - FLYWAY_ENABLED=false ✅
-- - SPRING_PROFILES_ACTIVE=production ✅

-- ===================================================================
-- 🔧 TERMINAR CONEXIÓN ESPECÍFICA (Si PASO 3 no funciona)
-- ===================================================================

-- Ejemplo: Terminar conexión con PID específico
-- SELECT pg_terminate_backend(12345);  -- Reemplazar 12345 con PID real

-- Para terminar múltiples PIDs específicos:
-- SELECT pg_terminate_backend(pid) 
-- FROM pg_stat_activity 
-- WHERE pid IN (12345, 12346, 12347);  -- Lista de PIDs

-- ===================================================================
-- 📝 NOTAS IMPORTANTES
-- ===================================================================
-- 
-- ⚠️ pg_terminate_backend() es SAFE:
--    - Solo termina conexiones a la base de datos
--    - NO afecta el servidor PostgreSQL
--    - NO daña datos ni transacciones
--    - Railway detectará desconexión y reconectará automáticamente
--
-- ⚠️ CUÁNDO ejecutar este script:
--    - Railway logs muestran "Max client connections reached"
--    - Backend no puede iniciar (HikariPool fail)
--    - ANTES de cada redeploy Railway (preventivo)
--
-- ⚠️ FRECUENCIA:
--    - Después de cada crash: INMEDIATAMENTE
--    - Antes de redeploy: RECOMENDADO
--    - Monitoreo: Cada 1-2 horas (primeras 24h)
--
-- ===================================================================
