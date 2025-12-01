package com.milsabores.backend.repository;

import com.milsabores.backend.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para Producto
 * 
 * FIX: @EntityGraph REMOVIDO - incompatible con PgBouncer + causa queries duplicadas
 * Usar SOLO queries custom con JOIN FETCH explícito
 */
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    /**
     * FIX ALTERNATIVO: JPQL con JOIN FETCH explícito
     * Si @EntityGraph falla en PgBouncer, usar JOIN FETCH directo
     * FETCH carga collections en una sola query (no lazy)
     */
    @Query("SELECT DISTINCT p FROM Producto p " +
           "LEFT JOIN FETCH p.variantes " +
           "LEFT JOIN FETCH p.imagenes " +
           "LEFT JOIN FETCH p.categoria " +
           "WHERE p.id = :id")
    Optional<Producto> findByIdWithCollections(@Param("id") Long id);
    
    /**
     * FIX: findAll con JOIN FETCH explícito
     */
    @Query("SELECT DISTINCT p FROM Producto p " +
           "LEFT JOIN FETCH p.variantes " +
           "LEFT JOIN FETCH p.imagenes " +
           "LEFT JOIN FETCH p.categoria")
    List<Producto> findAllWithCollections();
    
    /**
     * FIX: findByCategoriaId con JOIN FETCH explícito
     */
    @Query("SELECT DISTINCT p FROM Producto p " +
           "LEFT JOIN FETCH p.variantes " +
           "LEFT JOIN FETCH p.imagenes " +
           "LEFT JOIN FETCH p.categoria " +
           "WHERE p.categoria.id = :categoriaId")
    List<Producto> findByCategoriaIdWithCollections(@Param("categoriaId") Long categoriaId);
}
