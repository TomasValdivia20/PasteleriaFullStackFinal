package com.milsabores.backend.repository;

import com.milsabores.backend.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para Producto
 * 
 * @EntityGraph: Optimiza queries para prevenir N+1 problem
 * Carga EAGER relaciones especificadas en una sola query con LEFT JOIN
 */
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    /**
     * Encuentra productos por categoría ID
     * Carga eager: categoria, variantes, imagenes para evitar N+1 problem
     */
    @EntityGraph(attributePaths = {"categoria", "variantes", "imagenes"})
    List<Producto> findByCategoriaId(Long categoriaId);
    
    /**
     * Override findAll para cargar eager las relaciones
     * Evita N+1 problem al listar todos los productos
     */
    @Override
    @EntityGraph(attributePaths = {"categoria", "variantes", "imagenes"})
    List<Producto> findAll();
    
    /**
     * Override findById para cargar eager las relaciones
     * Evita N+1 problem al obtener un producto
     */
    @Override
    @EntityGraph(attributePaths = {"categoria", "variantes", "imagenes"})
    Optional<Producto> findById(Long id);
    
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
