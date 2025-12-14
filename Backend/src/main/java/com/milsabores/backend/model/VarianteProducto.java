package com.milsabores.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Objects;

/**
 * FIX equals/hashCode para Set compatibility (2025-12-13):
 * PROBLEMA: @Data genera equals/hashCode con TODOS los campos (incluyendo 'producto')
 * CAUSA: Comparación circular Variante→Producto→Variante causa loop infinito
 *        HashCode inestable cuando se asigna 'producto', Set descarta elementos
 * SOLUCIÓN: equals/hashCode usando SOLO 'id' (PK) sin incluir 'producto'
 * 
 * IMPORTANTE: En entidades JPA con relaciones bidireccionales:
 * - NUNCA incluir la relación padre en equals/hashCode
 * - Usar solo ID para comparación de identidad
 * - Usar @Getter/@Setter en lugar de @Data para control manual
 */
@Entity
@Table(name = "variantes_producto")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
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

    /**
     * equals/hashCode usando SOLO el ID (PK)
     * Evita comparación circular y garantiza estabilidad en HashSet
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof VarianteProducto)) return false;
        VarianteProducto that = (VarianteProducto) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode(); // Constante durante toda la vida del objeto
    }
}