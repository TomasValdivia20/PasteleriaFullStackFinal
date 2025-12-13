-- =====================================================================
-- SCRIPT: Inserción de Variantes de Productos (Tamaños)
-- DESCRIPCIÓN: Limpiar y repoblar tabla variantes_producto con datos reales
-- FECHA: 2025-12-13
-- AUTOR: Sistema
-- =====================================================================
-- ⚠️ IMPORTANTE: Este script ELIMINA todas las variantes existentes
-- =====================================================================

-- Paso 1: Limpiar variantes existentes
-- =====================================================================
DELETE FROM variantes_producto;

-- Reiniciar secuencia de IDs (opcional, para mantener IDs limpios)
ALTER SEQUENCE variantes_producto_id_seq RESTART WITH 1;

-- Paso 2: Insertar Variantes de Productos
-- =====================================================================

-- PRODUCTO 1: Torta Selva Negra (producto_id: 1)
-- Categoría: Bizcochuelos (categoriaId: 1)
-- 7 tamaños disponibles
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('12 Personas', 42000, 20, 'Peso: 2.2kg | Energía: 6480kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 1),
('16 Personas', 56000, 15, 'Peso: 2.9kg | Energía: 8640kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 1),
('20 Personas', 70000, 12, 'Peso: 3.6kg | Energía: 10800kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 1),
('25 Personas', 87500, 10, 'Peso: 4.5kg | Energía: 13500kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 1),
('30 Personas', 105000, 8, 'Peso: 5.4kg | Energía: 16200kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 1),
('40 Personas', 119550, 5, 'Peso: 7.2kg | Energía: 21600kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 1),
('50 Personas', 134100, 3, 'Peso: 9.0kg | Energía: 27000kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 1);

-- PRODUCTO 2: Torta Tres Leches (producto_id: 2)
-- Categoría: Bizcochuelos (categoriaId: 1)
-- 7 tamaños disponibles
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('12 Personas', 42000, 20, 'Peso: 2.2kg | Energía: 6480kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 2),
('16 Personas', 56000, 15, 'Peso: 2.9kg | Energía: 8640kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 2),
('20 Personas', 70000, 12, 'Peso: 3.6kg | Energía: 10800kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 2),
('25 Personas', 87500, 10, 'Peso: 4.5kg | Energía: 13500kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 2),
('30 Personas', 105000, 8, 'Peso: 5.4kg | Energía: 16200kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 2),
('40 Personas', 119550, 5, 'Peso: 7.2kg | Energía: 21600kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 2),
('50 Personas', 134100, 3, 'Peso: 9.0kg | Energía: 27000kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 2);

-- PRODUCTO 3: Brazo de Reina Lúcuma (producto_id: 3)
-- Categoría: Brazos de Reina (categoriaId: 2)
-- Tamaño único
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('Tamaño Único', 42000, 25, 'Peso: 1.8kg | Energía: 5900kcal | Porción: 490kcal | Proteínas: 6g | Grasas: 28g | Carbohidratos: 58g | Azúcares: 42g | Sodio: 280mg', 3);

-- PRODUCTO 4: Brazo de Reina Mocca (producto_id: 4)
-- Categoría: Brazos de Reina (categoriaId: 2)
-- Tamaño único
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('Tamaño Único', 42000, 25, 'Peso: 1.8kg | Energía: 6050kcal | Porción: 505kcal | Proteínas: 6g | Grasas: 29g | Carbohidratos: 60g | Azúcares: 43g | Sodio: 285mg', 4);

-- PRODUCTO 5: Torta Hojarasca Manjar Chantilly Nuez (producto_id: 5)
-- Categoría: Hojarasca (categoriaId: 3)
-- 7 tamaños disponibles
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('12 Personas', 42000, 18, 'Peso: 2.2kg | Energía: 6480kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 5),
('16 Personas', 56000, 14, 'Peso: 2.9kg | Energía: 8640kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 5),
('20 Personas', 70000, 11, 'Peso: 3.6kg | Energía: 10800kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 5),
('25 Personas', 87500, 9, 'Peso: 4.5kg | Energía: 13500kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 5),
('30 Personas', 105000, 7, 'Peso: 5.4kg | Energía: 16200kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 5),
('40 Personas', 119550, 4, 'Peso: 7.2kg | Energía: 21600kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 5),
('50 Personas', 134100, 2, 'Peso: 9.0kg | Energía: 27000kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 5);

-- PRODUCTO 6: Torta Hojarasca Manjar con Frambuesa (producto_id: 6)
-- Categoría: Hojarasca (categoriaId: 3)
-- 7 tamaños disponibles
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('12 Personas', 42000, 18, 'Peso: 2.2kg | Energía: 6480kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 6),
('16 Personas', 56000, 14, 'Peso: 2.9kg | Energía: 8640kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 6),
('20 Personas', 70000, 11, 'Peso: 3.6kg | Energía: 10800kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 6),
('25 Personas', 87500, 9, 'Peso: 4.5kg | Energía: 13500kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 6),
('30 Personas', 105000, 7, 'Peso: 5.4kg | Energía: 16200kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 6),
('40 Personas', 119550, 4, 'Peso: 7.2kg | Energía: 21600kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 6),
('50 Personas', 134100, 2, 'Peso: 9.0kg | Energía: 27000kcal | Porción: 540kcal | Proteínas: 7g | Grasas: 29g | Carbohidratos: 63g | Azúcares: 45g | Sodio: 320mg', 6);

-- PRODUCTO 7: Kuchen de Frutilla (producto_id: 7)
-- Categoría: Kuchen (categoriaId: 4)
-- Tamaño único
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('Tamaño Único', 35500, 30, 'Peso: 1.6kg | Energía: 5200kcal | Porción: 430kcal | Proteínas: 6g | Grasas: 26g | Carbohidratos: 52g | Azúcares: 38g | Sodio: 290mg', 7);

-- PRODUCTO 8: Kuchen de Manzana Streusel (producto_id: 8)
-- Categoría: Kuchen (categoriaId: 4)
-- Tamaño único
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('Tamaño Único', 35500, 30, 'Peso: 1.6kg | Energía: 5150kcal | Porción: 430kcal | Proteínas: 5g | Grasas: 25g | Carbohidratos: 53g | Azúcares: 39g | Sodio: 280mg', 8);

-- PRODUCTO 9: Chilenitos (producto_id: 9)
-- Categoría: Pastelería Individual (categoriaId: 5)
-- Venta por docena
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('Docena', 12000, 50, 'Peso: 0.6kg | Energía: 2400kcal | Porción: 200kcal/u | Proteínas: 3g | Grasas: 10g | Carbohidratos: 25g | Azúcares: 18g | Sodio: 150mg', 9);

-- PRODUCTO 10: Cachitos (producto_id: 10)
-- Categoría: Pastelería Individual (categoriaId: 5)
-- Venta por docena
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('Docena', 12000, 50, 'Peso: 0.65kg | Energía: 2600kcal | Porción: 215kcal/u | Proteínas: 3g | Grasas: 11g | Carbohidratos: 26g | Azúcares: 19g | Sodio: 160mg', 10);

-- PRODUCTO 11: Cheesecake de Maracuyá (producto_id: 11)
-- Categoría: Cheesecakes (categoriaId: 6)
-- Tamaño único
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('Tamaño Único', 35000, 22, 'Peso: 1.9kg | Energía: 5900kcal | Porción: 490kcal | Proteínas: 7g | Grasas: 27g | Carbohidratos: 55g | Azúcares: 41g | Sodio: 270mg', 11);

-- PRODUCTO 12: Cheesecake de Frambuesa (producto_id: 12)
-- Categoría: Cheesecakes (categoriaId: 6)
-- Tamaño único
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('Tamaño Único', 35000, 22, 'Peso: 1.9kg | Energía: 5800kcal | Porción: 480kcal | Proteínas: 7g | Grasas: 26g | Carbohidratos: 56g | Azúcares: 42g | Sodio: 265mg', 12);

-- PRODUCTO 13: Berlín Manjar (producto_id: 13)
-- Categoría: Productos Especiales (categoriaId: 7)
-- Venta por unidad
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('Unidad', 2800, 100, 'Peso: 120g | Energía: 420kcal | Porción: 420kcal | Proteínas: 6g | Grasas: 20g | Carbohidratos: 48g | Azúcares: 32g | Sodio: 190mg', 13);

-- PRODUCTO 14: Galletas Lengua de Gato con Chocolate (producto_id: 14)
-- Categoría: Productos Especiales (categoriaId: 7)
-- 2 tamaños disponibles
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('100 gramos', 5000, 80, 'Peso: 100g | Energía: 520kcal | Porción: 520kcal | Proteínas: 5g | Grasas: 29g | Carbohidratos: 58g | Azúcares: 37g | Sodio: 160mg', 14),
('200 gramos', 9000, 60, 'Peso: 200g | Energía: 1040kcal | Porción: 520kcal | Proteínas: 5g | Grasas: 29g | Carbohidratos: 58g | Azúcares: 37g | Sodio: 160mg', 14);

-- PRODUCTO 15: Pan de Pascua de Frutos Secos (producto_id: 15)
-- Categoría: Productos de Temporada (categoriaId: 8)
-- Tamaño único
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('1 kg', 15000, 40, 'Peso: 1kg | Energía: 4200kcal | Porción: 350kcal | Proteínas: 6g | Grasas: 18g | Carbohidratos: 47g | Azúcares: 31g | Sodio: 230mg', 15);

-- PRODUCTO 16: Torta de Cuchuflís para Cumpleaños (producto_id: 16)
-- Categoría: Productos de Temporada (categoriaId: 8)
-- Tamaño único
INSERT INTO variantes_producto (nombre, precio, stock, info_nutricional, producto_id) VALUES
('Tamaño Único', 90200, 10, 'Peso: 3.2kg | Energía: 9300kcal | Porción: 580kcal | Proteínas: 8g | Grasas: 30g | Carbohidratos: 62g | Azúcares: 44g | Sodio: 310mg', 16);

-- =====================================================================
-- VERIFICACIÓN FINAL
-- =====================================================================
-- Contar variantes insertadas por producto
SELECT 
    p.id AS producto_id,
    p.nombre AS producto,
    COUNT(v.id) AS total_variantes,
    string_agg(v.nombre, ', ' ORDER BY v.precio) AS variantes_disponibles
FROM productos p
LEFT JOIN variantes_producto v ON p.id = v.producto_id
GROUP BY p.id, p.nombre
ORDER BY p.id;

-- Verificar total de variantes insertadas
SELECT COUNT(*) AS total_variantes FROM variantes_producto;

-- =====================================================================
-- RESULTADO ESPERADO:
-- =====================================================================
-- Total variantes: 58
-- Distribución:
--   - Producto 1 (Selva Negra): 7 variantes
--   - Producto 2 (Tres Leches): 7 variantes
--   - Producto 3 (Brazo Lúcuma): 1 variante
--   - Producto 4 (Brazo Mocca): 1 variante
--   - Producto 5 (Hojarasca Nuez): 7 variantes
--   - Producto 6 (Hojarasca Frambuesa): 7 variantes
--   - Producto 7 (Kuchen Frutilla): 1 variante
--   - Producto 8 (Kuchen Manzana): 1 variante
--   - Producto 9 (Chilenitos): 1 variante
--   - Producto 10 (Cachitos): 1 variante
--   - Producto 11 (Cheesecake Maracuyá): 1 variante
--   - Producto 12 (Cheesecake Frambuesa): 1 variante
--   - Producto 13 (Berlín): 1 variante
--   - Producto 14 (Galletas): 2 variantes
--   - Producto 15 (Pan Pascua): 1 variante
--   - Producto 16 (Torta Cuchuflís): 1 variante
-- =====================================================================
