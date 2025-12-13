-- =====================================================================
-- SCRIPT: Verificación de Datos en Supabase
-- DESCRIPCIÓN: Verificar si variantes_producto tiene datos
-- =====================================================================

-- Paso 1: Contar variantes totales
SELECT COUNT(*) AS total_variantes FROM variantes_producto;

-- Paso 2: Ver primeras 10 variantes
SELECT id, nombre, precio, stock, producto_id 
FROM variantes_producto 
ORDER BY producto_id, id 
LIMIT 10;

-- Paso 3: Contar variantes por producto
SELECT p.id, p.nombre AS producto, COUNT(vp.id) AS num_variantes
FROM productos p
LEFT JOIN variantes_producto vp ON p.id = vp.producto_id
GROUP BY p.id, p.nombre
ORDER BY p.id
LIMIT 20;

-- Paso 4: Verificar foreign keys correctas
SELECT vp.id, vp.nombre AS variante, vp.producto_id, p.nombre AS producto
FROM variantes_producto vp
LEFT JOIN productos p ON vp.producto_id = p.id
WHERE p.id IS NULL;  -- Debe retornar 0 filas (sin FKs rotas)

-- Paso 5: Ver variantes del producto 1 específicamente
SELECT id, nombre, precio, stock, info_nutricional, producto_id
FROM variantes_producto
WHERE producto_id = 1
ORDER BY id;
