-- ===================================================================
-- MIGRACION V2 - ROW LEVEL SECURITY (RLS) SUPABASE
-- ===================================================================
-- Autor: Sistema Automatizado
-- Fecha: 2025-11-29
-- Descripcion: Configuracion de Row Level Security para Supabase
-- 
-- IMPORTANTE: Este archivo NO se ejecuta automaticamente via Flyway
-- Debe ejecutarse MANUALMENTE en Supabase Dashboard > SQL Editor
-- Razon: RLS requiere configuracion de autenticacion de Supabase
-- ===================================================================

-- ===================================================================
-- HABILITAR RLS EN TABLAS SENSIBLES
-- ===================================================================

-- Tabla: usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Tabla: ordenes
ALTER TABLE ordenes ENABLE ROW LEVEL SECURITY;

-- Tabla: detalles_orden
ALTER TABLE detalles_orden ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- POLITICAS RLS - TABLA USUARIOS
-- ===================================================================

-- Policy: Los usuarios pueden ver solo su propio registro
CREATE POLICY "usuarios_select_own" ON usuarios
    FOR SELECT
    USING (auth.uid()::text = correo);

-- Policy: Los usuarios pueden actualizar solo su propio registro
CREATE POLICY "usuarios_update_own" ON usuarios
    FOR UPDATE
    USING (auth.uid()::text = correo);

-- Policy: Admins pueden ver todos los usuarios
CREATE POLICY "usuarios_select_admin" ON usuarios
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            WHERE u.correo = auth.uid()::text
            AND r.nombre = 'ADMIN'
        )
    );

-- Policy: Permitir insercion de nuevos usuarios (registro publico)
CREATE POLICY "usuarios_insert_public" ON usuarios
    FOR INSERT
    WITH CHECK (true);

-- ===================================================================
-- POLITICAS RLS - TABLA ORDENES
-- ===================================================================

-- Policy: Los usuarios pueden ver solo sus propias ordenes
CREATE POLICY "ordenes_select_own" ON ordenes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = ordenes.usuario_id
            AND u.correo = auth.uid()::text
        )
    );

-- Policy: Los usuarios pueden crear ordenes para si mismos
CREATE POLICY "ordenes_insert_own" ON ordenes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = ordenes.usuario_id
            AND u.correo = auth.uid()::text
        )
    );

-- Policy: Admins y empleados pueden ver todas las ordenes
CREATE POLICY "ordenes_select_staff" ON ordenes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            WHERE u.correo = auth.uid()::text
            AND r.nombre IN ('ADMIN', 'EMPLEADO')
        )
    );

-- Policy: Admins y empleados pueden actualizar ordenes
CREATE POLICY "ordenes_update_staff" ON ordenes
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            WHERE u.correo = auth.uid()::text
            AND r.nombre IN ('ADMIN', 'EMPLEADO')
        )
    );

-- ===================================================================
-- POLITICAS RLS - TABLA DETALLES_ORDEN
-- ===================================================================

-- Policy: Los usuarios pueden ver detalles de sus propias ordenes
CREATE POLICY "detalles_select_own" ON detalles_orden
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ordenes o
            JOIN usuarios u ON o.usuario_id = u.id
            WHERE o.id = detalles_orden.orden_id
            AND u.correo = auth.uid()::text
        )
    );

-- Policy: Los usuarios pueden insertar detalles en sus propias ordenes
CREATE POLICY "detalles_insert_own" ON detalles_orden
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ordenes o
            JOIN usuarios u ON o.usuario_id = u.id
            WHERE o.id = detalles_orden.orden_id
            AND u.correo = auth.uid()::text
        )
    );

-- Policy: Admins y empleados pueden ver todos los detalles
CREATE POLICY "detalles_select_staff" ON detalles_orden
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            WHERE u.correo = auth.uid()::text
            AND r.nombre IN ('ADMIN', 'EMPLEADO')
        )
    );

-- ===================================================================
-- TABLAS PUBLICAS (SIN RLS)
-- ===================================================================
-- Las siguientes tablas NO tienen RLS porque son de solo lectura publica:
-- - roles: Datos publicos (CLIENTE, ADMIN, EMPLEADO)
-- - categorias: Catalogo publico
-- - productos: Catalogo publico
-- - variantes_producto: Catalogo publico
-- ===================================================================

-- ===================================================================
-- NOTAS IMPORTANTES
-- ===================================================================
-- 1. Este script debe ejecutarse MANUALMENTE en Supabase Dashboard
-- 2. Supabase usa auth.uid() para identificar al usuario autenticado
-- 3. En este proyecto, usamos correo como identificador (no Supabase Auth)
-- 4. Las policies asumen que auth.uid() retorna el correo del usuario
-- 
-- ALTERNATIVA SI NO USAS SUPABASE AUTH:
-- - Comentar todas las policies que usan auth.uid()
-- - Implementar autenticacion a nivel de Backend (Spring Security)
-- - RLS solo es necesario si usas Supabase Auth + conexion directa desde frontend
-- ===================================================================
