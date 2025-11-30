package com.milsabores.backend.controller;

import com.milsabores.backend.model.Orden;
import com.milsabores.backend.service.OrdenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestión de órdenes/ventas
 * Capa de presentación - MVC Pattern
 */
@RestController
@RequestMapping("/api/ordenes")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class OrdenController {

    private static final Logger logger = LoggerFactory.getLogger(OrdenController.class);
    private final OrdenService ordenService;

    @Autowired
    public OrdenController(OrdenService ordenService) {
        this.ordenService = ordenService;
    }

    /**
     * Listar todas las órdenes (ADMIN)
     * GET /api/ordenes
     */
    @GetMapping
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
     * Obtener estadísticas de ventas últimos 15 días
     * GET /api/ordenes/stats/ultimos-15-dias
     */
    @GetMapping("/stats/ultimos-15-dias")
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
     * Obtener estadísticas de ventas primer semestre
     * GET /api/ordenes/stats/primer-semestre
     */
    @GetMapping("/stats/primer-semestre")
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
     * Obtener resumen general de estadísticas
     * GET /api/ordenes/stats/resumen
     */
    @GetMapping("/stats/resumen")
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
