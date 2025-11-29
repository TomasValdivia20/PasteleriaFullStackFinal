import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { cargarProductosPorCategoria, cargarCategorias } from "../../assets/data/dataLoader";
import { DEFAULT_IMAGE } from "../../utils/assetHelpers";
import "../../css/ProductosList.css";

export default function ProductosList() {
  const { categoriaId } = useParams();
  const [productos, setProductos] = useState([]);
  const [categoriaNombre, setCategoriaNombre] = useState("Productos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      console.log(`🛍️ [ProductosList] Cargando productos para categoría ID: ${categoriaId}`);
      setLoading(true);
      setError(null);

      try {
        // Cargar productos de la categoría
        const dataProductos = await cargarProductosPorCategoria(categoriaId);
        console.log(`✅ [ProductosList] ${dataProductos.length} productos cargados`);
        setProductos(dataProductos);

        // Cargar info de la categoría para el título
        const todasCategorias = await cargarCategorias();
        const catEncontrada = todasCategorias.find(c => c.id === parseInt(categoriaId));
        
        if (catEncontrada) {
          console.log('✅ [ProductosList] Categoría encontrada:', catEncontrada.nombre);
          setCategoriaNombre(catEncontrada.nombre);
        } else {
          console.warn(`⚠️ [ProductosList] Categoría ${categoriaId} no encontrada`);
        }

      } catch (err) {
        console.error('❌ [ProductosList] Error al cargar datos:', err);
        setError('Error al cargar los productos. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [categoriaId]);

  // Estado de carga
  if (loading) {
    console.log('⏳ [ProductosList] Mostrando estado de carga');
    return (
      <div className="productos-page">
        <div className="productos-header">
          <h2>Cargando productos...</h2>
        </div>
        <div className="cargando">
          <p>Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    console.error('❌ [ProductosList] Mostrando error:', error);
    return (
      <div className="productos-page">
        <div className="productos-header">
          <h2>{categoriaNombre}</h2>
        </div>
        <div className="error-mensaje">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="productos-page">
      <div className="productos-header">
        <h2>{categoriaNombre}</h2>
      </div>

      {productos.length === 0 ? (
        <div className="sin-productos">
          <p className="text-center">No hay productos en esta categoría.</p>
          <Link to="/productos" className="btn-volver">Volver a Categorías</Link>
        </div>
      ) : (
        <div className="productos-grid">
          {productos.map((prod) => (
            <Link key={prod.id} to={`/producto/${prod.id}`} className="producto-card-link">
              <div className="producto-card">
                <img 
                  src={prod.imagen} 
                  alt={prod.nombre} 
                  onError={(e) => {
                    const currentSrc = e.target.src;
                    if (!currentSrc.includes('etiqueta-vacia.png')) {
                      console.warn(`⚠️  [ProductosList] Error cargando imagen: ${prod.imagen}`);
                      e.target.onerror = null;
                      e.target.src = DEFAULT_IMAGE;
                    }
                  }}
                />
                <h3>{prod.nombre}</h3>
                <p>{prod.descripcion}</p>
                <p className="producto-precio">
                  {prod.precioBase 
                    ? `$${prod.precioBase.toLocaleString("es-CL")}` 
                    : "Consultar"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}