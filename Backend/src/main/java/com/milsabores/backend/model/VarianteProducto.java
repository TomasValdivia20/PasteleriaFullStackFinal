package com.milsabores.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "variantes_producto")
@Data @NoArgsConstructor @AllArgsConstructor
public class VarianteProducto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private Integer precio;
    private Integer stock;

    @Column(length = 500)
    private String infoNutricional;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    @JsonBackReference("producto-variantes")
    private Producto producto;
}