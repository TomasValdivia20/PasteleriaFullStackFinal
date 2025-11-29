package com.milsabores.backend.repository;

import com.milsabores.backend.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    // Aquí puedes definir métodos mágicos extra si necesitas, ej:
    List<Producto> findByCategoriaId(Long categoriaId);
}