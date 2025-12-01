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
-- 🔴 PASO 3: TERMINAR CONEXIONES ZOMBIES - MÉTODO SUPABASE
-- ===================================================================
-- ⚠️ ERROR COMÚN: pg_terminate_backend() requiere permisos SUPERUSER
-- ❌ "ERROR: 42501: permission denied to terminate process"
--
-- ✅ SOLUCIÓN: Usar SUPABASE DASHBOARD (GUI) en vez de SQL

-- 🚫 ESTE MÉTODO NO FUNCIONA EN SUPABASE FREE TIER:
-- SELECT pg_terminate_backend(pid) 
-- FROM pg_stat_activity 
-- WHERE datname = 'postgres' AND pid <> pg_backend_pid();

-- ===================================================================
-- ✅ MÉTODO CORRECTO: PAUSAR/REANUDAR BASE DE DATOS
-- ===================================================================
--
-- OPCIÓN A: PAUSAR DATABASE (Cierra TODAS las conexiones)
-- =========================================================
-- 1. Ir a: Supabase Dashboard → Project Settings → Database
-- 2. Scroll hasta "Pause Project"
-- 3. Click en "Pause Project" → Confirmar
-- 4. Esperar 30-60 segundos
-- 5. Click en "Resume Project"
-- 6. Resultado: TODAS las conexiones zombies terminadas
--
-- ⚠️ IMPACTO: 
--    - Downtime: ~1-2 minutos
--    - Todas las apps desconectadas (incluyendo Railway)
--    - Railway reconectará automáticamente al reanudar
--
-- ===================================================================
-- ✅ OPCIÓN B: RESTART POOLER (Sin downtime de DB)
-- ===================================================================
-- 1. Ir a: Supabase Dashboard → Project Settings → Database
-- 2. Sección "Connection Pooling"
-- 3. Click en "Restart Pooler" (si disponible)
-- 4. Resultado: Cierra conexiones del pooler (menos agresivo)
--
-- ⚠️ NOTA: Esta opción puede no estar disponible en Free Tier
--
-- ===================================================================
-- ✅ OPCIÓN C: CAMBIAR PASSWORD DATABASE (Fuerza desconexión)
-- ===================================================================
-- 1. Ir a: Supabase Dashboard → Project Settings → Database
-- 2. Sección "Database Password"
-- 3. Click en "Reset Database Password"
-- 4. Copiar nuevo password
-- 5. Actualizar DATABASE_URL en Railway con nuevo password
-- 6. Resultado: Conexiones viejas no pueden autenticar (mueren)
--
-- ⚠️ IMPORTANTE: 
--    - Actualizar password en Railway INMEDIATAMENTE
--    - Formato DATABASE_URL:
--      jdbc:postgresql://aws-0-us-west-1.pooler.supabase.com:6543/postgres?user=postgres.TU_PROJECT&password=NUEVO_PASSWORD
--
-- ===================================================================

-- 🔍 Verificar conexiones antes de continuar
SELECT 
    count(*) as total_conexiones,
    state
FROM pg_stat_activity 
WHERE datname = 'postgres'
GROUP BY state;

-- Si ves conexiones zombies después de PAUSAR/REANUDAR:
-- Ejecutar OPCIÓN C (cambiar password)

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
