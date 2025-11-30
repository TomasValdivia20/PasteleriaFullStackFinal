package com.milsabores.backend.controller;

import com.milsabores.backend.model.Categoria;
import com.milsabores.backend.service.CategoriaService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestión de Categorías
 * Capa de presentación - MVC Pattern
 * 
 * CORS: Permite peticiones desde cualquier origen (API pública)
 * allowCredentials="false" para compatibilidad con origins="*"
 */
@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class CategoriaController {

    private static final Logger logger = LoggerFactory.getLogger(CategoriaController.class);
    private final CategoriaService categoriaService;

    @Autowired
    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public ResponseEntity<List<Categoria>> listarCategorias(HttpServletRequest request) {
        logger.info("📥 [REQUEST] GET /api/categorias");
        logger.info("   Origin: {}", request.getHeader("Origin"));
        logger.info("   User-Agent: {}", request.getHeader("User-Agent"));
        logger.info("   Method: {}", request.getMethod());
        
        List<Categoria> categorias = categoriaService.obtenerTodas();
        
        logger.info("📤 [RESPONSE] {} categorías encontradas", categorias.size());
        return ResponseEntity.ok(categorias);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Categoria> obtenerCategoria(@PathVariable Long id) {
        return categoriaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Categoria> crearCategoria(@RequestBody Categoria categoria) {
        try {
            Categoria nuevaCategoria = categoriaService.crear(categoria);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCategoria);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Categoria> actualizarCategoria(
            @PathVariable Long id, 
            @RequestBody Categoria categoriaActualizada) {
        try {
            Categoria categoria = categoriaService.actualizar(id, categoriaActualizada);
            return ResponseEntity.ok(categoria);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCategoria(@PathVariable Long id) {
        try {
            categoriaService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}