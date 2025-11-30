package com.milsabores.backend.controller;

import com.milsabores.backend.dto.LoginRequest;
import com.milsabores.backend.dto.LoginResponse;
import com.milsabores.backend.model.Usuario;
import com.milsabores.backend.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controlador REST para autenticación
 * Capa de presentación - MVC Pattern
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Endpoint de login
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        logger.info("📥 [LOGIN] Request recibido para: {}", loginRequest.getCorreo());

        LoginResponse response = authService.authenticate(loginRequest);

        if (response.isSuccess()) {
            logger.info("✅ [LOGIN] Login exitoso: {}", loginRequest.getCorreo());
            return ResponseEntity.ok(response);
        } else {
            logger.warn("❌ [LOGIN] Login fallido: {}", response.getMensaje());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    /**
     * Endpoint de registro de nuevos usuarios
     * POST /api/auth/registro
     */
    @PostMapping("/registro")
    public ResponseEntity<LoginResponse> registro(@RequestBody Map<String, String> request) {
        logger.info("📝 [REGISTRO] Request recibido para: {}", request.get("correo"));

        try {
            // Mapear request a Usuario
            Usuario usuario = new Usuario();
            usuario.setRut(request.get("rut"));
            usuario.setNombre(request.get("nombre"));
            usuario.setApellido(request.get("apellido"));
            usuario.setCorreo(request.get("correo"));
            usuario.setPassword(request.get("password"));
            usuario.setDireccion(request.get("direccion"));
            usuario.setRegion(request.get("region"));
            usuario.setComuna(request.get("comuna"));

            LoginResponse response = authService.registrar(usuario);

            if (response.isSuccess()) {
                logger.info("✅ [REGISTRO] Registro exitoso: {}", request.get("correo"));
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                logger.warn("❌ [REGISTRO] Registro fallido: {}", response.getMensaje());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            logger.error("❌ [REGISTRO] Error inesperado: {}", e.getMessage());
            LoginResponse errorResponse = new LoginResponse("Error al procesar el registro", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
