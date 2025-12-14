-- ===================================================================
-- SCRIPT MANUAL PARA SUPABASE (BACKUP)
-- ===================================================================
-- Descripción: Agregar estado 'ENTREGADA' a constraint de tabla ordenes
-- Fecha: 2025-12-14
-- Razón: Flyway ejecutará automáticamente V8, pero este script es backup
-- ===================================================================

-- INSTRUCCIONES:
-- 1. Este script ES IDEMPOTENTE (se puede ejecutar múltiples veces sin problemas)
-- 2. Flyway lo aplicará automáticamente en Railway al detectar V8
-- 3. SOLO usar este script manualmente SI Flyway falla en Railway

-- VERIFICAR CONSTRAINT ACTUAL (antes de ejecutar):
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'ordenes'::regclass AND conname = 'chk_orden_estado';

BEGIN;

-- Paso 1: Eliminar constraint existente
ALTER TABLE ordenes DROP CONSTRAINT IF EXISTS chk_orden_estado;

-- Paso 2: Agregar nuevo constraint con ENTREGADA
ALTER TABLE ordenes ADD CONSTRAINT chk_orden_estado 
    CHECK (estado IN ('PENDIENTE', 'PROCESANDO', 'COMPLETADA', 'ENTREGADA', 'CANCELADA'));

-- Paso 3: Actualizar comentario
COMMENT ON COLUMN ordenes.estado IS 'Estado de la orden (PENDIENTE, PROCESANDO, COMPLETADA, ENTREGADA, CANCELADA)';

COMMIT;

-- VERIFICAR CONSTRAINT NUEVO (después de ejecutar):
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'ordenes'::regclass AND conname = 'chk_orden_estado';

-- ===================================================================
-- FIN DEL SCRIPT
-- ===================================================================
