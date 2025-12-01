package com.milsabores.backend.controller;

import com.milsabores.backend.dto.LogBatchRequest;
import com.milsabores.backend.dto.LogEntry;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller para recibir logs del frontend
 * 
 * Endpoints:
 * - POST /api/logs: Recibe batch de logs del frontend
 * 
 * Los logs se escriben en el sistema de logging backend (Logback)
 * con categoría "FRONTEND" para distinguirlos de logs backend.
 * 
 * Beneficios:
 * - Centraliza logs frontend/backend en Railway
 * - Permite rastrear errores end-to-end con correlation ID
 * - Facilita debugging de producción
 * - Opcionalmente se puede persistir en DB
 * 
 * Seguridad:
 * - Rate limiting recomendado (evitar flood)
 * - Validación de tamaño de batch
 * - Sanitización de datos sensibles
 */
@RestController
@RequestMapping("/api/logs")
public class LogController {

    private static final Logger logger = LoggerFactory.getLogger("FRONTEND");
    
    // Límite de logs por batch (evitar payloads gigantes)
    private static final int MAX_BATCH_SIZE = 50;

    /**
     * Recibe batch de logs del frontend
     * 
     * POST /api/logs
     * Body: { "logs": [ {...}, {...} ] }
     * 
     * Response:
     * - 200: Logs recibidos exitosamente
     * - 400: Validación falló o batch muy grande
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> receiveLogs(@Valid @RequestBody LogBatchRequest request) {
        
        // Validar tamaño de batch
        if (request.getLogs().size() > MAX_BATCH_SIZE) {
            logger.warn("Batch de logs excede tamaño máximo: {} (max: {})", 
                    request.getLogs().size(), MAX_BATCH_SIZE);
            
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Batch size exceeds maximum");
            response.put("maxSize", MAX_BATCH_SIZE);
            response.put("receivedSize", request.getLogs().size());
            
            return ResponseEntity.badRequest().body(response);
        }
        
        // Procesar cada log
        int processed = 0;
        for (LogEntry logEntry : request.getLogs()) {
            try {
                writeLogEntry(logEntry);
                processed++;
            } catch (Exception e) {
                logger.error("Error procesando log entry: {}", e.getMessage(), e);
            }
        }
        
        // Response exitoso
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("logsReceived", request.getLogs().size());
        response.put("logsProcessed", processed);
        
        logger.debug("Frontend logs recibidos: {} processed, {} total", processed, request.getLogs().size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Escribe log entry en sistema de logging backend
     * 
     * Formato: [FRONTEND] [correlationId] [url] mensaje {context}
     */
    private void writeLogEntry(LogEntry entry) {
        // Formatear mensaje con contexto
        String formattedMessage = String.format("[%s] [session=%s] [url=%s] %s",
                entry.getCorrelationId() != null ? entry.getCorrelationId() : "N/A",
                entry.getSessionStart() != null ? entry.getSessionStart() : "N/A",
                entry.getUrl() != null ? entry.getUrl() : "N/A",
                entry.getMessage()
        );
        
        // Agregar contexto si existe
        if (entry.getContext() != null && !entry.getContext().isEmpty()) {
            formattedMessage += " | Context: " + entry.getContext();
        }
        
        // Agregar error si existe
        if (entry.getError() != null) {
            formattedMessage += String.format(" | Error: %s - %s", 
                    entry.getError().getName(),
                    entry.getError().getMessage()
            );
            
            // Stack trace en DEBUG
            if (entry.getError().getStack() != null) {
                logger.debug("Frontend error stack trace: {}", entry.getError().getStack());
            }
        }
        
        // Escribir en log según nivel
        switch (entry.getLevel().toUpperCase()) {
            case "DEBUG":
                logger.debug(formattedMessage);
                break;
            case "INFO":
                logger.info(formattedMessage);
                break;
            case "WARN":
            case "WARNING":
                logger.warn(formattedMessage);
                break;
            case "ERROR":
                logger.error(formattedMessage);
                break;
            default:
                logger.info(formattedMessage);
        }
    }
    
    /**
     * Health check para verificar que el endpoint funciona
     * 
     * GET /api/logs/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Frontend Logging");
        response.put("maxBatchSize", MAX_BATCH_SIZE);
        return ResponseEntity.ok(response);
    }
}
