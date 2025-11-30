package com.milsabores.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO para respuesta de login
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String nombre;
    private String apellido;
    private String correo;
    private String rol; // "ADMIN", "CLIENTE", "EMPLEADO"
    private String token; // Token JWT
    private String mensaje;
    private boolean success;

    // Constructor para respuestas de error
    public LoginResponse(String mensaje, boolean success) {
        this.mensaje = mensaje;
        this.success = success;
    }
}
