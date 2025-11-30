package com.milsabores.backend.controller;

import com.milsabores.backend.model.Usuario;
import com.milsabores.backend.service.UsuarioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestión de usuarios
 * Capa de presentación - MVC Pattern
 * Solo accesible por ADMIN
 * CORS configurado globalmente en SecurityConfig
 */
@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);
    private final UsuarioService usuarioService;

    @Autowired
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /**
     * Listar todos los usuarios (ADMIN)
     * GET /api/usuarios
     */
    @GetMapping
    public ResponseEntity<List<Usuario>> listarTodos() {
        logger.info("📋 [GET] /api/usuarios - Listar todos los usuarios");
        
        try {
            List<Usuario> usuarios = usuarioService.listarTodos();
            logger.info("✅ [GET] Usuarios listados - Total: {}", usuarios.size());
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            logger.error("❌ [GET] Error al listar usuarios: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtener usuario por ID (ADMIN)
     * GET /api/usuarios/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        logger.info("🔍 [GET] /api/usuarios/{} - Obtener usuario", id);
        
        try {
            Usuario usuario = usuarioService.obtenerPorId(id);
            logger.info("✅ [GET] Usuario encontrado - ID: {}", id);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            logger.warn("⚠️ [GET] Usuario no encontrado - ID: {}", id);
            Map<String, String> error = new HashMap<>();
            error.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            logger.error("❌ [GET] Error inesperado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Crear nuevo usuario (ADMIN)
     * POST /api/usuarios
     * Body: { rut, nombre, apellido, correo, password, direccion, region, comuna, rol }
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, String> request) {
        logger.info("➕ [POST] /api/usuarios - Crear usuario");
        
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

            String nombreRol = request.get("rol");
            
            Usuario nuevoUsuario = usuarioService.crear(usuario, nombreRol);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Usuario creado exitosamente");
            response.put("id", nuevoUsuario.getId());
            
            logger.info("✅ [POST] Usuario creado - ID: {}, Rol: {}", nuevoUsuario.getId(), nombreRol);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("⚠️ [POST] Error de validación: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            logger.error("❌ [POST] Error inesperado: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error al crear usuario");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Actualizar usuario existente (ADMIN)
     * PUT /api/usuarios/{id}
     * Body: { rut, nombre, apellido, correo, password, direccion, region, comuna, rol }
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Map<String, String> request) {
        logger.info("✏️ [PUT] /api/usuarios/{} - Actualizar usuario", id);
        
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

            String nombreRol = request.get("rol");
            
            Usuario actualizado = usuarioService.actualizar(id, usuario, nombreRol);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Usuario actualizado exitosamente");
            response.put("id", actualizado.getId());
            
            logger.info("✅ [PUT] Usuario actualizado - ID: {}", id);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("⚠️ [PUT] Error de validación: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (RuntimeException e) {
            logger.warn("⚠️ [PUT] Usuario no encontrado - ID: {}", id);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            logger.error("❌ [PUT] Error inesperado: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error al actualizar usuario");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Eliminar usuario (ADMIN)
     * DELETE /api/usuarios/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        logger.info("🗑️ [DELETE] /api/usuarios/{} - Eliminar usuario", id);
        
        try {
            usuarioService.eliminar(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Usuario eliminado exitosamente");
            
            logger.info("✅ [DELETE] Usuario eliminado - ID: {}", id);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("⚠️ [DELETE] Operación no permitida: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (RuntimeException e) {
            logger.warn("⚠️ [DELETE] Usuario no encontrado - ID: {}", id);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            logger.error("❌ [DELETE] Error inesperado: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error al eliminar usuario");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
