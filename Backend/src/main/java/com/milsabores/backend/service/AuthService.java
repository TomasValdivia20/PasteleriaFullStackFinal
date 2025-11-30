package com.milsabores.backend.service;

import com.milsabores.backend.dto.LoginRequest;
import com.milsabores.backend.dto.LoginResponse;
import com.milsabores.backend.model.Usuario;
import com.milsabores.backend.repository.UsuarioRepository;
import com.milsabores.backend.security.CustomUserDetailsService;
import com.milsabores.backend.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Servicio de autenticación con JWT
 * Capa de lógica de negocio - Clean Architecture
 */
@Service
public class AuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(
            UsuarioRepository usuarioRepository, 
            UsuarioService usuarioService,
            JwtUtil jwtUtil,
            CustomUserDetailsService userDetailsService,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Autentica un usuario con credenciales y genera token JWT
     * @param loginRequest correo y password
     * @return LoginResponse con datos del usuario y token
     */
    public LoginResponse authenticate(LoginRequest loginRequest) {
        logger.info("🔐 [AUTH] Intento de login para: {}", loginRequest.getCorreo());

        try {
            // Validar entrada
            if (loginRequest.getCorreo() == null || loginRequest.getPassword() == null) {
                logger.warn("⚠️ [AUTH] Credenciales vacías");
                return new LoginResponse("Correo y contraseña son obligatorios", false);
            }

            // Autenticar con Spring Security
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getCorreo(),
                    loginRequest.getPassword()
                )
            );

            // Cargar usuario desde BD
            Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(loginRequest.getCorreo());
            if (usuarioOpt.isEmpty()) {
                logger.warn("⚠️ [AUTH] Usuario no encontrado: {}", loginRequest.getCorreo());
                return new LoginResponse("Usuario no encontrado", false);
            }

            Usuario usuario = usuarioOpt.get();
            
            // Cargar UserDetails para generar token
            UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getCorreo());
            String token = jwtUtil.generateToken(userDetails, usuario.getRol().getNombre());

            // Login exitoso
            logger.info("✅ [AUTH] Login exitoso para: {} - Rol: {}", 
                        usuario.getCorreo(), usuario.getRol().getNombre());

            return new LoginResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getRol().getNombre(),
                token,
                "Login exitoso",
                true
            );
        } catch (BadCredentialsException e) {
            logger.warn("⚠️ [AUTH] Credenciales inválidas para: {}", loginRequest.getCorreo());
            return new LoginResponse("Correo o contraseña incorrectos", false);
        } catch (Exception e) {
            logger.error("❌ [AUTH] Error en autenticación: {}", e.getMessage());
            return new LoginResponse("Error al autenticar usuario", false);
        }
    }

    /**
     * Registrar nuevo usuario desde formulario público
     * @param usuario datos del nuevo usuario
     * @return LoginResponse con datos del usuario registrado y token
     */
    public LoginResponse registrar(Usuario usuario) {
        logger.info("📝 [REGISTRO] Intento de registro para: {}", usuario.getCorreo());

        try {
            // Delegar validación y creación al UsuarioService
            Usuario nuevoUsuario = usuarioService.registrar(usuario);

            // Generar token para auto-login
            UserDetails userDetails = userDetailsService.loadUserByUsername(nuevoUsuario.getCorreo());
            String token = jwtUtil.generateToken(userDetails, nuevoUsuario.getRol().getNombre());

            logger.info("✅ [REGISTRO] Usuario registrado exitosamente: {}", nuevoUsuario.getCorreo());

            return new LoginResponse(
                nuevoUsuario.getId(),
                nuevoUsuario.getNombre(),
                nuevoUsuario.getApellido(),
                nuevoUsuario.getCorreo(),
                nuevoUsuario.getRol().getNombre(),
                token,
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
