package com.milsabores.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO para recibir logs del frontend
 * 
 * El frontend envía logs en batch para optimizar requests.
 * Estos logs se pueden:
 * 1. Escribir en el sistema de logging (Logback)
 * 2. Persistir en base de datos para análisis posterior
 * 3. Enviar a servicio de monitoreo (DataDog, Sentry, etc.)
 * 
 * Ejemplo payload:
 * {
 *   "logs": [
 *     {
 *       "timestamp": "2025-12-01T04:30:00",
 *       "level": "ERROR",
 *       "category": "ERROR",
 *       "message": "No se pudo cargar productos",
 *       "context": {
 *         "url": "/api/productos",
 *         "status": 500
 *       },
 *       "correlationId": "a1b2c3d4",
 *       "userAgent": "Mozilla/5.0...",
 *       "url": "https://milsabores.vercel.app/catalogo"
 *     }
 *   ]
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogEntry {
    
    /**
     * Timestamp del log (generado en frontend)
     */
    @NotNull(message = "Timestamp es requerido")
    private LocalDateTime timestamp;
    
    /**
     * Nivel de log: DEBUG, INFO, WARN, ERROR
     */
    @NotBlank(message = "Level es requerido")
    private String level;
    
    /**
     * Categoría del log (ERROR, INFO, WARNING, DEBUG)
     */
    @NotBlank(message = "Category es requerido")
    private String category;
    
    /**
     * Mensaje descriptivo
     */
    @NotBlank(message = "Message es requerido")
    private String message;
    
    /**
     * Contexto adicional (JSON map)
     * Puede contener: url, status, productoId, error details, etc.
     */
    private Map<String, Object> context;
    
    /**
     * Correlation ID del frontend (para rastrear sesión)
     */
    private String correlationId;
    
    /**
     * Timestamp de inicio de sesión frontend
     */
    private String sessionStart;
    
    /**
     * User Agent del navegador
     */
    private String userAgent;
    
    /**
     * URL actual del frontend donde ocurrió el log
     */
    private String url;
    
    /**
     * Información de error si existe
     */
    private ErrorInfo error;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorInfo {
        private String message;
        private String name;
        private String stack;
    }
}
