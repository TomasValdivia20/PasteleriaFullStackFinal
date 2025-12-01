package com.milsabores.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * 🔴 CONTROLADOR TEMPORAL DE DEBUG - ELIMINAR DESPUÉS DE RESOLVER VARIANTES=0
 * 
 * Propósito: Ejecutar queries SQL directamente desde Railway para diagnosticar
 * por qué Hibernate retorna 0 variantes cuando Supabase SQL Editor muestra 7.
 * 
 * Endpoint: GET /api/debug/db-info
 * 
 * IMPORTANTE: Este controller NO debe estar en producción.
 * Eliminar después de resolver el problema.
 */
@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class DebugController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Endpoint de diagnóstico que ejecuta queries SQL directas
     * para verificar qué ve Railway en la base de datos.
     * 
     * @return Map con resultados de todas las queries de diagnóstico
     */
    @GetMapping("/db-info")
    public Map<String, Object> getDatabaseInfo() {
        Map<String, Object> diagnostico = new LinkedHashMap<>();
        
        try {
            // PASO 1: Verificar conexión y contexto
            diagnostico.put("1_conexion", jdbcTemplate.queryForMap(
                "SELECT current_database() AS database_name, " +
                "current_schema() AS schema_name, " +
                "current_user AS user_name, " +
                "inet_server_port() AS server_port"
            ));
            
            // PASO 2: Verificar que tabla existe
            diagnostico.put("2_tabla_existe", jdbcTemplate.queryForList(
                "SELECT table_schema, table_name " +
                "FROM information_schema.tables " +
                "WHERE table_name = 'variantes_producto'"
            ));
            
            // PASO 3: Contar TODAS las variantes
            diagnostico.put("3_total_variantes", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM variantes_producto",
                Long.class
            ));
            
            // PASO 4: Contar variantes con producto_id=1 🚨 CRÍTICO
            Long countProducto1 = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM variantes_producto WHERE producto_id = 1",
                Long.class
            );
            diagnostico.put("4_variantes_producto_1_COUNT", countProducto1);
            
            // PASO 5: Listar variantes con producto_id=1 🚨 CRÍTICO
            List<Map<String, Object>> variantesProducto1 = jdbcTemplate.queryForList(
                "SELECT id, nombre, precio, producto_id, stock " +
                "FROM variantes_producto " +
                "WHERE producto_id = 1 " +
                "ORDER BY id"
            );
            diagnostico.put("5_variantes_producto_1_LISTA", variantesProducto1);
            
            // PASO 6: Verificar Row Level Security
            diagnostico.put("6_rls_status", jdbcTemplate.queryForList(
                "SELECT schemaname, tablename, rowsecurity AS rls_enabled " +
                "FROM pg_tables " +
                "WHERE tablename = 'variantes_producto'"
            ));
            
            // PASO 7: Verificar policies (si RLS activo)
            try {
                diagnostico.put("7_rls_policies", jdbcTemplate.queryForList(
                    "SELECT schemaname, tablename, policyname, roles, cmd " +
                    "FROM pg_policies " +
                    "WHERE tablename = 'variantes_producto'"
                ));
            } catch (Exception e) {
                diagnostico.put("7_rls_policies", "No policies found or error: " + e.getMessage());
            }
            
            // PASO 8: Verificar permisos del usuario
            diagnostico.put("8_user_privileges", jdbcTemplate.queryForList(
                "SELECT grantee, table_name, privilege_type " +
                "FROM information_schema.role_table_grants " +
                "WHERE table_name = 'variantes_producto' " +
                "AND grantee = current_user"
            ));
            
            // PASO 9: Query exacta que ejecuta Hibernate
            diagnostico.put("9_hibernate_query_simulation", jdbcTemplate.queryForList(
                "SELECT v1_0.producto_id, v1_0.id, v1_0.info_nutricional, " +
                "v1_0.nombre, v1_0.precio, v1_0.stock " +
                "FROM variantes_producto v1_0 " +
                "WHERE v1_0.producto_id = ?",
                1L  // producto_id = 1
            ));
            
            // RESUMEN
            diagnostico.put("_RESUMEN", Map.of(
                "esperado_variantes_producto_1", 7,
                "encontrado_variantes_producto_1", countProducto1,
                "problema_detectado", countProducto1 == 0 ? 
                    "❌ RAILWAY NO VE LOS DATOS - Posible RLS o DB diferente" : 
                    "✅ DATOS VISIBLES - Problema en Hibernate mapping"
            ));
            
        } catch (Exception e) {
            diagnostico.put("ERROR", Map.of(
                "message", e.getMessage(),
                "class", e.getClass().getName(),
                "stackTrace", Arrays.toString(e.getStackTrace()).substring(0, 500)
            ));
        }
        
        return diagnostico;
    }
    
    /**
     * Endpoint para forzar refresh de EntityManager
     */
    @PostMapping("/clear-cache")
    public Map<String, String> clearCache() {
        // Simplemente retorna OK - el objetivo es forzar un nuevo request
        return Map.of(
            "status", "OK",
            "message", "Cache cleared (no-op, pero fuerza nuevo request)"
        );
    }
}
