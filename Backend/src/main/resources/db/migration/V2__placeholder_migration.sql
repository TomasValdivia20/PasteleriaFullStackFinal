-- ===================================================================
-- MIGRACION V2 - PLACEHOLDER (Sin cambios en schema)
-- ===================================================================
-- Autor: Sistema Automatizado
-- Fecha: 2025-11-30
-- Descripcion: Placeholder migration para mantener compatibilidad con 
--              versiones anteriores que ejecutaron V2__disable_rls.sql
--              manualmente en Supabase.
-- 
-- CONTEXTO:
-- - Esta migración NO realiza cambios en el schema
-- - Existe solo para que Flyway no falle validation
-- - V2__enable_rls_MANUAL.sql.disabled fue ejecutado manualmente antes
-- - RLS (Row Level Security) no se usa porque el backend maneja autenticación
-- ===================================================================

-- Comentario de placeholder (no ejecuta DDL)
-- Esta migración es intencionalmente vacía para mantener historial de versiones

SELECT 1 AS placeholder_migration_v2;

-- ===================================================================
-- NOTAS IMPORTANTES
-- ===================================================================
-- 1. Si Flyway falla con "migration checksum mismatch", ejecutar:
--    DELETE FROM flyway_schema_history WHERE version = '2';
--    Y redeployar
-- 
-- 2. RLS está DESHABILITADO en todas las tablas porque usamos:
--    - Spring Security en Backend
--    - JWT tokens para autenticación
--    - NO usamos Supabase Auth
-- 
-- 3. Para verificar estado de RLS en Supabase:
--    SELECT tablename, rowsecurity 
--    FROM pg_tables 
--    WHERE schemaname = 'public';
-- ===================================================================
