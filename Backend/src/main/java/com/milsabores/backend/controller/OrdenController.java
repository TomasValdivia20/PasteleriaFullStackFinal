package com.milsabores.backend.controller;

import com.milsabores.backend.dto.CrearOrdenRequest;
import com.milsabores.backend.model.Orden;
import com.milsabores.backend.service.OrdenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestión de órdenes/ventas
 * Capa de presentación - MVC Pattern
 * CORS configurado globalmente en SecurityConfig
 */
@RestController
@RequestMapping("/api/ordenes")
public class OrdenController {

    private static final Logger logger = LoggerFactory.getLogger(OrdenController.class);
    private final OrdenService ordenService;

    @Autowired
    public OrdenController(OrdenService ordenService) {
        this.ordenService = ordenService;
    }

    /**
     * Listar todas las órdenes (ADMIN y EMPLEADO)
     * GET /api/ordenes
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    public ResponseEntity<List<Orden>> listarTodas() {
        logger.info("📋 [GET] /api/ordenes - Listar todas las órdenes");
        
        try {
            List<Orden> ordenes = ordenService.obtenerTodasOrdenes();
            logger.info("✅ [GET] Órdenes listadas - Total: {}", ordenes.size());
            return ResponseEntity.ok(ordenes);
        } catch (Exception e) {
            logger.error("❌ [GET] Error al listar órdenes: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Crear nueva orden desde carrito de compras (CLIENTE autenticado)
     * POST /api/ordenes/crear
     */
    @PostMapping("/crear")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<?> crearOrden(@RequestBody CrearOrdenRequest request) {
        logger.info("🛒 [POST] /api/ordenes/crear - Usuario ID: {}, Items: {}", 
            request.getUsuarioId(), request.getItems().size());
        
        try {
            Orden ordenCreada = ordenService.crearOrden(request);
            
            logger.info("✅ [POST] Orden creada exitosamente - ID: {}, Total: ${}", 
                ordenCreada.getId(), ordenCreada.getTotal());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(ordenCreada);
        } catch (RuntimeException e) {
            logger.error("❌ [POST] Error al crear orden: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ [POST] Error interno al crear orden: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al procesar la orden"));
        }
    }

    /**
     * Obtener estadísticas de ventas últimos 15 días (ADMIN y EMPLEADO)
     * GET /api/ordenes/stats/ultimos-15-dias
     */
    @GetMapping("/stats/ultimos-15-dias")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    public ResponseEntity<Map<String, Object>> ventasUltimos15Dias() {
        logger.info("📈 [GET] /api/ordenes/stats/ultimos-15-dias");
        
        try {
            Map<String, Object> stats = ordenService.obtenerVentasUltimos15Dias();
            logger.info("✅ [GET] Estadísticas 15 días generadas");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("❌ [GET] Error al calcular estadísticas: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtener estadísticas de ventas primer semestre (ADMIN y EMPLEADO)
     * GET /api/ordenes/stats/primer-semestre
     */
    @GetMapping("/stats/primer-semestre")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    public ResponseEntity<Map<String, Object>> ventasPrimerSemestre() {
        logger.info("📈 [GET] /api/ordenes/stats/primer-semestre");
        
        try {
            Map<String, Object> stats = ordenService.obtenerVentasPrimerSemestre();
            logger.info("✅ [GET] Estadísticas semestre generadas");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("❌ [GET] Error al calcular estadísticas: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtener resumen general de estadísticas (ADMIN y EMPLEADO)
     * GET /api/ordenes/stats/resumen
     */
    @GetMapping("/stats/resumen")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    public ResponseEntity<Map<String, Object>> resumenGeneral() {
        logger.info("📊 [GET] /api/ordenes/stats/resumen");
        
        try {
            Map<String, Object> resumen = ordenService.obtenerResumenGeneral();
            logger.info("✅ [GET] Resumen general generado");
            return ResponseEntity.ok(resumen);
        } catch (Exception e) {
            logger.error("❌ [GET] Error al generar resumen: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
