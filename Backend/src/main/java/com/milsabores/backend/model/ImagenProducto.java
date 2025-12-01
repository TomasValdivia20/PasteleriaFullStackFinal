package com.milsabores.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entidad para almacenar referencias a imágenes en Supabase Storage
 * Cada producto puede tener múltiples imágenes
 */
@Entity
@Table(name = "imagenes_producto")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImagenProducto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    @JsonBackReference("producto-imagenes")
    private Producto producto;
    
    /**
     * URL pública completa de Supabase Storage
     * Formato: https://dzbeucldelrjdjprfday.supabase.co/storage/v1/object/public/pasteles/producto_123_imagen1.jpg
     */
    @Column(nullable = false, length = 500)
    private String urlSupabase;
    
    /**
     * Nombre del archivo en Supabase Storage
     * Formato: producto_123_imagen1.jpg
     */
    @Column(nullable = false, length = 255)
    private String nombreArchivo;
    
    /**
     * Tipo MIME de la imagen
     * Ejemplos: image/jpeg, image/png, image/webp
     */
    @Column(length = 100)
    private String tipoMime;
    
    /**
     * Tamaño del archivo en bytes
     */
    private Long tamanoBytes;
    
    /**
     * Indica si es la imagen principal del producto
     * Solo puede haber una imagen principal por producto
     */
    @Column(nullable = false)
    private Boolean esPrincipal = false;
    
    /**
     * Orden de visualización de la imagen
     */
    private Integer orden = 0;
    
    /**
     * Fecha de carga de la imagen
     */
    @Column(nullable = false)
    private LocalDateTime fechaCarga;
    
    @PrePersist
    protected void onCreate() {
        if (fechaCarga == null) {
            fechaCarga = LocalDateTime.now();
        }
    }
}
