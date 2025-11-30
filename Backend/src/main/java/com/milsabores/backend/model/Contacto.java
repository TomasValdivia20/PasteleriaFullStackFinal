package com.milsabores.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entidad que representa un mensaje de contacto enviado por usuarios
 * Permite a los administradores gestionar las solicitudes de contacto
 */
@Entity
@Table(name = "contactos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contacto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String nombre;
    
    @Column(nullable = false, length = 200)
    private String email;
    
    @Column(length = 20)
    private String telefono;
    
    @Column(nullable = false, length = 2000)
    private String mensaje;
    
    @Column(name = "fecha_envio", nullable = false)
    private LocalDateTime fechaEnvio;
    
    @Column(nullable = false)
    private Boolean leido = false;
    
    @PrePersist
    protected void onCreate() {
        if (fechaEnvio == null) {
            fechaEnvio = LocalDateTime.now();
        }
        if (leido == null) {
            leido = false;
        }
    }
}
