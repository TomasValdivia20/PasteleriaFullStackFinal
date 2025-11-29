// src/pages/CategoriaDetallePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { cargarProductosPorCategoria, cargarCategorias } from "../assets/data/dataLoader";
import { DEFAULT_IMAGE } from "../utils/assetHelpers";
import "../css/catalogo.css";

function CategoriaDetallePage() {
  const { categoriaId } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function obtenerDatos() {
      console.log(`📂 [CategoriaDetallePage] Cargando datos para categoría ID: ${categoriaId}`);
      setLoading(true);
      setError(null);

      try {
        // Cargar categorías y productos en paralelo
        const [categorias, productosData] = await Promise.all([
          cargarCategorias(),
          cargarProductosPorCategoria(categoriaId)
        ]);

        const categoriaSeleccionada = categorias.find(
          (cat) => cat.id === parseInt(categoriaId)
        );

        if (!categoriaSeleccionada) {
          console.warn(`⚠️ [CategoriaDetallePage] Categoría ${categoriaId} no encontrada`);
          setError('Categoría no encontrada');
        } else {
          console.log('✅ [CategoriaDetallePage] Categoría encontrada:', categoriaSeleccionada.nombre);
          setCategoria(categoriaSeleccionada);
        }

        console.log(`✅ [CategoriaDetallePage] ${productosData.length} productos cargados`);
        setProductos(productosData);

      } catch (err) {
        console.error('❌ [CategoriaDetallePage] Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    }

    obtenerDatos();
  }, [categoriaId]);

  // Estado de carga
  if (loading) {
    console.log('⏳ [CategoriaDetallePage] Mostrando estado de carga');
    return (
      <section className="catalogo-container">
        <div className="cargando">
          <h2>Cargando productos...</h2>
          <p>Por favor espera un momento</p>
        </div>
      </section>
    );
  }

  // Estado de error
  if (error) {
    console.error('❌ [CategoriaDetallePage] Mostrando error:', error);
    return (
      <section className="catalogo-container">
        <div className="error-mensaje">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </section>
    );
  }

  // Si no hay categoría
  if (!categoria) {
    console.warn('⚠️ [CategoriaDetallePage] Categoría no disponible');
    return (
      <section className="catalogo-container">
        <div className="error-mensaje">
          <h2>Categoría no encontrada</h2>
          <p>La categoría que buscas no existe.</p>
          <Link to="/productos" className="btn-volver">Volver a Categorías</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="catalogo-container">
      <div className="categoria-info">
        <h2 className="titulo-seccion">{categoria.nombre}</h2>
        <p className="categoria-descripcion">{categoria.descripcion}</p>
      </div>

      {productos.length === 0 ? (
        <div className="sin-productos">
          <p>No hay productos disponibles en esta categoría.</p>
          <Link to="/productos" className="btn-volver">Volver a Categorías</Link>
        </div>
      ) : (
        <div className="productos-grid">
          {productos.map((producto) => (
            <Link key={producto.id} to={`/producto/${producto.id}`} className="producto-card">
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="producto-imagen"
                onError={(e) => {
                  const currentSrc = e.target.src;
                  
                  // Prevenir loop infinito
                  if (currentSrc.includes('etiqueta-vacia.png')) {
                    return;
                  }
                  
                  // Intentar con extensión alternativa (.jpg si era .jpeg o viceversa)
                  if (currentSrc.endsWith('.jpeg') && !e.target.dataset.triedJpg) {
                    console.warn(`⚠️  [CategoriaDetallePage] .jpeg falló, intentando .jpg para: ${producto.imagen}`);
                    e.target.dataset.triedJpg = 'true';
                    e.target.src = currentSrc.replace('.jpeg', '.jpg');
                    return;
                  } else if (currentSrc.endsWith('.jpg') && !e.target.dataset.triedJpeg) {
                    console.warn(`⚠️  [CategoriaDetallePage] .jpg falló, intentando .jpeg para: ${producto.imagen}`);
                    e.target.dataset.triedJpeg = 'true';
                    e.target.src = currentSrc.replace('.jpg', '.jpeg');
                    return;
                  }
                  
                  // Si ya intentamos ambas extensiones, usar imagen por defecto
                  console.warn(`⚠️  [CategoriaDetallePage] Error cargando imagen: ${producto.imagen}`);
                  e.target.onerror = null;
                  e.target.src = DEFAULT_IMAGE;
                }}
              />
              <h3 className="producto-nombre">{producto.nombre}</h3>
              <p className="producto-precio">
                {producto.precioBase 
                  ? `Desde $${producto.precioBase.toLocaleString("es-CL")}`
                  : producto.tamaños?.[0]?.precio 
                    ? `Desde $${producto.tamaños[0].precio.toLocaleString("es-CL")}`
                    : "Consultar precio"
                }
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default CategoriaDetallePage;
