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

    private Integer precioBase;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Categoria categoria;

    /**
     * FIX Session Pooler compatibility (2025-12-13):
     * PROBLEMA: Session Pooler + LAZY + JOIN FETCH retorna variantes vacías
     * CAUSA: Session cierra antes de serialización JSON, lazy collections se pierden
     * SOLUCIÓN: Cambiar a EAGER para forzar carga inmediata en la query principal
     * 
     * JOIN FETCH + EAGER garantiza:
     * - Una sola query con JOIN (no queries separadas)
     * - Collections cargadas antes de cerrar session
     * - Serializació JSON sin LazyInitializationException
     * 
     * NOTA: EAGER solo ejecuta queries separadas si NO usamos JOIN FETCH
     * Como SIEMPRE usamos findByIdWithCollections() con JOIN FETCH, es seguro
     */
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference("producto-variantes")
    private Set<VarianteProducto> variantes = new HashSet<>();
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference("producto-imagenes")
    private Set<ImagenProducto> imagenes = new HashSet<>();
}