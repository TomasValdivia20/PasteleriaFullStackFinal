package com.milsabores.backend.controller;

import com.milsabores.backend.dto.LoginRequest;
import com.milsabores.backend.dto.LoginResponse;
import com.milsabores.backend.model.Usuario;
import com.milsabores.backend.repository.UsuarioRepository;
import com.milsabores.backend.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Controlador REST para autenticación
 * Capa de presentación - MVC Pattern
 * CORS configurado globalmente en SecurityConfig
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public AuthController(AuthService authService, UsuarioRepository usuarioRepository) {
        this.authService = authService;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Endpoint de login
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        logger.info("🔐 [REQUEST] POST /api/auth/login");
        logger.info("📧 [LOGIN] Correo: {}", loginRequest.getCorreo());
        logger.info("🔒 [LOGIN] Password recibida: {}", loginRequest.getPassword() != null ? "[PRESENTE]" : "[NULL]");

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
        logger.info("📝 [REQUEST] POST /api/auth/registro");
        logger.info("📧 [REGISTRO] Correo: {}", request.get("correo"));
        logger.info("👤 [REGISTRO] Nombre: {}", request.get("nombre"));
        logger.info("📍 [REGISTRO] Región: {}", request.get("region"));

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

    /**
     * Endpoint para obtener perfil del usuario autenticado
     * GET /api/auth/perfil
     * Requiere token JWT válido
     */
    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerPerfil() {
        logger.info("👤 [REQUEST] GET /api/auth/perfil");

        try {
            // Obtener usuario autenticado desde SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("⚠️ [PERFIL] Usuario no autenticado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("mensaje", "Usuario no autenticado"));
            }

            String correo = authentication.getName();
            logger.info("📧 [PERFIL] Usuario autenticado: {}", correo);

            Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correo);
            
            if (usuarioOpt.isEmpty()) {
                logger.warn("⚠️ [PERFIL] Usuario no encontrado en BD: {}", correo);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "Usuario no encontrado"));
            }

            Usuario usuario = usuarioOpt.get();
            logger.info("✅ [PERFIL] Perfil cargado - ID: {}, Rol: {}", usuario.getId(), usuario.getRol().getNombre());

            return ResponseEntity.ok(usuario);
            
        } catch (Exception e) {
            logger.error("❌ [PERFIL] Error inesperado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al obtener perfil"));
        }
    }
}
