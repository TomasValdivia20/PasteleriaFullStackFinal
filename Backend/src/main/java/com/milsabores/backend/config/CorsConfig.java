package com.milsabores.backend.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Configuración de CORS (Cross-Origin Resource Sharing)
 * Permite peticiones desde el frontend desplegado en Vercel y desarrollo local
 * Soporta wildcards para preview deployments dinámicos de Vercel
 * 
 * IMPORTANTE: allowedOriginPatterns acepta patrones con asterisco
 * Ejemplo: https://*.vercel.app coincide con cualquier subdominio de vercel.app
 */
@Configuration
public class CorsConfig {

    private static final Logger logger = LoggerFactory.getLogger(CorsConfig.class);

    @Value("${cors.allowed.origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOriginsString;

    @PostConstruct
    public void logCorsConfiguration() {
        logger.info("========================================");
        logger.info("🔧 [CORS CONFIG] Inicializando configuración CORS");
        logger.info("📋 [CORS CONFIG] Variable FRONTEND_URL/cors.allowed.origins:");
        logger.info("   RAW: {}", allowedOriginsString);
        
        List<String> origins = Arrays.stream(allowedOriginsString.split(","))
                .map(String::trim)
                .collect(Collectors.toList());
        
        logger.info("📋 [CORS CONFIG] Total de {} orígenes configurados:", origins.size());
        origins.forEach(origin -> {
            if (origin.contains("*")) {
                logger.info("   🌐 PATRÓN WILDCARD: {}", origin);
            } else {
                logger.info("   ✅ ORIGEN ESPECÍFICO: {}", origin);
            }
        });
        
        logger.info("🔓 [CORS CONFIG] Métodos: GET, POST, PUT, DELETE, OPTIONS, PATCH");
        logger.info("🍪 [CORS CONFIG] Credenciales: HABILITADAS (allowCredentials=true)");
        logger.info("📦 [CORS CONFIG] Headers: TODOS (*) permitidos");
        logger.info("⏱️  [CORS CONFIG] MaxAge preflight: 3600s (1 hora)");
        logger.info("🎯 [CORS CONFIG] Rutas protegidas: /api/**");
        logger.info("========================================");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Parsear y limpiar orígenes (remover espacios en blanco)
        List<String> allowedOrigins = Arrays.stream(allowedOriginsString.split(","))
                .map(String::trim)
                .collect(Collectors.toList());
        
        // CRÍTICO: Usar setAllowedOriginPatterns para soportar wildcards
        // https://*.vercel.app coincidirá con CUALQUIER preview deployment de Vercel
        // https://pasteleria-full-stack-final-XXXXX.vercel.app → PERMITIDO ✅
        configuration.setAllowedOriginPatterns(allowedOrigins);
        
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Headers permitidos (todos)
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // IMPORTANTE: Permitir credenciales (cookies, Authorization headers)
        // Requiere orígenes específicos o patrones, NO puede usar "*"
        configuration.setAllowCredentials(true);
        
        // Cache de preflight requests (1 hora)
        configuration.setMaxAge(3600L);
        
        // Aplicar configuración a todas las rutas /api/**
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        
        return source;
    }
}
