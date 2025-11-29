import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cargarCategorias } from "../../assets/data/dataLoader";
import { getImagePath, DEFAULT_IMAGE } from "../../utils/assetHelpers";
import "../../css/Categorias.css";

export default function CategoriasList() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      console.log('📚 [CategoriasList] Iniciando carga de categorías');
      setLoading(true);
      setError(null);

      try {
        const data = await cargarCategorias();
        console.log(`✅ [CategoriasList] ${data.length} categorías cargadas`);
        setCategorias(data);
      } catch (err) {
        console.error('❌ [CategoriasList] Error al cargar categorías:', err);
        setError('Error al cargar las categorías. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Estado de carga
  if (loading) {
    console.log('⏳ [CategoriasList] Mostrando estado de carga');
    return (
      <div className="categorias-page">
        <div className="categorias-header">
          <h2>Categorías de Productos</h2>
        </div>
        <div className="cargando">
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    console.error('❌ [CategoriasList] Mostrando error:', error);
    return (
      <div className="categorias-page">
        <div className="categorias-header">
          <h2>Categorías de Productos</h2>
        </div>
        <div className="error-mensaje">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  // Sin categorías
  if (categorias.length === 0) {
    console.warn('⚠️ [CategoriasList] No hay categorías disponibles');
    return (
      <div className="categorias-page">
        <div className="categorias-header">
          <h2>Categorías de Productos</h2>
        </div>
        <div className="sin-datos">
          <p>No hay categorías disponibles en este momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categorias-page">
      <div className="categorias-header">
        <h2>Categorías de Productos</h2>
        <p>Elige una categoría para ver los productos disponibles</p>
      </div>

      <div className="categorias-grid">
        {categorias.map((cat) => (
          <div key={cat.id} className="categoria-card">
            <Link to={`/productos/${cat.id}`}>
              <div className="categoria-imagen">
                <img 
                  src={getImagePath(cat.imagen)} 
                  alt={cat.nombre}
                  onError={(e) => {
                    const currentSrc = e.target.src;
                    if (!currentSrc.includes('etiqueta-vacia.png')) {
                      console.warn(`⚠️  [CategoriasList] Error cargando imagen: ${cat.imagen}`);
                      e.target.onerror = null;
                      e.target.src = DEFAULT_IMAGE;
                    }
                  }}
                />
              </div>
              <div className="categoria-info">
                <h3>{cat.nombre}</h3>
                <p>{cat.descripcion}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}