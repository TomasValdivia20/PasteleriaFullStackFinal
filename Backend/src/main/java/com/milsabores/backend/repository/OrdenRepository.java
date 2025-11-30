package com.milsabores.backend.repository;

import com.milsabores.backend.model.Orden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para entidad Orden
 * Capa de acceso a datos - Clean Architecture
 */
@Repository
public interface OrdenRepository extends JpaRepository<Orden, Long> {
    
    /**
     * Encontrar órdenes entre dos fechas
     */
    List<Orden> findByFechaBetweenOrderByFechaDesc(LocalDateTime inicio, LocalDateTime fin);
    
    /**
     * Encontrar todas las órdenes ordenadas por fecha descendente
     */
    List<Orden> findAllByOrderByFechaDesc();
    
    /**
     * Sumar total de ventas entre dos fechas
     */
    @Query("SELECT SUM(o.total) FROM Orden o WHERE o.fecha BETWEEN :inicio AND :fin")
    Long sumTotalByFechaBetween(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
    
    /**
     * Contar órdenes entre dos fechas
     */
    Long countByFechaBetween(LocalDateTime inicio, LocalDateTime fin);
}
