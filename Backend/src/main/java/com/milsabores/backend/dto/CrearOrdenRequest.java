package com.milsabores.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

/**
 * DTO para recibir datos de creación de orden desde Frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CrearOrdenRequest {
    private Long usuarioId;
    private Integer totalOrden;
    private List<ItemOrden> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemOrden {
        private Long productoId;
        private Long varianteId; // Puede ser null si no tiene variante
        private Integer cantidad;
        private Integer precioUnitario;
        private String nombreProducto;
        private String tamano; // Para mostrar en resumen
    }
}
