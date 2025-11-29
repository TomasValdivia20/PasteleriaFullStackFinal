package com.milsabores.backend.controller;

import com.milsabores.backend.model.Categoria;
import com.milsabores.backend.model.Producto;
import com.milsabores.backend.repository.CategoriaRepository;
import com.milsabores.backend.repository.ProductoRepository; // 1. Importamos el repo de productos
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    @Autowired
    private CategoriaRepository categoriaRepository;

    // 2. Inyectamos el repositorio de productos
    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping
    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll();
    }

    @PostMapping
    public Categoria crearCategoria(@RequestBody Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    @PutMapping("/{id}")
    public Categoria actualizarCategoria(@PathVariable Long id, @RequestBody Categoria categoriaActualizada) {
        return categoriaRepository.findById(id).map(cat -> {
            cat.setNombre(categoriaActualizada.getNombre());
            cat.setDescripcion(categoriaActualizada.getDescripcion());
            cat.setImagen(categoriaActualizada.getImagen());
            return categoriaRepository.save(cat);
        }).orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
    }

    // 🛑 3. MÉTODO DE ELIMINACIÓN MEJORADO (MANUAL CASCADE)
    @DeleteMapping("/{id}")
    public void eliminarCategoria(@PathVariable Long id) {
        // Paso A: Buscar todos los productos que pertenecen a esta categoría
        List<Producto> productosDeLaCategoria = productoRepository.findByCategoriaId(id);

        // Paso B: Borrar esos productos primero
        if (!productosDeLaCategoria.isEmpty()) {
            productoRepository.deleteAll(productosDeLaCategoria);
        }

        // Paso C: Ahora que está "limpia", borrar la categoría
        categoriaRepository.deleteById(id);
    }
}