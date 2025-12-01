package com.milsabores.backend.service;

import com.milsabores.backend.model.Producto;
import com.milsabores.backend.model.VarianteProducto;
import com.milsabores.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Servicio para gestión de Productos
 * Implementa la lógica de negocio según Clean Architecture
 */
@Service
@Transactional
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaService categoriaService;

    @Autowired
    public ProductoService(ProductoRepository productoRepository, CategoriaService categoriaService) {
        this.productoRepository = productoRepository;
        this.categoriaService = categoriaService;
    }

    /**
     * Obtener todos los productos
     */
    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    /**
     * Obtener producto por ID
     */
    public Optional<Producto> obtenerPorId(Long id) {
        Optional<Producto> producto = productoRepository.findById(id);
        
        // DEBUG: Log para verificar carga de variantes
        if (producto.isPresent()) {
            Producto p = producto.get();
            System.out.println("🔍 [DEBUG] Producto ID=" + id + " cargado");
            System.out.println("   Variantes cargadas: " + (p.getVariantes() != null ? p.getVariantes().size() : "NULL"));
            System.out.println("   Imagenes cargadas: " + (p.getImagenes() != null ? p.getImagenes().size() : "NULL"));
            
            if (p.getVariantes() != null && !p.getVariantes().isEmpty()) {
                p.getVariantes().forEach(v -> 
                    System.out.println("   - Variante ID=" + v.getId() + ", nombre=" + v.getNombre() + ", precio=" + v.getPrecio())
                );
            }
        } else {
            System.out.println("❌ [DEBUG] Producto ID=" + id + " NO encontrado");
        }
        
        return producto;
    }

    /**
     * Obtener productos por categoría
     */
    public List<Producto> obtenerPorCategoria(Long categoriaId) {
        if (!categoriaService.existe(categoriaId)) {
            throw new RuntimeException("Categoría no encontrada con ID: " + categoriaId);
        }
        return productoRepository.findByCategoriaId(categoriaId);
    }

    /**
     * Crear nuevo producto
     */
    public Producto crear(Producto producto) {
        validarProducto(producto);
        
        // Establecer relación bidireccional con variantes
        if (producto.getVariantes() != null) {
            for (VarianteProducto variante : producto.getVariantes()) {
                variante.setProducto(producto);
            }
        }
        
        return productoRepository.save(producto);
    }

    /**
     * Actualizar producto existente
     */
    public Producto actualizar(Long id, Producto productoActualizado) {
        return productoRepository.findById(id)
                .map(producto -> {
                    validarProducto(productoActualizado);
                    
                    producto.setNombre(productoActualizado.getNombre());
                    producto.setDescripcion(productoActualizado.getDescripcion());
                    producto.setPrecioBase(productoActualizado.getPrecioBase());
                    producto.setImagen(productoActualizado.getImagen());
                    producto.setCategoria(productoActualizado.getCategoria());
                    
                    // Actualizar variantes si se proporcionan
                    if (productoActualizado.getVariantes() != null) {
                        producto.getVariantes().clear();
                        for (VarianteProducto variante : productoActualizado.getVariantes()) {
                            variante.setProducto(producto);
                            producto.getVariantes().add(variante);
                        }
                    }
                    
                    return productoRepository.save(producto);
                })
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
    }

    /**
     * Eliminar producto
     */
    public void eliminar(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado con ID: " + id);
        }
        productoRepository.deleteById(id);
    }

    /**
     * Validar datos de producto
     */
    private void validarProducto(Producto producto) {
        if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del producto es obligatorio");
        }
        if (producto.getNombre().length() > 200) {
            throw new IllegalArgumentException("El nombre del producto no puede exceder 200 caracteres");
        }
        if (producto.getPrecioBase() != null && producto.getPrecioBase() < 0) {
            throw new IllegalArgumentException("El precio base no puede ser negativo");
        }
        if (producto.getCategoria() == null) {
            throw new IllegalArgumentException("El producto debe tener una categoría asignada");
        }
        if (!categoriaService.existe(producto.getCategoria().getId())) {
            throw new RuntimeException("La categoría asignada no existe");
        }
        
        // Validar que tenga al menos 1 variante (tamaño)
        if (producto.getVariantes() == null || producto.getVariantes().isEmpty()) {
            throw new IllegalArgumentException("El producto debe tener al menos 1 variante (tamaño)");
        }
        
        // Validar cada variante
        for (VarianteProducto variante : producto.getVariantes()) {
            if (variante.getNombre() == null || variante.getNombre().trim().isEmpty()) {
                throw new IllegalArgumentException("Cada variante debe tener un nombre (ej: '12 personas')");
            }
            if (variante.getPrecio() == null || variante.getPrecio() < 0) {
                throw new IllegalArgumentException("Cada variante debe tener un precio válido");
            }
            if (variante.getStock() != null && variante.getStock() < 0) {
                throw new IllegalArgumentException("El stock no puede ser negativo");
            }
        }
    }

    /**
     * Verificar si existe un producto
     */
    public boolean existe(Long id) {
        return productoRepository.existsById(id);
    }
}
