package com.milsabores.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Filtro para agregar Correlation ID a cada request
 * 
 * MDC (Mapped Diagnostic Context) permite agregar contexto a los logs
 * sin pasar explícitamente el correlation ID a cada método.
 * 
 * El correlation ID permite rastrear una request completa a través
 * de todos los logs generados durante su procesamiento.
 * 
 * Orden: HIGHEST_PRECEDENCE para ejecutar antes que cualquier filtro
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String CORRELATION_ID_MDC_KEY = "correlationId";
    private static final String USER_ID_MDC_KEY = "userId";
    private static final String REQUEST_URI_MDC_KEY = "requestUri";

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) 
            throws ServletException, IOException {
        
        try {
            // 1. Obtener o generar Correlation ID
            String correlationId = request.getHeader(CORRELATION_ID_HEADER);
            if (correlationId == null || correlationId.isEmpty()) {
                correlationId = generateCorrelationId();
            }
            
            // 2. Agregar a MDC (disponible en todos los logs)
            MDC.put(CORRELATION_ID_MDC_KEY, correlationId);
            MDC.put(REQUEST_URI_MDC_KEY, request.getRequestURI());
            
            // 3. Agregar userId si existe en request (después de autenticación)
            // Esto se puede mejorar extrayendo del SecurityContext
            String userId = extractUserId(request);
            if (userId != null) {
                MDC.put(USER_ID_MDC_KEY, userId);
            }
            
            // 4. Agregar a response header para que cliente pueda rastrear
            response.setHeader(CORRELATION_ID_HEADER, correlationId);
            
            // 5. Continuar cadena de filtros
            filterChain.doFilter(request, response);
            
        } finally {
            // 6. CRÍTICO: Limpiar MDC después de request
            // Evita memory leaks en thread pool de Tomcat
            MDC.clear();
        }
    }

    /**
     * Genera un Correlation ID único usando UUID
     * Formato: 8 caracteres alfanuméricos (suficiente para uniqueness)
     */
    private String generateCorrelationId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    /**
     * Extrae userId de la request si existe
     * Puede obtenerlo de:
     * - Query parameter: ?userId=123
     * - Header: X-User-ID
     * - SecurityContext (después de implementar)
     */
    private String extractUserId(HttpServletRequest request) {
        // Intentar obtener de header
        String userId = request.getHeader("X-User-ID");
        if (userId != null && !userId.isEmpty()) {
            return userId;
        }
        
        // Intentar obtener de query param
        userId = request.getParameter("userId");
        if (userId != null && !userId.isEmpty()) {
            return userId;
        }
        
        // TODO: Extraer de SecurityContext cuando esté implementado
        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // if (auth != null && auth.getPrincipal() instanceof UserDetails) {
        //     UserDetails userDetails = (UserDetails) auth.getPrincipal();
        //     return userDetails.getUsername();
        // }
        
        return null;
    }
}
