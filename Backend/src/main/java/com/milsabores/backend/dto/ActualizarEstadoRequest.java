package com.milsabores.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO para recibir actualización de estado de orden
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarEstadoRequest {
    private String nuevoEstado; // "COMPLETADA", "ENTREGADA", etc.
}
