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

    @Autowired
    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
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
}
