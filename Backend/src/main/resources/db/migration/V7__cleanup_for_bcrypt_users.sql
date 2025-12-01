-- ===================================================================
-- MIGRACION V7 - LIMPIEZA COMPLETA PARA USUARIOS BCRYPT
-- ===================================================================
-- Autor: Sistema Automatizado
-- Fecha: 2025-12-01
-- Descripcion: Eliminar TODAS las órdenes y usuarios antiguos antes de crear usuarios con BCrypt
-- ===================================================================

-- IMPORTANTE: Esta migración es DESTRUCTIVA
-- Elimina TODOS los datos de órdenes y usuarios para resetear con BCrypt

-- 1. Eliminar TODOS los detalles de órdenes primero (FK constraint detalles_orden -> ordenes)
DELETE FROM detalles_orden WHERE orden_id > 0;

-- 2. Eliminar TODAS las órdenes (FK constraint ordenes -> usuarios)
DELETE FROM ordenes WHERE id > 0;

-- 3. Eliminar TODOS los usuarios (ahora ya no hay FK violations)
DELETE FROM usuarios WHERE id > 0;

-- 4. Resetear secuencias para empezar desde ID=1
ALTER SEQUENCE usuarios_id_seq RESTART WITH 1;
ALTER SEQUENCE ordenes_id_seq RESTART WITH 1;
ALTER SEQUENCE detalles_orden_id_seq RESTART WITH 1;

-- 5. Insertar usuario administrador con password BCrypt
-- Correo: admin@milsabores.cl
-- Password: admin
-- Hash BCrypt: $2a$10$b8Daf5C1826zxcj5BCywW.oxAbpBs5r6/waPGslCtbjMjvuKJjb7i
INSERT INTO usuarios (rut, nombre, apellido, correo, password, direccion, region, comuna, rol_id)
VALUES (
    '11111111-1',
    'Administrador',
    'Sistema',
    'admin@milsabores.cl',
    '$2a$10$b8Daf5C1826zxcj5BCywW.oxAbpBs5r6/waPGslCtbjMjvuKJjb7i',
    'Av. Principal 123',
    'Metropolitana de Santiago',
    'Santiago',
    (SELECT id FROM roles WHERE nombre = 'ADMIN')
);

-- 6. Insertar usuario empleado de prueba
-- Correo: empleado@milsabores.cl
-- Password: admin (usa mismo hash para simplificar)
INSERT INTO usuarios (rut, nombre, apellido, correo, password, direccion, region, comuna, rol_id)
VALUES (
    '22222222-2',
    'Empleado',
    'Prueba',
    'empleado@milsabores.cl',
    '$2a$10$b8Daf5C1826zxcj5BCywW.oxAbpBs5r6/waPGslCtbjMjvuKJjb7i',
    'Av. Secundaria 456',
    'Metropolitana de Santiago',
    'Providencia',
    (SELECT id FROM roles WHERE nombre = 'EMPLEADO')
);

-- 7. Verificar inserción
DO $$
DECLARE
    admin_count INTEGER;
    empleado_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM usuarios WHERE correo = 'admin@milsabores.cl';
    SELECT COUNT(*) INTO empleado_count FROM usuarios WHERE correo = 'empleado@milsabores.cl';
    
    IF admin_count > 0 THEN
        RAISE NOTICE '✅ [V7] Usuario administrador creado correctamente con BCrypt';
    ELSE
        RAISE EXCEPTION '❌ [V7] Error: Usuario administrador no fue creado';
    END IF;
    
    IF empleado_count > 0 THEN
        RAISE NOTICE '✅ [V7] Usuario empleado creado correctamente con BCrypt';
    END IF;
    
    RAISE NOTICE '🔐 [V7] Credentials - admin@milsabores.cl / admin';
    RAISE NOTICE '🔐 [V7] Credentials - empleado@milsabores.cl / admin';
    RAISE NOTICE '⚠️  [V7] TODAS las órdenes anteriores han sido eliminadas';
END $$;
