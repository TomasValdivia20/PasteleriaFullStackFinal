package com.milsabores.backend.security;

import com.milsabores.backend.model.Usuario;
import com.milsabores.backend.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Servicio personalizado para cargar usuarios desde la base de datos
 * Implementa UserDetailsService de Spring Security
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        logger.info("🔍 [UserDetails] Cargando usuario: {}", correo);

        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> {
                    logger.error("❌ [UserDetails] Usuario no encontrado: {}", correo);
                    return new UsernameNotFoundException("Usuario no encontrado: " + correo);
                });

        // Construir authorities (roles)
        List<GrantedAuthority> authorities = new ArrayList<>();
        String roleName = "ROLE_" + usuario.getRol().getNombre().toUpperCase();
        authorities.add(new SimpleGrantedAuthority(roleName));

        logger.info("✅ [UserDetails] Usuario cargado: {} con rol: {}", correo, roleName);

        return User.builder()
                .username(usuario.getCorreo())
                .password(usuario.getPassword())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}
