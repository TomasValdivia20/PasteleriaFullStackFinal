-- ===================================================================
-- MIGRACION V4 - DATOS INICIALES DE AUTENTICACION
-- ===================================================================
-- Autor: Sistema Automatizado
-- Fecha: 2025-11-30
-- Descripcion: Insertar roles y usuario administrador
-- ===================================================================

-- Insertar roles si no existen
INSERT INTO roles (nombre) VALUES ('ADMIN')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO roles (nombre) VALUES ('CLIENTE')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO roles (nombre) VALUES ('EMPLEADO')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar usuario administrador
-- Correo: admin@milsabores.cl
-- Password: admin (en producción debería estar hasheado con BCrypt)
INSERT INTO usuarios (rut, nombre, apellido, correo, password, direccion, region, comuna, rol_id)
VALUES (
    '11111111-1',
    'Administrador',
    'Sistema',
    'admin@milsabores.cl',
    'admin',
    'Av. Principal 123',
    'Metropolitana',
    'Santiago',
    (SELECT id FROM roles WHERE nombre = 'ADMIN')
)
ON CONFLICT (correo) DO NOTHING;

-- Verificar inserción
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM usuarios WHERE correo = 'admin@milsabores.cl') THEN
        RAISE NOTICE '✅ Usuario administrador creado correctamente';
    END IF;
END $$;
