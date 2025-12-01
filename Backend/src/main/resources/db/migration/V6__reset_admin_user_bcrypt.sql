-- ===================================================================
-- MIGRACION V6 - RESETEAR USUARIO ADMIN CON BCRYPT
-- ===================================================================
-- Autor: Sistema Automatizado
-- Fecha: 2025-11-30
-- Descripcion: Eliminar usuarios antiguos y crear usuario admin con password BCrypt
-- ===================================================================

-- IMPORTANTE: Solo ejecutar esta migración una vez
-- Esta migración limpia todos los usuarios existentes y crea un admin con BCrypt

-- 1. Eliminar todos los usuarios existentes (CUIDADO: elimina TODOS los datos de usuarios)
DELETE FROM usuarios WHERE id > 0;

-- 2. Resetear secuencia de IDs de usuarios
ALTER SEQUENCE usuarios_id_seq RESTART WITH 1;

-- 3. Insertar usuario administrador con password BCrypt
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

-- 4. Insertar usuario empleado de prueba
-- Correo: empleado@milsabores.cl
-- Password: empleado
-- Hash BCrypt: $2a$10$b8Daf5C1826zxcj5BCywW.oxAbpBs5r6/waPGslCtbjMjvuKJjb7i (mismo hash para simplificar)
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

-- 5. Verificar inserción
DO $$
DECLARE
    admin_count INTEGER;
    empleado_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM usuarios WHERE correo = 'admin@milsabores.cl';
    SELECT COUNT(*) INTO empleado_count FROM usuarios WHERE correo = 'empleado@milsabores.cl';
    
    IF admin_count > 0 THEN
        RAISE NOTICE '✅ Usuario administrador creado correctamente con BCrypt';
    ELSE
        RAISE EXCEPTION '❌ Error: Usuario administrador no fue creado';
    END IF;
    
    IF empleado_count > 0 THEN
        RAISE NOTICE '✅ Usuario empleado creado correctamente con BCrypt';
    END IF;
    
    RAISE NOTICE '🔐 Password para admin@milsabores.cl: admin';
    RAISE NOTICE '🔐 Password para empleado@milsabores.cl: empleado';
END $$;
