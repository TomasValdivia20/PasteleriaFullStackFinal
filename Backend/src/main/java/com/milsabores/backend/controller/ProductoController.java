package com.milsabores.backend.controller;

import com.milsabores.backend.model.Producto;
import com.milsabores.backend.service.ProductoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Controlador REST para gestión de Productos
 * Capa de presentación - MVC Pattern
 * 
 * CORS configurado globalmente en SecurityConfig
 */
@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private static final Logger logger = LoggerFactory.getLogger(ProductoController.class);
    private final ProductoService productoService;

    @Autowired
    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<List<Producto>> listarProductos() {
        long startTime = System.currentTimeMillis();
        logger.info("📦 [GET] /api/productos - Listar todos los productos");
        
        List<Producto> productos = productoService.obtenerTodos();
        
        long duration = System.currentTimeMillis() - startTime;
        logger.info("✅ [GET] Productos listados - Total: {} en {}ms", productos.size(), duration);
        
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerProductoPorId(@PathVariable Long id) {
        Optional<Producto> productoOpt = productoService.obtenerPorId(id);
        
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            logger.info("📦 [GET] /api/productos/{} - Variantes: {}, Imagenes: {}", 
                id, producto.getVariantes().size(), producto.getImagenes().size());
            return ResponseEntity.ok(producto);
        } else {
            logger.warn("❌ [GET] /api/productos/{} - Producto NO encontrado", id);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/categoria/{id}")
    public ResponseEntity<List<Producto>> listarPorCategoria(@PathVariable Long id) {
        try {
            List<Producto> productos = productoService.obtenerPorCategoria(id);
            return ResponseEntity.ok(productos);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Producto> crearProducto(@RequestBody Producto producto) {
        try {
            Producto nuevoProducto = productoService.crear(producto);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(
            @PathVariable Long id, 
            @RequestBody Producto productoActualizado) {
        try {
            Producto producto = productoService.actualizar(id, productoActualizado);
            return ResponseEntity.ok(producto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        try {
            productoService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}