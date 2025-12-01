package com.milsabores.backend.controller;

import com.milsabores.backend.model.Producto;
import com.milsabores.backend.model.VarianteProducto;
import com.milsabores.backend.repository.ProductoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

/**
 * Controlador temporal para poblar variantes en productos existentes
 * 
 * PROBLEMA DETECTADO:
 * - Railway deployments tienen productos SIN variantes en Supabase
 * - DataInitializer NO se ejecuta cuando hay datos previos
 * - Frontend muestra "variantes: []" vacío
 * 
 * SOLUCIÓN TEMPORAL:
 * - Endpoint GET /api/admin/populate-variantes
 * - Agrega variantes predefinidas a productos sin variantes
 * - Ejecutar UNA VEZ después de deployment
 * 
 * TODO: Migrar a Flyway migration script
 */
@RestController
@RequestMapping("/api/admin")
public class AdminDataController {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminDataController.class);
    
    @Autowired
    private ProductoRepository productoRepository;
    
    /**
     * Poblar variantes en productos que NO las tienen
     * 
     * @return ResponseEntity con resultado de operación
     */
    @GetMapping("/populate-variantes")
    public ResponseEntity<String> populateVariantes() {
        logger.info("🔧 [ADMIN] Iniciando población de variantes...");
        
        List<Producto> productos = productoRepository.findAll();
        int productosActualizados = 0;
        
        for (Producto producto : productos) {
            // Solo agregar variantes si NO tiene
            if (producto.getVariantes() == null || producto.getVariantes().isEmpty()) {
                logger.info("📦 [ADMIN] Agregando variantes a producto ID={}, nombre={}", 
                    producto.getId(), producto.getNombre());
                
                // Crear variantes estándar basadas en el precioBase
                Integer precioBase = producto.getPrecioBase() != null ? producto.getPrecioBase() : 42000;
                
                List<VarianteProducto> variantes = Arrays.asList(
                    crearVariante("12 personas", precioBase, "Peso: 2.2 kg, Energía: 6480 kcal"),
                    crearVariante("16 personas", (int)(precioBase * 1.33), "Peso: 2.9 kg, Energía: 8640 kcal"),
                    crearVariante("20 personas", (int)(precioBase * 1.67), "Peso: 3.6 kg, Energía: 10800 kcal"),
                    crearVariante("25 personas", (int)(precioBase * 2.08), "Peso: 4.5 kg, Energía: 13500 kcal")
                );
                
                // Asignar producto a cada variante
                for (VarianteProducto v : variantes) {
                    v.setProducto(producto);
                    producto.getVariantes().add(v);
                }
                
                productoRepository.save(producto);
                productosActualizados++;
            } else {
                logger.info("ℹ️ [ADMIN] Producto ID={} YA tiene {} variantes (skip)", 
                    producto.getId(), producto.getVariantes().size());
            }
        }
        
        String resultado = String.format(
            "✅ [ADMIN] Proceso completado: %d productos actualizados, %d productos con variantes previas",
            productosActualizados, productos.size() - productosActualizados
        );
        logger.info(resultado);
        
        return ResponseEntity.ok(resultado);
    }
    
    /**
     * Helper: Crear variante de producto
     */
    private VarianteProducto crearVariante(String nombre, Integer precio, String info) {
        VarianteProducto v = new VarianteProducto();
        v.setNombre(nombre);
        v.setPrecio(precio);
        v.setInfoNutricional(info);
        v.setStock(100); // Stock dummy
        return v;
    }
    
    /**
     * Endpoint de verificación: Listar productos con sus variantes
     */
    @GetMapping("/verify-variantes")
    public ResponseEntity<String> verifyVariantes() {
        List<Producto> productos = productoRepository.findAll();
        
        StringBuilder sb = new StringBuilder();
        sb.append("📊 [ADMIN] Verificación de variantes:\n\n");
        
        for (Producto p : productos) {
            sb.append(String.format("ID=%d, Nombre=%s, Variantes=%d\n", 
                p.getId(), p.getNombre(), p.getVariantes().size()));
            
            if (!p.getVariantes().isEmpty()) {
                for (VarianteProducto v : p.getVariantes()) {
                    sb.append(String.format("  - %s ($%d)\n", v.getNombre(), v.getPrecio()));
                }
            }
            sb.append("\n");
        }
        
        return ResponseEntity.ok(sb.toString());
    }
}
