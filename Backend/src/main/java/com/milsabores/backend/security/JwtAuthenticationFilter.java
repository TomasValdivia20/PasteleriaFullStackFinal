package com.milsabores.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro JWT para validar tokens en cada request
 * Clean Architecture - Filtro de infraestructura
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");
        final String requestPath = request.getRequestURI();
        final String method = request.getMethod();

        String username = null;
        String jwt = null;

        // Extraer token del header Authorization
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                logger.debug("🔐 [JWT Filter] Token encontrado para usuario: {}", username);
            } catch (Exception e) {
                logger.warn("⚠️ [JWT Filter] Error al extraer username del token en {}: {}", requestPath, e.getMessage());
                // Si hay error extrayendo username, continuar sin autenticación
                // Esto permite que endpoints públicos funcionen incluso con token inválido
            }
        } else {
            logger.debug("📭 [JWT Filter] No se encontró token Bearer en: {} {}", method, requestPath);
        }

        // Validar token y establecer autenticación
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authenticationToken = 
                        new UsernamePasswordAuthenticationToken(
                            userDetails, 
                            null, 
                            userDetails.getAuthorities()
                        );
                    
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    
                    logger.info("✅ [JWT Filter] Autenticación establecida para: {} (rol: {}) en: {} {}", 
                        username, 
                        userDetails.getAuthorities(),
                        method,
                        requestPath);
                } else {
                    logger.warn("❌ [JWT Filter] Token inválido para: {} en: {} {}", username, method, requestPath);
                    // No establecer autenticación si token es inválido
                    // Esto permite que endpoints públicos funcionen incluso con token inválido
                }
            } catch (Exception e) {
                logger.error("❌ [JWT Filter] Error en autenticación para {} en {} {}: {}", 
                    username, method, requestPath, e.getMessage());
                // No establecer autenticación si hay error
                // Esto permite que endpoints públicos funcionen incluso con error en token
            }
        }

        // IMPORTANTE: Siempre continuar con la cadena de filtros
        // Spring Security decidirá si rechazar basándose en SecurityConfig
        filterChain.doFilter(request, response);
    }
}
