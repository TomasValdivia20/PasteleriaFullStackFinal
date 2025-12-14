package com.milsabores.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO para representar productos dentro de una orden
 * Incluye información de producto, variante (si aplica), cantidad y precios
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoOrdenDTO {
    private String nombreProducto;
    private String nombreVariante; // null si no tiene variante
    private Integer cantidad;
    private Integer precioUnitario;
    private Integer subtotal;
}
