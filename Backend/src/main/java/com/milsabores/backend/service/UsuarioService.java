package com.milsabores.backend.service;

import com.milsabores.backend.model.Rol;
import com.milsabores.backend.model.Usuario;
import com.milsabores.backend.repository.RolRepository;
import com.milsabores.backend.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Servicio de gestión de usuarios
 * Capa de lógica de negocio - Clean Architecture
 */
@Service
public class UsuarioService {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern RUT_PATTERN = Pattern.compile("^\\d{7,8}-[0-9kK]$");

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
    }

    /**
     * Registrar nuevo usuario (público - desde formulario)
     */
    @Transactional
    public Usuario registrar(Usuario usuario) {
        logger.info("📝 [USUARIO] Iniciando registro de usuario: {}", usuario.getCorreo());

        // Validaciones
        validarUsuario(usuario);

        // Verificar duplicados
        if (usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            logger.warn("⚠️ [USUARIO] Correo ya registrado: {}", usuario.getCorreo());
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        if (usuarioRepository.existsByRut(usuario.getRut())) {
            logger.warn("⚠️ [USUARIO] RUT ya registrado: {}", usuario.getRut());
            throw new IllegalArgumentException("El RUT ya está registrado");
        }

        // Asignar rol CLIENTE por defecto si no tiene
        if (usuario.getRol() == null) {
            Rol rolCliente = rolRepository.findByNombre("CLIENTE")
                    .orElseThrow(() -> new RuntimeException("Rol CLIENTE no encontrado en BD"));
            usuario.setRol(rolCliente);
        }

        // Guardar
        Usuario nuevoUsuario = usuarioRepository.save(usuario);
        logger.info("✅ [USUARIO] Usuario registrado exitosamente - ID: {}, RUT: {}", 
                    nuevoUsuario.getId(), nuevoUsuario.getRut());

        return nuevoUsuario;
    }

    /**
     * Crear usuario desde Backoffice (admin)
     */
    @Transactional
    public Usuario crear(Usuario usuario, String nombreRol) {
        logger.info("👤 [ADMIN] Creando usuario: {} - Rol: {}", usuario.getCorreo(), nombreRol);

        // Validaciones
        validarUsuario(usuario);

        // Verificar duplicados
        if (usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        if (usuarioRepository.existsByRut(usuario.getRut())) {
            throw new IllegalArgumentException("El RUT ya está registrado");
        }

        // Asignar rol específico
        Rol rol = rolRepository.findByNombre(nombreRol)
                .orElseThrow(() -> new IllegalArgumentException("Rol no válido: " + nombreRol));
        usuario.setRol(rol);

        // Guardar
        Usuario nuevoUsuario = usuarioRepository.save(usuario);
        logger.info("✅ [ADMIN] Usuario creado - ID: {}, Rol: {}", nuevoUsuario.getId(), nombreRol);

        return nuevoUsuario;
    }

    /**
     * Listar todos los usuarios (admin)
     */
    public List<Usuario> listarTodos() {
        logger.info("📋 [ADMIN] Listando todos los usuarios");
        List<Usuario> usuarios = usuarioRepository.findAll();
        logger.info("📊 [ADMIN] Total usuarios: {}", usuarios.size());
        return usuarios;
    }

    /**
     * Obtener usuario por ID
     */
    public Usuario obtenerPorId(Long id) {
        logger.info("🔍 [USUARIO] Buscando usuario ID: {}", id);
        return usuarioRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("❌ [USUARIO] Usuario no encontrado - ID: {}", id);
                    return new RuntimeException("Usuario no encontrado con ID: " + id);
                });
    }

    /**
     * Actualizar usuario existente (admin)
     */
    @Transactional
    public Usuario actualizar(Long id, Usuario usuarioActualizado, String nombreRol) {
        logger.info("✏️ [ADMIN] Actualizando usuario ID: {}", id);

        Usuario usuarioExistente = obtenerPorId(id);

        // Validar cambios de correo/RUT
        if (!usuarioExistente.getCorreo().equals(usuarioActualizado.getCorreo())) {
            if (usuarioRepository.existsByCorreo(usuarioActualizado.getCorreo())) {
                throw new IllegalArgumentException("El correo ya está en uso");
            }
        }

        if (!usuarioExistente.getRut().equals(usuarioActualizado.getRut())) {
            if (usuarioRepository.existsByRut(usuarioActualizado.getRut())) {
                throw new IllegalArgumentException("El RUT ya está en uso");
            }
        }

        // Actualizar campos
        usuarioExistente.setRut(usuarioActualizado.getRut());
        usuarioExistente.setNombre(usuarioActualizado.getNombre());
        usuarioExistente.setApellido(usuarioActualizado.getApellido());
        usuarioExistente.setCorreo(usuarioActualizado.getCorreo());
        usuarioExistente.setDireccion(usuarioActualizado.getDireccion());
        usuarioExistente.setRegion(usuarioActualizado.getRegion());
        usuarioExistente.setComuna(usuarioActualizado.getComuna());

        // Actualizar password solo si se proporciona uno nuevo
        if (usuarioActualizado.getPassword() != null && !usuarioActualizado.getPassword().isEmpty()) {
            usuarioExistente.setPassword(usuarioActualizado.getPassword());
        }

        // Actualizar rol si se proporciona
        if (nombreRol != null && !nombreRol.isEmpty()) {
            Rol rol = rolRepository.findByNombre(nombreRol)
                    .orElseThrow(() -> new IllegalArgumentException("Rol no válido: " + nombreRol));
            usuarioExistente.setRol(rol);
        }

        Usuario guardado = usuarioRepository.save(usuarioExistente);
        logger.info("✅ [ADMIN] Usuario actualizado - ID: {}", id);

        return guardado;
    }

    /**
     * Eliminar usuario (admin)
     */
    @Transactional
    public void eliminar(Long id) {
        logger.info("🗑️ [ADMIN] Eliminando usuario ID: {}", id);

        Usuario usuario = obtenerPorId(id);
        
        // Evitar eliminar el último admin
        if (usuario.getRol().getNombre().equals("ADMIN")) {
            long cantidadAdmins = usuarioRepository.findAll().stream()
                    .filter(u -> u.getRol().getNombre().equals("ADMIN"))
                    .count();
            
            if (cantidadAdmins <= 1) {
                throw new IllegalArgumentException("No se puede eliminar el último administrador del sistema");
            }
        }

        usuarioRepository.deleteById(id);
        logger.info("✅ [ADMIN] Usuario eliminado - ID: {}", id);
    }

    /**
     * Validar datos del usuario
     */
    private void validarUsuario(Usuario usuario) {
        // RUT
        if (usuario.getRut() == null || usuario.getRut().trim().isEmpty()) {
            throw new IllegalArgumentException("El RUT es obligatorio");
        }
        if (!RUT_PATTERN.matcher(usuario.getRut()).matches()) {
            throw new IllegalArgumentException("Formato de RUT inválido. Use formato: 12345678-5");
        }
        if (!validarDigitoVerificadorRut(usuario.getRut())) {
            throw new IllegalArgumentException("El dígito verificador del RUT es inválido");
        }

        // Nombre
        if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        if (usuario.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre no puede exceder 100 caracteres");
        }

        // Apellido
        if (usuario.getApellido() == null || usuario.getApellido().trim().isEmpty()) {
            throw new IllegalArgumentException("El apellido es obligatorio");
        }
        if (usuario.getApellido().length() > 100) {
            throw new IllegalArgumentException("El apellido no puede exceder 100 caracteres");
        }

        // Email
        if (usuario.getCorreo() == null || usuario.getCorreo().trim().isEmpty()) {
            throw new IllegalArgumentException("El correo es obligatorio");
        }
        if (!EMAIL_PATTERN.matcher(usuario.getCorreo()).matches()) {
            throw new IllegalArgumentException("Formato de correo electrónico inválido");
        }
        if (usuario.getCorreo().length() > 255) {
            throw new IllegalArgumentException("El correo no puede exceder 255 caracteres");
        }

        // Password
        if (usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("La contraseña es obligatoria");
        }
        if (usuario.getPassword().length() < 4) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 4 caracteres");
        }

        // Región
        if (usuario.getRegion() == null || usuario.getRegion().trim().isEmpty()) {
            throw new IllegalArgumentException("La región es obligatoria");
        }

        // Comuna
        if (usuario.getComuna() == null || usuario.getComuna().trim().isEmpty()) {
            throw new IllegalArgumentException("La comuna es obligatoria");
        }

        // Dirección
        if (usuario.getDireccion() == null || usuario.getDireccion().trim().isEmpty()) {
            throw new IllegalArgumentException("La dirección es obligatoria");
        }
        if (usuario.getDireccion().length() > 500) {
            throw new IllegalArgumentException("La dirección no puede exceder 500 caracteres");
        }
    }

    /**
     * Validar dígito verificador de RUT chileno
     */
    private boolean validarDigitoVerificadorRut(String rut) {
        try {
            String[] partes = rut.split("-");
            if (partes.length != 2) return false;

            String numero = partes[0];
            String dvIngresado = partes[1].toUpperCase();

            int suma = 0;
            int multiplicador = 2;

            // Calcular desde el final hacia el inicio
            for (int i = numero.length() - 1; i >= 0; i--) {
                suma += Character.getNumericValue(numero.charAt(i)) * multiplicador;
                multiplicador = (multiplicador == 7) ? 2 : multiplicador + 1;
            }

            int resto = suma % 11;
            int dvCalculado = 11 - resto;

            String dvEsperado;
            if (dvCalculado == 11) {
                dvEsperado = "0";
            } else if (dvCalculado == 10) {
                dvEsperado = "K";
            } else {
                dvEsperado = String.valueOf(dvCalculado);
            }

            return dvIngresado.equals(dvEsperado);
        } catch (Exception e) {
            logger.error("❌ Error validando RUT: {}", e.getMessage());
            return false;
        }
    }
}
