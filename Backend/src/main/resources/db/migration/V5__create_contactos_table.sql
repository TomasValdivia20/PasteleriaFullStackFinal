-- ===================================================================
-- Migracion V5: Crear tabla contactos
-- Fecha: 2025-11-30
-- Descripcion: Tabla para almacenar mensajes de contacto enviados por usuarios
-- ===================================================================

CREATE TABLE contactos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    telefono VARCHAR(20),
    mensaje VARCHAR(2000) NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indices para optimizar consultas
CREATE INDEX idx_contactos_fecha_envio ON contactos(fecha_envio DESC);
CREATE INDEX idx_contactos_leido ON contactos(leido);
CREATE INDEX idx_contactos_email ON contactos(email);

-- Comentarios de documentacion
COMMENT ON TABLE contactos IS 'Mensajes de contacto enviados por usuarios del sitio web';
COMMENT ON COLUMN contactos.id IS 'Identificador unico del mensaje de contacto';
COMMENT ON COLUMN contactos.nombre IS 'Nombre completo de la persona que envia el mensaje';
COMMENT ON COLUMN contactos.email IS 'Email de contacto para responder';
COMMENT ON COLUMN contactos.telefono IS 'Telefono opcional (8-9 digitos formato chileno)';
COMMENT ON COLUMN contactos.mensaje IS 'Contenido del mensaje enviado';
COMMENT ON COLUMN contactos.fecha_envio IS 'Fecha y hora de envio del mensaje';
COMMENT ON COLUMN contactos.leido IS 'Indica si el administrador ya reviso este mensaje';
