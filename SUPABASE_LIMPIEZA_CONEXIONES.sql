-- ===================================================================
-- SUPABASE - LIMPIEZA DE CONEXIONES HUÉRFANAS/ZOMBIE
-- ===================================================================
-- Proyecto: Pastelería Mil Sabores
-- Fecha: 2025-12-02
-- Propósito: Eliminar conexiones PostgreSQL zombie que causan "Max client connections reached"

-- ===================================================================
-- PASO 1: VER CONEXIONES ACTIVAS (solo lectura - verificación)
-- ===================================================================
-- Ejecutar PRIMERO para verificar el estado actual
-- Muestra: pid, usuario, base de datos, estado, tiempo de espera

SELECT 
    pid,
    usename,
    datname,
    state,
    backend_start,
    state_change,
    query_start,
    wait_event_type,
    wait_event,
    EXTRACT(EPOCH FROM (NOW() - state_change)) AS seconds_since_state_change,
    query
FROM pg_stat_activity
WHERE datname = 'postgres'  -- Filtrar solo base de datos 'postgres' (Supabase default)
ORDER BY state_change ASC;

-- ===================================================================
-- PASO 2: CONTAR CONEXIONES POR ESTADO
-- ===================================================================
-- Ejecutar para ver cuántas conexiones hay en cada estado
-- Estados comunes: 'active', 'idle', 'idle in transaction'

SELECT 
    state,
    COUNT(*) AS count
FROM pg_stat_activity
WHERE datname = 'postgres'
GROUP BY state
ORDER BY count DESC;

-- ===================================================================
-- PASO 3: TERMINAR CONEXIONES IDLE (ZOMBIE)
-- ===================================================================
-- 🔴 CRÍTICO: Solo ejecutar si hay conexiones 'idle' o 'idle in transaction' antiguas
-- Termina conexiones inactivas por más de 5 minutos (300 segundos)

-- OPCIÓN A: Terminar SOLO conexiones IDLE (no activas)
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND state = 'idle'
  AND EXTRACT(EPOCH FROM (NOW() - state_change)) > 300  -- Más de 5 minutos inactivas
  AND pid <> pg_backend_pid();  -- No terminar la conexión actual

-- OPCIÓN B: Terminar conexiones IDLE IN TRANSACTION (más agresivo)
-- Solo ejecutar si hay crash loops de Railway
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND state = 'idle in transaction'
  AND EXTRACT(EPOCH FROM (NOW() - state_change)) > 60  -- Más de 1 minuto en transacción
  AND pid <> pg_backend_pid();

-- ===================================================================
-- PASO 4: TERMINAR TODAS LAS CONEXIONES (EMERGENCIA)
-- ===================================================================
-- ⚠️ USAR SOLO EN EMERGENCIA - Termina TODAS las conexiones excepto la actual
-- Ejecutar SOLO si Railway está en crash loop continuo y Supabase rechaza conexiones

-- CRÍTICO: Esto va a cortar todas las sesiones activas temporalmente
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND pid <> pg_backend_pid();  -- No terminar la conexión actual

-- ===================================================================
-- PASO 5: VERIFICAR LIMPIEZA (después de ejecutar PASO 3 o 4)
-- ===================================================================
-- Ejecutar después de terminar conexiones para confirmar limpieza

SELECT 
    state,
    COUNT(*) AS count
FROM pg_stat_activity
WHERE datname = 'postgres'
GROUP BY state
ORDER BY count DESC;

-- ===================================================================
-- NOTAS DE USO
-- ===================================================================
-- 1. Ejecutar desde Supabase Dashboard > SQL Editor
-- 2. PRIMERO ejecutar PASO 1 y PASO 2 para diagnóstico
-- 3. Si hay >10 conexiones idle, ejecutar PASO 3 OPCIÓN A
-- 4. Si Railway sigue crasheando, ejecutar PASO 3 OPCIÓN B
-- 5. En EMERGENCIA (Railway no puede deployar), ejecutar PASO 4
-- 6. Siempre ejecutar PASO 5 para verificar limpieza

-- LIMITACIONES SUPABASE FREE TIER:
-- - Max 20 conexiones totales (Transaction Pooler)
-- - Railway usa hasta 10 conexiones con maximumPoolSize=10 (bug actual)
-- - Fix: Reducir a 2 conexiones (commit 855608a)

-- DIAGNÓSTICO TÍPICO:
-- - Estado 'idle': Conexiones abiertas pero sin queries activas (Railway crash)
-- - Estado 'idle in transaction': Transacciones no cerradas (Flyway/HikariCP leak)
-- - Estado 'active': Queries en ejecución (normal)

-- DESPUÉS DE LIMPIEZA:
-- 1. Railway auto-redeploya desde commit 855608a
-- 2. HikariCP usa maximumPoolSize=2 (hardcodeado)
-- 3. Supabase debe tener <5 conexiones activas
-- 4. Si vuelve a fallar: verificar RAILWAY_VARIABLES_OBLIGATORIAS.md

-- ===================================================================
-- TROUBLESHOOTING
-- ===================================================================
-- Si después de limpieza Railway sigue fallando:
-- 1. Verificar variables Railway (DEPLOYMENT_FINAL.md)
-- 2. Borrar Build Cache en Railway Settings
-- 3. Redeploy manual forzado
-- 4. Verificar logs Railway para maximumPoolSize=2 (no 10)
