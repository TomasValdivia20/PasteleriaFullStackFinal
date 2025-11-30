package com.milsabores.backend.repository;

import com.milsabores.backend.model.Contacto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para acceso a datos de Contactos
 * Clean Architecture - Data Access Layer
 */
@Repository
public interface ContactoRepository extends JpaRepository<Contacto, Long> {
    
    /**
     * Buscar contactos por estado de lectura
     * @param leido true para mensajes leídos, false para no leídos
     * @return Lista de contactos filtrados
     */
    List<Contacto> findByLeidoOrderByFechaEnvioDesc(Boolean leido);
    
    /**
     * Obtener todos los contactos ordenados por fecha descendente
     * @return Lista de contactos ordenada (más recientes primero)
     */
    List<Contacto> findAllByOrderByFechaEnvioDesc();
    
    /**
     * Contar mensajes no leídos
     * @return Cantidad de mensajes pendientes de revisión
     */
    Long countByLeido(Boolean leido);
}
