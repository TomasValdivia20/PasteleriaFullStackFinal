package com.milsabores.backend.repository;

import com.milsabores.backend.model.DetalleOrden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio para gestión de detalles de orden
 * Capa de persistencia - Clean Architecture
 */
@Repository
public interface DetalleOrdenRepository extends JpaRepository<DetalleOrden, Long> {
    // Métodos de consulta heredados de JpaRepository
}
