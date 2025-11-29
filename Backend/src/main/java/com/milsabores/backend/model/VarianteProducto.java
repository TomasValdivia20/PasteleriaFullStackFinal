package com.milsabores.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // <--- para evitar bucles de info
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
    @JsonIgnore // <---Evita el bucle infinito.
    private Producto producto;
}