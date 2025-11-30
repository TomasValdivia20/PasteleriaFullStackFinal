package com.milsabores.backend.service;

import com.milsabores.backend.model.Contacto;
import com.milsabores.backend.repository.ContactoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Servicio para gestión de mensajes de contacto
 * Implementa la lógica de negocio según Clean Architecture
 */
@Service
@Transactional
public class ContactoService {
    
    private static final Logger logger = LoggerFactory.getLogger(ContactoService.class);
    
    private final ContactoRepository contactoRepository;
    
    @Autowired
    public ContactoService(ContactoRepository contactoRepository) {
        this.contactoRepository = contactoRepository;
    }
    
    /**
     * Crear nuevo mensaje de contacto (público - no requiere autenticación)
     */
    public Contacto crear(Contacto contacto) {
        validarContacto(contacto);
        
        logger.info("📧 Nuevo mensaje de contacto recibido de: {} ({})", 
                    contacto.getNombre(), contacto.getEmail());
        
        Contacto nuevoContacto = contactoRepository.save(contacto);
        
        logger.info("✅ Mensaje de contacto guardado con ID: {}", nuevoContacto.getId());
        
        return nuevoContacto;
    }
    
    /**
     * Obtener todos los mensajes ordenados por fecha (admin)
     */
    public List<Contacto> obtenerTodos() {
        logger.info("📋 Listando todos los mensajes de contacto");
        return contactoRepository.findAllByOrderByFechaEnvioDesc();
    }
    
    /**
     * Obtener mensajes por estado de lectura (admin)
     */
    public List<Contacto> obtenerPorEstado(Boolean leido) {
        logger.info("🔍 Buscando mensajes con estado leído: {}", leido);
        return contactoRepository.findByLeidoOrderByFechaEnvioDesc(leido);
    }
    
    /**
     * Obtener mensaje por ID (admin)
     */
    public Optional<Contacto> obtenerPorId(Long id) {
        return contactoRepository.findById(id);
    }
    
    /**
     * Marcar mensaje como leído/no leído (admin)
     */
    public Contacto marcarComoLeido(Long id, Boolean leido) {
        return contactoRepository.findById(id)
                .map(contacto -> {
                    contacto.setLeido(leido);
                    Contacto actualizado = contactoRepository.save(contacto);
                    
                    logger.info("✅ Mensaje {} marcado como {}", 
                               id, leido ? "LEÍDO" : "NO LEÍDO");
                    
                    return actualizado;
                })
                .orElseThrow(() -> {
                    logger.error("❌ Mensaje de contacto no encontrado con ID: {}", id);
                    return new RuntimeException("Mensaje de contacto no encontrado con ID: " + id);
                });
    }
    
    /**
     * Eliminar mensaje de contacto (admin)
     */
    public void eliminar(Long id) {
        if (!contactoRepository.existsById(id)) {
            logger.error("❌ Intento de eliminar mensaje inexistente con ID: {}", id);
            throw new RuntimeException("Mensaje de contacto no encontrado con ID: " + id);
        }
        
        contactoRepository.deleteById(id);
        logger.info("🗑️  Mensaje de contacto eliminado con ID: {}", id);
    }
    
    /**
     * Contar mensajes no leídos (admin)
     */
    public Long contarNoLeidos() {
        Long cantidad = contactoRepository.countByLeido(false);
        logger.info("📊 Mensajes no leídos: {}", cantidad);
        return cantidad;
    }
    
    /**
     * Validar datos del mensaje de contacto
     */
    private void validarContacto(Contacto contacto) {
        if (contacto.getNombre() == null || contacto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        if (contacto.getNombre().length() > 200) {
            throw new IllegalArgumentException("El nombre no puede exceder 200 caracteres");
        }
        
        if (contacto.getEmail() == null || contacto.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("El email es obligatorio");
        }
        if (!contacto.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("El email no tiene un formato válido");
        }
        if (contacto.getEmail().length() > 200) {
            throw new IllegalArgumentException("El email no puede exceder 200 caracteres");
        }
        
        if (contacto.getTelefono() != null && !contacto.getTelefono().isEmpty()) {
            String telefonoLimpio = contacto.getTelefono().replaceAll("\\D", "");
            if (telefonoLimpio.length() < 8 || telefonoLimpio.length() > 9) {
                throw new IllegalArgumentException("El teléfono debe tener 8 o 9 dígitos");
            }
        }
        
        if (contacto.getMensaje() == null || contacto.getMensaje().trim().isEmpty()) {
            throw new IllegalArgumentException("El mensaje es obligatorio");
        }
        if (contacto.getMensaje().length() > 2000) {
            throw new IllegalArgumentException("El mensaje no puede exceder 2000 caracteres");
        }
    }
    
    /**
     * Verificar si existe un mensaje
     */
    public boolean existe(Long id) {
        return contactoRepository.existsById(id);
    }
}
