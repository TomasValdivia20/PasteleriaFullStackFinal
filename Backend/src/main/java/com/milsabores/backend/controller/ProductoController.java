package com.milsabores.backend.controller;

import com.milsabores.backend.model.Producto;
import com.milsabores.backend.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestión de Productos
 * Capa de presentación - MVC Pattern
 * 
 * CORS: Permite peticiones desde cualquier origen (API pública)
 * allowCredentials="false" para compatibilidad con origins="*"
 */
@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class ProductoController {

    private final ProductoService productoService;

    @Autowired
    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<List<Producto>> listarProductos() {
        List<Producto> productos = productoService.obtenerTodos();
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerProductoPorId(@PathVariable Long id) {
        return productoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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