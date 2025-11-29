package com.milsabores.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // Importante
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Entity
@Table(name = "categorias")
@Data @NoArgsConstructor @AllArgsConstructor
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String descripcion;
    private String imagen;

    // 🛑 NUEVO: Relación para permitir el borrado en cascada
    // "cascade = CascadeType.ALL" significa que si borras la categoría,
    // se borran también sus productos.
    @OneToMany(mappedBy = "categoria", cascade = CascadeType.ALL)
    @JsonIgnore // Evita bucles infinitos al convertir a JSON
    private List<Producto> productos;

    // Constructor auxiliar para el DataInitializer (si lo usas sin la lista)
    public Categoria(Long id, String nombre, String descripcion, String imagen) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.imagen = imagen;
    }
}