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
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

/**
 * Configuración de CORS (Cross-Origin Resource Sharing)
 * Permite peticiones desde el frontend desplegado en Vercel y desarrollo local
 * Soporta wildcards para preview deployments de Vercel (*.vercel.app)
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
        logger.info("📋 [CORS CONFIG] Orígenes permitidos (raw): {}", allowedOriginsString);
        List<String> origins = Arrays.asList(allowedOriginsString.split(","));
        origins.forEach(origin -> 
            logger.info("   ✅ Permitido: {}", origin.trim())
        );
        logger.info("🔓 [CORS CONFIG] Métodos permitidos: GET, POST, PUT, DELETE, OPTIONS, PATCH");
        logger.info("🍪 [CORS CONFIG] Credenciales: HABILITADAS");
        logger.info("⏱️  [CORS CONFIG] MaxAge preflight: 3600s (1 hora)");
        logger.info("🎯 [CORS CONFIG] Aplicado a: /api/**");
        logger.info("========================================");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Parsear los orígenes permitidos (separados por coma)
        List<String> allowedOrigins = Arrays.asList(allowedOriginsString.split(","));
        configuration.setAllowedOriginPatterns(allowedOrigins);
        
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Headers permitidos
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Permitir credenciales (cookies, Authorization headers)
        configuration.setAllowCredentials(true);
        
        // Cache de preflight requests (1 hora)
        configuration.setMaxAge(3600L);
        
        // Aplicar configuración a todas las rutas /api/**
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        
        return source;
    }
}