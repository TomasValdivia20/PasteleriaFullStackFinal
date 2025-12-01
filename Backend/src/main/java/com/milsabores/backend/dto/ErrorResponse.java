package com.milsabores.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO para respuestas de error estandarizadas
 * 
 * Usado por GlobalExceptionHandler para retornar errores consistentes
 * con información útil para debugging en desarrollo y producción.
 * 
 * Ejemplo JSON:
 * {
 *   "timestamp": "2025-12-01T04:30:00",
 *   "status": 500,
 *   "error": "Internal Server Error",
 *   "message": "No se pudo cargar las variantes del producto",
 *   "path": "/api/productos/1",
 *   "correlationId": "a1b2c3d4",
 *   "details": {
 *     "entity": "Producto",
 *     "collection": "variantes",
 *     "suggestion": "Verificar @Transactional o fetch=EAGER"
 *   }
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    
    /**
     * Timestamp del error (ISO-8601)
     */
    private LocalDateTime timestamp;
    
    /**
     * HTTP Status Code (400, 404, 500, etc.)
     */
    private int status;
    
    /**
     * Nombre del error HTTP (Bad Request, Not Found, etc.)
     */
    private String error;
    
    /**
     * Mensaje descriptivo del error (user-friendly)
     */
    private String message;
    
    /**
     * Path del endpoint donde ocurrió el error
     */
    private String path;
    
    /**
     * Correlation ID para rastrear request en logs
     * Disponible en MDC via CorrelationIdFilter
     */
    private String correlationId;
    
    /**
     * Detalles adicionales del error (opcional)
     * Solo se incluye en desarrollo o para errores específicos
     * 
     * Ejemplos:
     * - LazyInitializationException: entidad, colección, sugerencia
     * - ValidationException: campo, valor inválido, regla violada
     * - DatabaseException: query, constraint violado
     */
    private Map<String, Object> details;
    
    /**
     * Stack trace completo (solo en desarrollo)
     * No se incluye en producción por seguridad
     */
    private String stackTrace;
}
