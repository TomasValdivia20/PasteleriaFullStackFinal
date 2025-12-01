package com.milsabores.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
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
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Categoria categoria;

    // CRITICAL FIX: fetch=EAGER prevents LazyInitializationException during JSON serialization
    // Without EAGER, Hibernate closes session before Jackson serializes, causing empty variantes[] in response
    // Build timestamp: 2025-12-01 Railway deployment verification
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference("producto-variantes")
    private Set<VarianteProducto> variantes = new HashSet<>();
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference("producto-imagenes")
    private Set<ImagenProducto> imagenes = new HashSet<>();
}