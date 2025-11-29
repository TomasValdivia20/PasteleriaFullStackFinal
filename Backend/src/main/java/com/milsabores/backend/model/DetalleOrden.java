package com.milsabores.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // <--- Para evitar bucles de info
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "detalles_orden")
@Data @NoArgsConstructor @AllArgsConstructor
public class DetalleOrden {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer cantidad;
    private Integer precioUnitario;
    private Integer subtotal;

    @ManyToOne
    @JoinColumn(name = "orden_id", nullable = false)
    @JsonIgnore // <--- Evita que al pedir el detalle, vuelva a traer toda la orden padre
    private Orden orden;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "variante_id")
    private VarianteProducto variante;
}