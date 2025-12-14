-- ===================================================================
-- MIGRACION V8 - AGREGAR ESTADO 'ENTREGADA' A ORDENES
-- ===================================================================
-- Autor: Sistema Automatizado
-- Fecha: 2025-12-14
-- Descripcion: Permitir estado 'ENTREGADA' en tabla ordenes
-- Razon: Funcionalidad Backoffice requiere marcar pedidos como entregados
-- ===================================================================

-- Paso 1: Eliminar constraint existente que solo permite 4 estados
ALTER TABLE ordenes DROP CONSTRAINT IF EXISTS chk_orden_estado;

-- Paso 2: Agregar nuevo constraint con 5 estados (incluyendo ENTREGADA)
ALTER TABLE ordenes ADD CONSTRAINT chk_orden_estado 
    CHECK (estado IN ('PENDIENTE', 'PROCESANDO', 'COMPLETADA', 'ENTREGADA', 'CANCELADA'));

-- Comentario actualizado
COMMENT ON COLUMN ordenes.estado IS 'Estado de la orden (PENDIENTE, PROCESANDO, COMPLETADA, ENTREGADA, CANCELADA)';

-- ===================================================================
-- FIN DE MIGRACION V8
-- ===================================================================
