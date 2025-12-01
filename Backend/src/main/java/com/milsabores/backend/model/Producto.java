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

    /**
     * FIX PgBouncer compatibility (2025-12-01):
     * - Changed from FetchType.EAGER to FetchType.LAZY
     * - EAGER caused Hibernate to execute BOTH: JOIN FETCH (explicit) AND separate queries (EAGER)
     * - Separate EAGER queries fail in PgBouncer transaction pooling (return 0 rows)
     * - Now we rely ONLY on JOIN FETCH in ProductoRepository.*WithCollections() methods
     * - JOIN FETCH loads collections in single query, avoiding session/pooling issues
     * - @Transactional(readOnly=true) in Service ensures session stays open for Jackson serialization
     */
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("producto-variantes")
    private Set<VarianteProducto> variantes = new HashSet<>();
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("producto-imagenes")
    private Set<ImagenProducto> imagenes = new HashSet<>();
}