package com.milsabores.backend.health;

import com.milsabores.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * Custom Health Indicator para verificar estado de la base de datos
 * 
 * Específicamente verifica:
 * - Conexión a base de datos activa
 * - Existencia de datos (productos)
 * - Performance de queries
 * 
 * Endpoint: GET /actuator/health
 * 
 * Response example:
 * {
 *   "status": "UP",
 *   "components": {
 *     "database": {
 *       "status": "UP",
 *       "details": {
 *         "totalProductos": 18,
 *         "queryTime": "45ms"
 *       }
 *     }
 *   }
 * }
 */
@Component("database")
public class DatabaseHealthIndicator implements HealthIndicator {

    @Autowired
    private ProductoRepository productoRepository;

    @Override
    public Health health() {
        try {
            // Medir tiempo de query
            long startTime = System.currentTimeMillis();
            long totalProductos = productoRepository.count();
            long queryTime = System.currentTimeMillis() - startTime;
            
            // UP si la query fue exitosa
            Health.Builder builder = Health.up();
            
            // Agregar detalles
            builder.withDetail("totalProductos", totalProductos);
            builder.withDetail("queryTime", queryTime + "ms");
            
            // WARN si no hay datos
            if (totalProductos == 0) {
                builder.status("UP").withDetail("warning", "No hay productos en la base de datos");
            }
            
            // WARN si query tarda más de 1 segundo
            if (queryTime > 1000) {
                builder.withDetail("warning", "Query lenta (>" + queryTime + "ms)");
            }
            
            return builder.build();
            
        } catch (Exception e) {
            // DOWN si falla conexión a DB
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .withDetail("cause", e.getClass().getSimpleName())
                    .build();
        }
    }
}
