-- ===================================================================
-- CONFIGURACION SUPABASE STORAGE - BUCKET "pasteles"
-- ===================================================================
-- IMPORTANTE: Este script debe ejecutarse MANUALMENTE en Supabase Dashboard
-- No se ejecuta automáticamente via Flyway
-- ===================================================================

-- 1. CREAR BUCKET (si no existe)
-- ===================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pasteles', 
    'pasteles', 
    TRUE, 
    10485760, -- 10 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = TRUE,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']::text[];

-- ===================================================================
-- 2. CONFIGURAR POLICIES - ACCESO PÚBLICO
-- ===================================================================

-- Policy: Lectura pública (SELECT)
-- Permite a cualquier usuario ver las imágenes
CREATE POLICY IF NOT EXISTS "Public Access - SELECT"
ON storage.objects FOR SELECT
USING (bucket_id = 'pasteles');

-- ===================================================================
-- 3. CONFIGURAR POLICIES - BACKEND AUTENTICADO
-- ===================================================================
-- Estas policies permiten que el backend (con supabase.key) pueda subir/eliminar

-- Policy: Upload de imágenes (INSERT)
CREATE POLICY IF NOT EXISTS "Backend Upload - INSERT"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pasteles');

-- Policy: Actualizar imágenes (UPDATE)
CREATE POLICY IF NOT EXISTS "Backend Update - UPDATE"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pasteles')
WITH CHECK (bucket_id = 'pasteles');

-- Policy: Eliminar imágenes (DELETE)
CREATE POLICY IF NOT EXISTS "Backend Delete - DELETE"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pasteles');

-- ===================================================================
-- 4. CONFIGURAR POLICIES - PERMITIR ACCESO ANÓNIMO (OPCIONAL)
-- ===================================================================
-- Si quieres que usuarios anónimos puedan subir desde el frontend directamente
-- (NO recomendado - mejor pasar por el backend)

-- DESCOMENTAR SOLO SI LO NECESITAS:
-- CREATE POLICY IF NOT EXISTS "Public Upload - INSERT"
-- ON storage.objects FOR INSERT
-- TO anon
-- WITH CHECK (bucket_id = 'pasteles');

-- ===================================================================
-- 5. VERIFICAR CONFIGURACIÓN
-- ===================================================================

-- Ver el bucket creado:
SELECT * FROM storage.buckets WHERE id = 'pasteles';

-- Ver las policies del bucket:
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%pasteles%';

-- ===================================================================
-- INSTRUCCIONES DE USO
-- ===================================================================
-- 1. Ir a Supabase Dashboard → SQL Editor
-- 2. Copiar y pegar este script completo
-- 3. Ejecutar (Run)
-- 4. Verificar en Storage → Buckets que aparece "pasteles"
-- 5. Verificar en Storage → Policies que aparecen las 4 policies
-- 
-- NOTA: Las policies "authenticated" requieren que uses supabase.key en las peticiones
-- El backend ya está configurado para usar esta key en ImagenProductoService.java
-- ===================================================================
