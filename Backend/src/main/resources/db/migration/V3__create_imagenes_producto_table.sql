-- ===================================================================
-- MIGRACION V3 - SUPABASE STORAGE INTEGRATION
-- ===================================================================
-- Autor: Sistema Automatizado
-- Fecha: 2025-11-30
-- Descripcion: Crear tabla para almacenar referencias a imágenes en Supabase Storage
-- ===================================================================

-- Tabla: imagenes_producto
-- Descripcion: Almacena URLs y metadatos de imágenes en Supabase Storage
-- ===================================================================
CREATE TABLE IF NOT EXISTS imagenes_producto (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    url_supabase VARCHAR(500) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100),
    tamano_bytes BIGINT,
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,
    orden INTEGER NOT NULL DEFAULT 0,
    fecha_carga TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_imagen_producto FOREIGN KEY (producto_id) 
        REFERENCES productos(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Constraint: Solo una imagen principal por producto
    CONSTRAINT chk_solo_una_principal_por_producto 
        EXCLUDE USING gist (producto_id WITH =, es_principal WITH =) 
        WHERE (es_principal = TRUE)
);

-- Indices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_imagenes_producto ON imagenes_producto(producto_id);
CREATE INDEX IF NOT EXISTS idx_imagenes_principal ON imagenes_producto(producto_id, es_principal) WHERE es_principal = TRUE;
CREATE INDEX IF NOT EXISTS idx_imagenes_orden ON imagenes_producto(producto_id, orden);

-- Comentarios
COMMENT ON TABLE imagenes_producto IS 'Referencias a imágenes almacenadas en Supabase Storage bucket "pasteles"';
COMMENT ON COLUMN imagenes_producto.id IS 'Identificador único de la imagen';
COMMENT ON COLUMN imagenes_producto.producto_id IS 'FK al producto (ON DELETE CASCADE)';
COMMENT ON COLUMN imagenes_producto.url_supabase IS 'URL pública completa: https://[project-ref].supabase.co/storage/v1/object/public/pasteles/[filename]';
COMMENT ON COLUMN imagenes_producto.nombre_archivo IS 'Nombre del archivo en Storage (formato: producto_123_imagen1.jpg)';
COMMENT ON COLUMN imagenes_producto.tipo_mime IS 'Tipo MIME (image/jpeg, image/png, image/webp)';
COMMENT ON COLUMN imagenes_producto.tamano_bytes IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN imagenes_producto.es_principal IS 'Imagen principal del producto (solo una por producto)';
COMMENT ON COLUMN imagenes_producto.orden IS 'Orden de visualización de la imagen';
COMMENT ON COLUMN imagenes_producto.fecha_carga IS 'Fecha y hora de carga de la imagen';

-- ===================================================================
-- CONFIGURACION SUPABASE STORAGE
-- ===================================================================
-- IMPORTANTE: Este script SQL NO configura Supabase Storage
-- Debes ejecutar MANUALMENTE en Supabase Dashboard → SQL Editor:
--
-- 1. Crear bucket (si no existe):
--    INSERT INTO storage.buckets (id, name, public)
--    VALUES ('pasteles', 'pasteles', TRUE)
--    ON CONFLICT (id) DO NOTHING;
--
-- 2. Configurar policies (permitir acceso público a lectura):
--    CREATE POLICY "Public Access"
--    ON storage.objects FOR SELECT
--    USING (bucket_id = 'pasteles');
--
--    CREATE POLICY "Authenticated users can upload"
--    ON storage.objects FOR INSERT
--    WITH CHECK (bucket_id = 'pasteles');
--
--    CREATE POLICY "Authenticated users can update"
--    ON storage.objects FOR UPDATE
--    USING (bucket_id = 'pasteles');
--
--    CREATE POLICY "Authenticated users can delete"
--    ON storage.objects FOR DELETE
--    USING (bucket_id = 'pasteles');
--
-- Ver documentación completa en: CONFIGURACION_RAILWAY_SUPABASE.md
-- ===================================================================

-- ===================================================================
-- FIN DE MIGRACION V3
-- ===================================================================
