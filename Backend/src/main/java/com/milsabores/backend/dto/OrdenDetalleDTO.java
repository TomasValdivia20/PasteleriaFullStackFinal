package com.milsabores.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para respuesta detallada de orden con productos
 * Incluye lista completa de productos, variantes, cantidades y precios
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdenDetalleDTO {
    private Long id;
    private String clienteNombre;
    private String clienteApellido;
    private String clienteDireccion;
    private String clienteRegion;
    private LocalDateTime fecha;
    private String estado;
    private Integer total;
    private List<ProductoOrdenDTO> productos;
}
