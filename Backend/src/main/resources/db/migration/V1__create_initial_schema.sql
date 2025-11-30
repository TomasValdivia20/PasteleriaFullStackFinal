-- ===================================================================
-- MIGRACION INICIAL - SCHEMA PASTELERIA MIL SABORES
-- ===================================================================
-- Autor: Sistema Automatizado
-- Fecha: 2025-11-29
-- Descripcion: Creacion de estructura completa de base de datos PostgreSQL
-- Basado en entidades JPA del Backend
-- ===================================================================

-- Tabla: roles
-- Descripcion: Roles de usuario (CLIENTE, ADMIN, EMPLEADO)
-- ===================================================================
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Comentarios de columnas
COMMENT ON TABLE roles IS 'Roles de usuario del sistema (CLIENTE, ADMIN, EMPLEADO)';
COMMENT ON COLUMN roles.id IS 'Identificador único del rol';
COMMENT ON COLUMN roles.nombre IS 'Nombre del rol (debe ser único)';

-- ===================================================================
-- Tabla: usuarios
-- Descripcion: Usuarios registrados en el sistema
-- ===================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    rut VARCHAR(12) NOT NULL UNIQUE,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    correo VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    direccion VARCHAR(500),
    region VARCHAR(100),
    comuna VARCHAR(100),
    rol_id BIGINT NOT NULL,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Indices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_usuarios_rut ON usuarios(rut);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol_id);

-- Comentarios
COMMENT ON TABLE usuarios IS 'Usuarios registrados en el sistema';
COMMENT ON COLUMN usuarios.id IS 'Identificador único del usuario';
COMMENT ON COLUMN usuarios.rut IS 'RUT del usuario (único, formato: 12345678-9)';
COMMENT ON COLUMN usuarios.correo IS 'Correo electrónico (único, usado para login)';
COMMENT ON COLUMN usuarios.password IS 'Contraseña encriptada (BCrypt)';
COMMENT ON COLUMN usuarios.rol_id IS 'FK al rol del usuario (CLIENTE, ADMIN, EMPLEADO)';

-- ===================================================================
-- Tabla: categorias
-- Descripcion: Categorias de productos (Pasteles, Tortas, etc.)
-- ===================================================================
CREATE TABLE IF NOT EXISTS categorias (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(500)
);

-- Indice para búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_categorias_nombre ON categorias(nombre);

-- Comentarios
COMMENT ON TABLE categorias IS 'Categorías de productos (Pasteles, Tortas, Galletas, etc.)';
COMMENT ON COLUMN categorias.id IS 'Identificador único de la categoría';
COMMENT ON COLUMN categorias.nombre IS 'Nombre de la categoría';
COMMENT ON COLUMN categorias.descripcion IS 'Descripción detallada de la categoría';
COMMENT ON COLUMN categorias.imagen IS 'URL o path de la imagen de la categoría';

-- ===================================================================
-- Tabla: productos
-- Descripcion: Productos disponibles en la pastelería
-- ===================================================================
CREATE TABLE IF NOT EXISTS productos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(500),
    precio_base INTEGER,
    categoria_id BIGINT,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);

-- Comentarios
COMMENT ON TABLE productos IS 'Productos disponibles en la pastelería';
COMMENT ON COLUMN productos.id IS 'Identificador único del producto';
COMMENT ON COLUMN productos.nombre IS 'Nombre del producto';
COMMENT ON COLUMN productos.descripcion IS 'Descripción detallada del producto (max 1000 caracteres)';
COMMENT ON COLUMN productos.precio_base IS 'Precio base en pesos chilenos (sin decimales)';
COMMENT ON COLUMN productos.categoria_id IS 'FK a categoría (ON DELETE CASCADE)';

