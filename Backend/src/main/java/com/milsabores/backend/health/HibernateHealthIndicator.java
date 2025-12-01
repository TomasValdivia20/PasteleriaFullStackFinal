package com.milsabores.backend.health;

import com.milsabores.backend.model.Producto;
import com.milsabores.backend.repository.ProductoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Custom Health Indicator para verificar lazy loading de Hibernate
 * 
 * Prueba específica del bug de Railway:
 * - Intenta cargar un producto con variantes
 * - Verifica que las variantes se carguen correctamente
 * - Detecta LazyInitializationException
 * 
 * Este health check es CRÍTICO para detectar el bug de Railway
 * donde fetch=EAGER no se aplica en deployments.
 * 
 * Endpoint: GET /actuator/health
 * 
 * Response example:
 * {
 *   "status": "UP",
 *   "components": {
 *     "hibernate": {
 *       "status": "UP",
 *       "details": {
 *         "lazyLoadingWorking": true,
 *         "testProductoId": 1,
 *         "variantesLoaded": 1,
 *         "imagenesLoaded": 1
 *       }
 *     }
 *   }
 * }
 */
@Component("hibernate")
public class HibernateHealthIndicator implements HealthIndicator {

    private static final Logger logger = LoggerFactory.getLogger(HibernateHealthIndicator.class);
    
    @Autowired
    private ProductoRepository productoRepository;
    
    // ID del producto para testing (usamos el primero)
    private static final Long TEST_PRODUCTO_ID = 1L;

    @Override
    @Transactional(readOnly = true)
    public Health health() {
        try {
            // Intentar cargar producto con variantes
            Optional<Producto> productoOpt = productoRepository.findById(TEST_PRODUCTO_ID);
            
            if (productoOpt.isEmpty()) {
                return Health.up()
                        .withDetail("warning", "Producto test no encontrado (ID=" + TEST_PRODUCTO_ID + ")")
                        .withDetail("lazyLoadingWorking", "unknown")
                        .build();
            }
            
            Producto producto = productoOpt.get();
            
            // Intentar acceder a colecciones lazy
            // Si hay LazyInitializationException, capturarla
            int variantesCount = 0;
            int imagenesCount = 0;
            boolean lazyLoadingWorking = true;
            String errorMessage = null;
            
            try {
                // Force initialization
                variantesCount = producto.getVariantes().size();
                imagenesCount = producto.getImagenes().size();
                
            } catch (org.hibernate.LazyInitializationException e) {
                lazyLoadingWorking = false;
                errorMessage = "LazyInitializationException: " + e.getMessage();
                logger.error("🔴 [HEALTH CHECK] Lazy loading FAILED - Railway bug detectado", e);
            }
            
            Health.Builder builder = Health.up();
            builder.withDetail("lazyLoadingWorking", lazyLoadingWorking);
            builder.withDetail("testProductoId", TEST_PRODUCTO_ID);
            builder.withDetail("variantesLoaded", variantesCount);
            builder.withDetail("imagenesLoaded", imagenesCount);
            
            if (!lazyLoadingWorking) {
                builder.status("DOWN");
                builder.withDetail("error", errorMessage);
                builder.withDetail("solution", "Verificar fetch=EAGER o spring.jpa.open-in-view=true");
            } else {
                // WARN si variantes o imagenes están vacías
                if (variantesCount == 0 || imagenesCount == 0) {
                    builder.withDetail("warning", "Producto no tiene variantes/imagenes");
                }
            }
            
            return builder.build();
            
        } catch (Exception e) {
            logger.error("🔴 [HEALTH CHECK] Error verificando Hibernate lazy loading", e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .withDetail("cause", e.getClass().getSimpleName())
                    .build();
        }
    }
}
