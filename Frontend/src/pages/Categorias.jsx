// src/pages/Categorias.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cargarCategorias } from "../assets/data/dataLoader";
import { getImagePath, DEFAULT_IMAGE } from "../utils/assetHelpers";
import "../css/Categorias.css";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      console.log('🏷️ [Categorias] Iniciando carga de categorías');
      setLoading(true);
      setError(null);

      try {
        const data = await cargarCategorias();
        console.log(`✅ [Categorias] ${data.length} categorías cargadas`);
        setCategorias(data);
      } catch (err) {
        console.error('❌ [Categorias] Error al cargar categorías:', err);
        setError('Error al cargar las categorías. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Estado de carga
  if (loading) {
    console.log('⏳ [Categorias] Mostrando estado de carga');
    return (
      <div className="categorias-page">
        <h2 className="titulo-categorias">Categorías de Productos</h2>
        <div className="cargando">
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    console.error('❌ [Categorias] Mostrando error:', error);
    return (
      <div className="categorias-page">
        <h2 className="titulo-categorias">Categorías de Productos</h2>
        <div className="error-mensaje">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  // Sin categorías
  if (categorias.length === 0) {
    console.warn('⚠️ [Categorias] No hay categorías disponibles');
    return (
      <div className="categorias-page">
        <h2 className="titulo-categorias">Categorías de Productos</h2>
        <div className="sin-datos">
          <p>No hay categorías disponibles en este momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categorias-page">
      <h2 className="titulo-categorias">Categorías de Productos</h2>

      <div className="categorias-grid">
        {categorias.map((cat) => (
          <Link
            to={`/productos/${cat.id}`}
            key={cat.id}
            className="categoria-card-link"
            aria-label={`Ver productos de ${cat.nombre}`}
          >
            <div className="categoria-card">
              <img 
                src={getImagePath(cat.imagen)} 
                alt={cat.nombre} 
                className="categoria-imagen"
                onError={(e) => {
                  const currentSrc = e.target.src;
                  if (!currentSrc.includes('etiqueta-vacia.png')) {
                    console.warn(`⚠️  [Categorias] Error cargando imagen: ${cat.imagen}`);
                    e.target.onerror = null;
                    e.target.src = DEFAULT_IMAGE;
                  }
                }}
              />
              <div className="categoria-meta">
                <h3 className="categoria-nombre">{cat.nombre}</h3>
                <p className="categoria-descripcion">{cat.descripcion}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