-- ===================================================================
-- Tabla: variantes_producto
-- Descripcion: Variantes de productos (tamaños, versiones, etc.)
-- ===================================================================
CREATE TABLE IF NOT EXISTS variantes_producto (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    precio INTEGER,
    stock INTEGER DEFAULT 0,
    info_nutricional VARCHAR(500),
    producto_id BIGINT NOT NULL,
    CONSTRAINT fk_variante_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_variantes_producto ON variantes_producto(producto_id);

-- Comentarios
COMMENT ON TABLE variantes_producto IS 'Variantes de productos (tamaños, versiones, etc.)';
COMMENT ON COLUMN variantes_producto.id IS 'Identificador único de la variante';
COMMENT ON COLUMN variantes_producto.nombre IS 'Nombre de la variante (ej: "Pequeño", "Mediano", "Grande")';
COMMENT ON COLUMN variantes_producto.precio IS 'Precio de esta variante (sobrescribe precio_base si existe)';
COMMENT ON COLUMN variantes_producto.stock IS 'Stock disponible de esta variante';
COMMENT ON COLUMN variantes_producto.info_nutricional IS 'Información nutricional (max 500 caracteres)';
COMMENT ON COLUMN variantes_producto.producto_id IS 'FK al producto padre (ON DELETE CASCADE)';

-- ===================================================================
-- Tabla: ordenes
-- Descripcion: Ordenes de compra de clientes
-- ===================================================================
CREATE TABLE IF NOT EXISTS ordenes (
    id BIGSERIAL PRIMARY KEY,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total INTEGER NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    usuario_id BIGINT NOT NULL,
    CONSTRAINT fk_orden_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_orden_estado CHECK (estado IN ('PENDIENTE', 'PROCESANDO', 'COMPLETADA', 'CANCELADA'))
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_ordenes_usuario ON ordenes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha ON ordenes(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes(estado);

-- Comentarios
COMMENT ON TABLE ordenes IS 'Órdenes de compra realizadas por clientes';
COMMENT ON COLUMN ordenes.id IS 'Identificador único de la orden';
COMMENT ON COLUMN ordenes.fecha IS 'Fecha y hora de creación de la orden';
COMMENT ON COLUMN ordenes.total IS 'Monto total en pesos chilenos (sin decimales)';
COMMENT ON COLUMN ordenes.estado IS 'Estado de la orden (PENDIENTE, PROCESANDO, COMPLETADA, CANCELADA)';
COMMENT ON COLUMN ordenes.usuario_id IS 'FK al usuario que realizó la orden (ON DELETE RESTRICT)';

-- ===================================================================
-- Tabla: detalles_orden
-- Descripcion: Items individuales de cada orden
-- ===================================================================
CREATE TABLE IF NOT EXISTS detalles_orden (
    id BIGSERIAL PRIMARY KEY,
    cantidad INTEGER NOT NULL,
    precio_unitario INTEGER NOT NULL,
    subtotal INTEGER NOT NULL,
    orden_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    variante_id BIGINT,
    CONSTRAINT fk_detalle_orden FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_detalle_variante FOREIGN KEY (variante_id) REFERENCES variantes_producto(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_detalle_precio CHECK (precio_unitario > 0),
    CONSTRAINT chk_detalle_subtotal CHECK (subtotal > 0)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_detalles_orden ON detalles_orden(orden_id);
CREATE INDEX IF NOT EXISTS idx_detalles_producto ON detalles_orden(producto_id);
CREATE INDEX IF NOT EXISTS idx_detalles_variante ON detalles_orden(variante_id);

-- Comentarios
COMMENT ON TABLE detalles_orden IS 'Items individuales de cada orden de compra';
COMMENT ON COLUMN detalles_orden.id IS 'Identificador único del detalle';
COMMENT ON COLUMN detalles_orden.cantidad IS 'Cantidad de unidades (debe ser > 0)';
COMMENT ON COLUMN detalles_orden.precio_unitario IS 'Precio por unidad al momento de la compra';
COMMENT ON COLUMN detalles_orden.subtotal IS 'Total del item (cantidad * precio_unitario)';
COMMENT ON COLUMN detalles_orden.orden_id IS 'FK a la orden (ON DELETE CASCADE)';
COMMENT ON COLUMN detalles_orden.producto_id IS 'FK al producto (ON DELETE RESTRICT)';
COMMENT ON COLUMN detalles_orden.variante_id IS 'FK a variante opcional (ON DELETE SET NULL)';

-- ===================================================================
-- DATOS INICIALES - ROLES
-- ===================================================================
INSERT INTO roles (nombre) VALUES 
    ('CLIENTE'),
    ('ADMIN'),
    ('EMPLEADO')
ON CONFLICT (nombre) DO NOTHING;

-- ===================================================================
-- FIN DE MIGRACION V1
-- ===================================================================
