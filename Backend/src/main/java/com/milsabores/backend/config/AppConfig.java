package com.milsabores.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuración de beans de aplicación
 */
@Configuration
public class AppConfig {
    
    /**
     * Bean RestTemplate para hacer peticiones HTTP a Supabase Storage API
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
