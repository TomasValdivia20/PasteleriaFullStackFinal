package com.milsabores.backend.controller;

import com.milsabores.backend.model.ImagenProducto;
import com.milsabores.backend.service.ImagenProductoService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controlador REST para gestión de Imágenes de Productos en Supabase Storage
 */
@RestController
@RequestMapping("/api/productos/{productoId}/imagenes")
public class ImagenProductoController {
    
    private static final Logger logger = LoggerFactory.getLogger(ImagenProductoController.class);
    private final ImagenProductoService imagenService;
    
    @Autowired
    public ImagenProductoController(ImagenProductoService imagenService) {
        this.imagenService = imagenService;
    }
    
    /**
     * Listar todas las imágenes de un producto
     * GET /api/productos/{productoId}/imagenes
     */
    @GetMapping
    public ResponseEntity<List<ImagenProducto>> listarImagenes(
            @PathVariable Long productoId,
            HttpServletRequest request) {
        
        logger.info("📥 [REQUEST] GET /api/productos/{}/imagenes", productoId);
        logger.info("   Origin: {}", request.getHeader("Origin"));
        
        List<ImagenProducto> imagenes = imagenService.obtenerImagenesDeProducto(productoId);
        
        logger.info("📤 [RESPONSE] {} imágenes encontradas", imagenes.size());
        return ResponseEntity.ok(imagenes);
    }
    
    /**
     * Subir nueva imagen para un producto
     * POST /api/productos/{productoId}/imagenes
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> subirImagen(
            @PathVariable Long productoId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "esPrincipal", defaultValue = "false") boolean esPrincipal,
            HttpServletRequest request) {
        
        logger.info("📥 [REQUEST] POST /api/productos/{}/imagenes", productoId);
        logger.info("   Origin: {}", request.getHeader("Origin"));
        logger.info("   File: {}", file.getOriginalFilename());
        logger.info("   Size: {} bytes", file.getSize());
        logger.info("   Content-Type: {}", file.getContentType());
        logger.info("   Es Principal: {}", esPrincipal);
        
        try {
            // Validar archivo
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Archivo vacío");
            }
            
            if (file.getSize() > 10 * 1024 * 1024) { // 10 MB
                return ResponseEntity.badRequest().body("Archivo demasiado grande (máximo 10 MB)");
            }
            
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("El archivo debe ser una imagen");
            }
            
            ImagenProducto imagen = imagenService.subirImagen(productoId, file, esPrincipal);
            
            logger.info("📤 [RESPONSE] Imagen subida exitosamente con ID: {}", imagen.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(imagen);
            
        } catch (Exception e) {
            logger.error("❌ [ERROR] Error subiendo imagen: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error subiendo imagen: " + e.getMessage());
        }
    }
    
    /**
     * Eliminar una imagen
     * DELETE /api/productos/{productoId}/imagenes/{imagenId}
     */
    @DeleteMapping("/{imagenId}")
    public ResponseEntity<Void> eliminarImagen(
            @PathVariable Long productoId,
            @PathVariable Long imagenId,
            HttpServletRequest request) {
        
        logger.info("📥 [REQUEST] DELETE /api/productos/{}/imagenes/{}", productoId, imagenId);
        logger.info("   Origin: {}", request.getHeader("Origin"));
        
        try {
            imagenService.eliminarImagen(imagenId);
            logger.info("📤 [RESPONSE] Imagen eliminada exitosamente");
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("❌ [ERROR] Error eliminando imagen: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Marcar imagen como principal
     * PATCH /api/productos/{productoId}/imagenes/{imagenId}/principal
     */
    @PatchMapping("/{imagenId}/principal")
    public ResponseEntity<ImagenProducto> marcarComoPrincipal(
            @PathVariable Long productoId,
            @PathVariable Long imagenId,
            HttpServletRequest request) {
        
        logger.info("📥 [REQUEST] PATCH /api/productos/{}/imagenes/{}/principal", productoId, imagenId);
        logger.info("   Origin: {}", request.getHeader("Origin"));
        
        try {
            ImagenProducto imagen = imagenService.marcarComoPrincipal(imagenId);
            logger.info("📤 [RESPONSE] Imagen marcada como principal");
            return ResponseEntity.ok(imagen);
        } catch (Exception e) {
            logger.error("❌ [ERROR] Error marcando como principal: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
