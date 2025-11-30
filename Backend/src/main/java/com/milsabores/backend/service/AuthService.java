package com.milsabores.backend.service;

import com.milsabores.backend.dto.LoginRequest;
import com.milsabores.backend.dto.LoginResponse;
import com.milsabores.backend.model.Usuario;
import com.milsabores.backend.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Servicio de autenticación
 * Capa de lógica de negocio - Clean Architecture
 */
@Service
public class AuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    @Autowired
    public AuthService(UsuarioRepository usuarioRepository, UsuarioService usuarioService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
    }

    /**
     * Autentica un usuario con credenciales
     * @param loginRequest correo y password
     * @return LoginResponse con datos del usuario o error
     */
    public LoginResponse authenticate(LoginRequest loginRequest) {
        logger.info("🔐 [AUTH] Intento de login para: {}", loginRequest.getCorreo());

        // Validar entrada
        if (loginRequest.getCorreo() == null || loginRequest.getPassword() == null) {
            logger.warn("⚠️ [AUTH] Credenciales vacías");
            return new LoginResponse("Correo y contraseña son obligatorios", false);
        }

        // Buscar usuario por correo
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(loginRequest.getCorreo());
        
        if (usuarioOpt.isEmpty()) {
            logger.warn("⚠️ [AUTH] Usuario no encontrado: {}", loginRequest.getCorreo());
            return new LoginResponse("Usuario no encontrado", false);
        }

        Usuario usuario = usuarioOpt.get();

        // Validar contraseña (NOTA: En producción usar BCrypt)
        if (!usuario.getPassword().equals(loginRequest.getPassword())) {
            logger.warn("⚠️ [AUTH] Contraseña incorrecta para: {}", loginRequest.getCorreo());
            return new LoginResponse("Contraseña incorrecta", false);
        }

        // Login exitoso
        logger.info("✅ [AUTH] Login exitoso para: {} - Rol: {}", 
                    usuario.getCorreo(), usuario.getRol().getNombre());

        return new LoginResponse(
            usuario.getId(),
            usuario.getNombre(),
            usuario.getApellido(),
            usuario.getCorreo(),
            usuario.getRol().getNombre(),
            "Login exitoso",
            true
        );
    }

    /**
     * Registrar nuevo usuario desde formulario público
     * @param usuario datos del nuevo usuario
     * @return LoginResponse con datos del usuario registrado
     */
    public LoginResponse registrar(Usuario usuario) {
        logger.info("📝 [REGISTRO] Intento de registro para: {}", usuario.getCorreo());

        try {
            // Delegar validación y creación al UsuarioService
            Usuario nuevoUsuario = usuarioService.registrar(usuario);

            logger.info("✅ [REGISTRO] Usuario registrado exitosamente: {}", nuevoUsuario.getCorreo());

            return new LoginResponse(
                nuevoUsuario.getId(),
                nuevoUsuario.getNombre(),
                nuevoUsuario.getApellido(),
                nuevoUsuario.getCorreo(),
                nuevoUsuario.getRol().getNombre(),
                "Registro exitoso",
                true
            );
        } catch (IllegalArgumentException e) {
            logger.warn("⚠️ [REGISTRO] Error de validación: {}", e.getMessage());
            return new LoginResponse(e.getMessage(), false);
        } catch (Exception e) {
            logger.error("❌ [REGISTRO] Error inesperado: {}", e.getMessage());
            return new LoginResponse("Error al registrar usuario", false);
        }
    }
}
