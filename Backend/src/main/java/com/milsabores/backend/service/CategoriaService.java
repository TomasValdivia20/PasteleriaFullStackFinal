package com.milsabores.backend.service;

import com.milsabores.backend.model.Categoria;
import com.milsabores.backend.repository.CategoriaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Servicio para gestión de Categorías
 * Implementa la lógica de negocio según Clean Architecture
 */
@Service
@Transactional
public class CategoriaService {

    private static final Logger logger = LoggerFactory.getLogger(CategoriaService.class);
    private final CategoriaRepository categoriaRepository;

    @Autowired
    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    /**
     * Obtener todas las categorías
     */
    @Transactional(readOnly = true)
    public List<Categoria> obtenerTodas() {
        logger.debug("🔍 [SERVICE] Obteniendo todas las categorías");
        try {
            List<Categoria> categorias = categoriaRepository.findAll();
            logger.info("✅ [SERVICE] {} categorías encontradas", categorias.size());
            return categorias;
        } catch (Exception e) {
            logger.error("❌ [SERVICE] Error al obtener categorías: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Obtener categoría por ID
     */
    public Optional<Categoria> obtenerPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    /**
     * Crear nueva categoría
     */
    public Categoria crear(Categoria categoria) {
        validarCategoria(categoria);
        return categoriaRepository.save(categoria);
    }

    /**
     * Actualizar categoría existente
     */
    public Categoria actualizar(Long id, Categoria categoriaActualizada) {
        return categoriaRepository.findById(id)
                .map(categoria -> {
                    validarCategoria(categoriaActualizada);
                    categoria.setNombre(categoriaActualizada.getNombre());
                    categoria.setDescripcion(categoriaActualizada.getDescripcion());
                    categoria.setImagen(categoriaActualizada.getImagen());
                    return categoriaRepository.save(categoria);
                })
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
    }

    /**
     * Eliminar categoría
     */
    public void eliminar(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("Categoría no encontrada con ID: " + id);
        }
        categoriaRepository.deleteById(id);
    }

    /**
     * Validar datos de categoría
     */
    private void validarCategoria(Categoria categoria) {
        if (categoria.getNombre() == null || categoria.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio");
        }
        if (categoria.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre de la categoría no puede exceder 100 caracteres");
        }
    }

    /**
     * Verificar si existe una categoría
     */
    public boolean existe(Long id) {
        return categoriaRepository.existsById(id);
    }
}
