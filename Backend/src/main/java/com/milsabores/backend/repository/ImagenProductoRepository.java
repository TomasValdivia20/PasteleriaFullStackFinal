package com.milsabores.backend.repository;

import com.milsabores.backend.model.ImagenProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImagenProductoRepository extends JpaRepository<ImagenProducto, Long> {
    
    /**
     * Buscar todas las imágenes de un producto
     */
    List<ImagenProducto> findByProductoIdOrderByOrdenAsc(Long productoId);
    
    /**
     * Buscar la imagen principal de un producto
     */
    Optional<ImagenProducto> findByProductoIdAndEsPrincipalTrue(Long productoId);
    
    /**
     * Contar imágenes de un producto
     */
    long countByProductoId(Long productoId);
    
    /**
     * Eliminar todas las imágenes de un producto
     */
    void deleteByProductoId(Long productoId);
}
