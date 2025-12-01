package com.milsabores.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.OnDelete; // Importar
import org.hibernate.annotations.OnDeleteAction; // Importar
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "productos")
@Data @NoArgsConstructor @AllArgsConstructor
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(length = 1000)
    private String descripcion;

    private String imagen; // DEPRECATED: Se mantiene por compatibilidad, usar imagenes[]

    private Integer precioBase;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    // Fuerza a la base de datos a configurar la llave foránea con "ON DELETE CASCADE"
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Categoria categoria;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<VarianteProducto> variantes = new HashSet<>();
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ImagenProducto> imagenes = new HashSet<>();
}