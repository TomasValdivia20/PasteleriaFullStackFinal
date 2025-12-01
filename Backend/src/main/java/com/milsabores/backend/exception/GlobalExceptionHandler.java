package com.milsabores.backend.exception;

import com.milsabores.backend.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.hibernate.LazyInitializationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Manejador global de excepciones para toda la aplicación
 * 
 * @RestControllerAdvice intercepta excepciones de todos los @RestController
 * y retorna respuestas JSON estandarizadas con ErrorResponse.
 * 
 * Beneficios:
 * - Logging centralizado de errores con contexto completo
 * - Respuestas consistentes para el frontend
 * - Captura stack traces para debugging
 * - Diferentes mensajes según perfil (dev/prod)
 * - Correlation ID para rastrear errores en logs
 * 
 * Orden de especificidad:
 * 1. Excepciones específicas (LazyInitializationException, etc.)
 * 2. Excepciones de categoría (DataAccessException, SecurityException)
 * 3. Excepción genérica (Exception)
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    private final Environment environment;

    public GlobalExceptionHandler(Environment environment) {
        this.environment = environment;
    }

    // ============================================================================
    // HIBERNATE / JPA EXCEPTIONS
    // ============================================================================

    /**
     * LazyInitializationException - Error crítico de Hibernate
     * 
     * Ocurre cuando se intenta acceder a una colección lazy DESPUÉS
     * de que la sesión Hibernate se cerró.
     * 
     * Causas comunes:
     * - fetch=LAZY sin @Transactional
     * - Acceso a colección en Controller (fuera de transacción)
     * - Serialización JSON de entidades con lazy collections
     * 
     * Soluciones:
     * 1. @Transactional(readOnly=true) en Service
     * 2. fetch=FetchType.EAGER en @OneToMany
     * 3. spring.jpa.open-in-view=true (workaround)
     * 4. Force initialization: collection.size()
     */
    @ExceptionHandler(LazyInitializationException.class)
    public ResponseEntity<ErrorResponse> handleLazyInitializationException(
            LazyInitializationException ex,
            HttpServletRequest request) {
        
        logger.error("🔴 [LAZY INIT ERROR] Hibernate session closed before accessing lazy collection");
        logger.error("   Path: {}", request.getRequestURI());
        logger.error("   Message: {}", ex.getMessage());
        logger.error("   Correlation ID: {}", MDC.get("correlationId"));
        
        // Extraer información de la excepción
        String message = ex.getMessage();
        Map<String, Object> details = new HashMap<>();
        
        // Parsear mensaje para extraer entidad y colección
        // Ejemplo: "failed to lazily initialize a collection of role: com.milsabores.backend.model.Producto.variantes"
        if (message != null && message.contains("role:")) {
            String role = message.substring(message.indexOf("role:") + 5).trim();
            String[] parts = role.split("\\.");
            if (parts.length >= 2) {
                details.put("entity", parts[parts.length - 2]);
                details.put("collection", parts[parts.length - 1]);
            }
        }
        
        details.put("cause", "Sesión Hibernate cerrada antes de acceder a colección lazy");
        details.put("solution1", "Agregar @Transactional(readOnly=true) en método Service");
        details.put("solution2", "Cambiar a fetch=FetchType.EAGER en la relación");
        details.put("solution3", "Configurar spring.jpa.open-in-view=true");
        details.put("solution4", "Force initialization: collection.size() dentro de @Transactional");
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Lazy Initialization Error")
                .message("No se pudo cargar la colección relacionada. Sesión de base de datos cerrada.")
                .path(request.getRequestURI())
                .correlationId(MDC.get("correlationId"))
                .details(details)
                .stackTrace(isDevelopment() ? getStackTrace(ex) : null)
                .build();
        
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
    }

    // ============================================================================
    // DATABASE EXCEPTIONS
    // ============================================================================

    /**
     * DataIntegrityViolationException - Violación de constraints DB
     * 
     * Ejemplos:
     * - UNIQUE constraint: Email duplicado
     * - FOREIGN KEY constraint: Producto referenciado por orden
     * - NOT NULL constraint: Campo requerido nulo
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {
        
        logger.error("🔴 [DB CONSTRAINT ERROR] {}", ex.getMessage(), ex);
        
        String userMessage = "Error de integridad en base de datos";
        Map<String, Object> details = new HashMap<>();
        
        // Parsear mensaje para identificar constraint violado
        String message = ex.getMessage();
        if (message != null) {
            if (message.contains("unique")) {
                userMessage = "El valor ya existe en la base de datos (duplicado)";
                details.put("constraint", "UNIQUE");
            } else if (message.contains("foreign key")) {
                userMessage = "No se puede eliminar: existen registros relacionados";
                details.put("constraint", "FOREIGN KEY");
            } else if (message.contains("not null")) {
                userMessage = "Campo requerido no puede ser nulo";
                details.put("constraint", "NOT NULL");
            }
        }
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Data Integrity Violation")
                .message(userMessage)
                .path(request.getRequestURI())
                .correlationId(MDC.get("correlationId"))
                .details(details)
                .stackTrace(isDevelopment() ? getStackTrace(ex) : null)
                .build();
        
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(errorResponse);
    }

    /**
     * DataAccessException genérica - Errores de DB no específicos
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccessException(
            DataAccessException ex,
            HttpServletRequest request) {
        
        logger.error("🔴 [DB ACCESS ERROR] {}", ex.getMessage(), ex);
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Database Error")
                .message("Error al acceder a la base de datos")
                .path(request.getRequestURI())
                .correlationId(MDC.get("correlationId"))
                .stackTrace(isDevelopment() ? getStackTrace(ex) : null)
                .build();
        
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
    }

    // ============================================================================
    // VALIDATION EXCEPTIONS
    // ============================================================================

    /**
     * MethodArgumentNotValidException - Validación de @Valid falló
     * 
     * Ejemplo: @NotNull, @Size, @Email, etc. en DTOs
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        
        Map<String, Object> details = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            details.put(fieldName, errorMessage);
        });
        
        logger.warn("⚠️  [VALIDATION ERROR] Path: {} - Fields: {}", 
                request.getRequestURI(), details.keySet());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Error")
                .message("Datos de entrada inválidos")
                .path(request.getRequestURI())
                .correlationId(MDC.get("correlationId"))
                .details(details)
                .build();
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    /**
     * HttpMessageNotReadableException - JSON malformado
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex,
            HttpServletRequest request) {
        
        logger.warn("⚠️  [JSON PARSE ERROR] Path: {} - Message: {}", 
                request.getRequestURI(), ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("JSON Parse Error")
                .message("JSON malformado o tipo de dato incorrecto")
                .path(request.getRequestURI())
                .correlationId(MDC.get("correlationId"))
                .build();
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    /**
     * MethodArgumentTypeMismatchException - Tipo de parámetro incorrecto
     * 
     * Ejemplo: GET /productos/abc (esperaba Long)
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            HttpServletRequest request) {
        
        logger.warn("⚠️  [TYPE MISMATCH] Path: {} - Parameter: {} - Expected: {}", 
                request.getRequestURI(), ex.getName(), ex.getRequiredType());
        
        Map<String, Object> details = new HashMap<>();
        details.put("parameter", ex.getName());
        details.put("value", ex.getValue());
        details.put("expectedType", ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Type Mismatch")
                .message("Tipo de dato incorrecto para parámetro: " + ex.getName())
                .path(request.getRequestURI())
                .correlationId(MDC.get("correlationId"))
                .details(details)
                .build();
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    // ============================================================================
    // SECURITY EXCEPTIONS
    // ============================================================================

    /**
     * AuthenticationException - Error de autenticación
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex,
            HttpServletRequest request) {
        
        logger.warn("⚠️  [AUTH ERROR] Path: {} - Message: {}", 
                request.getRequestURI(), ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Unauthorized")
                .message("Credenciales inválidas")
                .path(request.getRequestURI())
                .correlationId(MDC.get("correlationId"))
                .build();
        
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(errorResponse);
    }

    /**
     * AccessDeniedException - Sin permisos
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request) {
        
        logger.warn("⚠️  [ACCESS DENIED] Path: {} - User: {}", 
                request.getRequestURI(), MDC.get("userId"));
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .error("Forbidden")
                .message("No tiene permisos para acceder a este recurso")
                .path(request.getRequestURI())
                .correlationId(MDC.get("correlationId"))
                .build();
        
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(errorResponse);
    }

    // ============================================================================
    // GENERIC EXCEPTIONS
    // ============================================================================

    /**
     * NoHandlerFoundException - Endpoint no existe (404)
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            NoHandlerFoundException ex,
            HttpServletRequest request) {
        
        logger.warn("⚠️  [NOT FOUND] Path: {} - Method: {}", 
                request.getRequestURI(), ex.getHttpMethod());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message("Endpoint no encontrado: " + request.getRequestURI())
                .path(request.getRequestURI())
                .correlationId(MDC.get("correlationId"))
                .build();
        
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(errorResponse);
    }

    /**
     * Exception genérica - Catch-all para errores no manejados
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {
        
        logger.error("🔴 [UNHANDLED ERROR] Path: {} - Exception: {}", 
                request.getRequestURI(), ex.getClass().getSimpleName(), ex);
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message(isDevelopment() ? ex.getMessage() : "Error interno del servidor")
                .path(request.getRequestURI())
                .correlationId(MDC.get("correlationId"))
                .stackTrace(isDevelopment() ? getStackTrace(ex) : null)
                .build();
        
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    /**
     * Verifica si estamos en perfil de desarrollo
     */
    private boolean isDevelopment() {
        String[] profiles = environment.getActiveProfiles();
        if (profiles.length == 0) {
            return true; // Default profile
        }
        for (String profile : profiles) {
            if (profile.equals("development") || profile.equals("dev") || profile.equals("default")) {
                return true;
            }
        }
        return false;
    }

    /**
     * Convierte stack trace a String
     */
    private String getStackTrace(Throwable throwable) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        throwable.printStackTrace(pw);
        return sw.toString();
    }
}
