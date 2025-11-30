package com.milsabores.backend.controller;

import com.milsabores.backend.model.Contacto;
import com.milsabores.backend.service.ContactoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestión de mensajes de contacto
 * Capa de presentación - MVC Pattern
 * 
 * ENDPOINTS PÚBLICOS: POST /api/contactos (formulario de contacto)
 * ENDPOINTS ADMIN: GET, PUT, DELETE (gestión de mensajes)
 * CORS configurado globalmente en SecurityConfig
 */
@RestController
@RequestMapping("/api/contactos")
public class ContactoController {
    
    private static final Logger logger = LoggerFactory.getLogger(ContactoController.class);
    
    private final ContactoService contactoService;
    
    @Autowired
    public ContactoController(ContactoService contactoService) {
        this.contactoService = contactoService;
    }
    
    /**
     * ENDPOINT PÚBLICO - Crear mensaje de contacto
     * POST /api/contactos
     */
    @PostMapping
    public ResponseEntity<?> crearContacto(@RequestBody Contacto contacto) {
        try {
            logger.info("📨 Recibida solicitud de contacto de: {}", contacto.getEmail());
            
            Contacto nuevoContacto = contactoService.crear(contacto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Mensaje enviado exitosamente. Te responderemos pronto.");
            response.put("id", nuevoContacto.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("⚠️  Validación fallida: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
            
        } catch (Exception e) {
            logger.error("❌ Error inesperado al crear contacto: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al procesar el mensaje. Inténtalo nuevamente.");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * ENDPOINT ADMIN - Listar todos los mensajes
     * GET /api/contactos
     */
    @GetMapping
    public ResponseEntity<List<Contacto>> listarContactos(
            @RequestParam(required = false) Boolean leido) {
        
        logger.info("📋 Admin solicitando lista de contactos (leído: {})", leido);
        
        List<Contacto> contactos;
        
        if (leido != null) {
            contactos = contactoService.obtenerPorEstado(leido);
        } else {
            contactos = contactoService.obtenerTodos();
        }
        
        return ResponseEntity.ok(contactos);
    }
    
    /**
     * ENDPOINT ADMIN - Obtener mensaje por ID
     * GET /api/contactos/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Contacto> obtenerContactoPorId(@PathVariable Long id) {
        logger.info("🔍 Admin solicitando contacto con ID: {}", id);
        
        return contactoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * ENDPOINT ADMIN - Marcar mensaje como leído/no leído
     * PUT /api/contactos/{id}/leido
     */
    @PutMapping("/{id}/leido")
    public ResponseEntity<Contacto> marcarComoLeido(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        
        try {
            Boolean leido = body.getOrDefault("leido", true);
            
            logger.info("📝 Admin marcando contacto {} como {}", 
                       id, leido ? "LEÍDO" : "NO LEÍDO");
            
            Contacto contactoActualizado = contactoService.marcarComoLeido(id, leido);
            
            return ResponseEntity.ok(contactoActualizado);
            
        } catch (RuntimeException e) {
            logger.error("❌ Error al actualizar estado: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * ENDPOINT ADMIN - Eliminar mensaje
     * DELETE /api/contactos/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarContacto(@PathVariable Long id) {
        try {
            logger.info("🗑️  Admin eliminando contacto con ID: {}", id);
            
            contactoService.eliminar(id);
            
            return ResponseEntity.noContent().build();
            
        } catch (RuntimeException e) {
            logger.error("❌ Error al eliminar contacto: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * ENDPOINT ADMIN - Contar mensajes no leídos
     * GET /api/contactos/stats/no-leidos
     */
    @GetMapping("/stats/no-leidos")
    public ResponseEntity<Map<String, Long>> contarNoLeidos() {
        logger.info("📊 Admin solicitando estadísticas de mensajes");
        
        Long cantidad = contactoService.contarNoLeidos();
        
        Map<String, Long> stats = new HashMap<>();
        stats.put("noLeidos", cantidad);
        
        return ResponseEntity.ok(stats);
    }
}
