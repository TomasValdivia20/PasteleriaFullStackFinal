import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CarritoContext } from "../context/CarritoContext";
import StickerInfoNutricional from "../components/StickerInfoNutricional.jsx";
import { cargarProductoPorId } from "../assets/data/dataLoader";
import { resolveProductImageUrl } from "../utils/assetHelpers";
import "../css/ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const { agregarAlCarrito } = useContext(CarritoContext);
  const [producto, setProducto] = useState(null);
  const [tamanoSeleccionado, setTamanoSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" }); // ✅ notificación (texto + tipo)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducto = async () => {
      console.log(`🎯 [ProductDetail] Cargando producto con ID: ${id}`);
      setLoading(true);
      setError(null);
      
      try {
        const data = await cargarProductoPorId(id);
        
        if (data) {
          console.log('✅ [ProductDetail] Producto cargado:', data);
          console.log('   Variantes disponibles:', data.variantes?.length || 0);
          setProducto(data);
          
          // Si el producto tiene variantes y solo hay una, seleccionarla automáticamente
          if (data.variantes && data.variantes.length === 1) {
            setTamanoSeleccionado(data.variantes[0]);
            console.log('ℹ️ [ProductDetail] Variante única seleccionada automáticamente:', data.variantes[0]);
          }
        } else {
          console.warn('⚠️ [ProductDetail] No se encontró el producto');
          setError('Producto no encontrado');
        }
      } catch (err) {
        console.error('❌ [ProductDetail] Error al cargar producto:', err);
        setError('Error al cargar el producto. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducto();
  }, [id]);

  const handleAgregar = () => {
    console.log('🛒 [ProductDetail] Intentando agregar al carrito');
    console.log('   Tamaño seleccionado:', tamanoSeleccionado);
    
    if (!tamanoSeleccionado) {
      console.warn('⚠️ [ProductDetail] No hay tamaño seleccionado');
      setMensaje({ texto: "⚠️ Debes seleccionar un tamaño antes de agregar al carrito.", tipo: "error" });
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
      return;
    }

    // Resolver URL de imagen usando helper
    const imagenUrl = resolveProductImageUrl(producto);

    const itemCarrito = {
      id: producto.id,
      nombre: producto.nombre,
      imagen: imagenUrl, // Usar URL de Supabase o asset local
      precio: tamanoSeleccionado.precio,
      varianteId: tamanoSeleccionado.id, // ID de la variante específica
      tamano: tamanoSeleccionado.nombre, // "12 personas", "16 personas", etc.
      stock: tamanoSeleccionado.stock,
    };
    
    console.log('✅ [ProductDetail] Agregando al carrito:', itemCarrito);
    agregarAlCarrito(itemCarrito);

    setMensaje({ texto: "✅ Producto agregado al carrito.", tipo: "exito" });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 2500);
  };

  // Estados de carga y error
  if (loading) {
    console.log('⏳ [ProductDetail] Mostrando estado de carga');
    return (
      <div className="producto-detalle">
        <div className="cargando">
          <h2>Cargando producto...</h2>
          <p>Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ [ProductDetail] Mostrando error:', error);
    return (
      <div className="producto-detalle">
        <div className="error-mensaje">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  if (!producto) {
    console.warn('⚠️ [ProductDetail] Producto no encontrado');
    return (
      <div className="producto-detalle">
        <div className="cargando">
          <h2>Producto no encontrado</h2>
          <p>El producto que buscas no existe o fue eliminado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="producto-detalle">
      <div className="detalle-contenido">
        <div className="detalle-imagen">
          <img 
            src={resolveProductImageUrl(producto)} 
            alt={producto.nombre}
            onError={(e) => {
              console.error(`❌ [ProductDetail] Error cargando imagen: ${e.target.src}`);
              e.target.src = '/assets/img/product-thumb-1.png';
            }}
          />
          
          {/* Galería de imágenes adicionales de Supabase */}
          {producto.imagenes && producto.imagenes.length > 1 && (
            <div className="galeria-imagenes">
              {producto.imagenes.map((img) => (
                <img 
                  key={img.id} 
                  src={img.urlSupabase} 
                  alt={`${producto.nombre} - ${img.orden}`}
                  className={img.esPrincipal ? 'miniatura activa' : 'miniatura'}
                  onError={(e) => {
                    console.error(`❌ Error cargando miniatura: ${e.target.src}`);
                    e.target.style.display = 'none';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="detalle-info">
          <h2>{producto.nombre}</h2>
          <p className="descripcion">{producto.descripcion}</p>

          {/* Selector de tamaño */}
          {producto.variantes && producto.variantes.length > 0 && (
            <div className="selector-tamano">
              <label htmlFor="tamano">Seleccionar tamaño:</label>
              {producto.variantes.length === 1 ? (
                // Si solo hay una variante, mostrarla como texto
                <p className="tamano-unico">
                  <strong>{producto.variantes[0].nombre}</strong>
                  {producto.variantes[0].stock > 0 && (
                    <span className="stock-disponible"> ✅ Disponible ({producto.variantes[0].stock} en stock)</span>
                  )}
                  {producto.variantes[0].stock === 0 && (
                    <span className="sin-stock"> ⚠️ Sin stock</span>
                  )}
                </p>
              ) : (
                // Si hay múltiples variantes, mostrar selector
                <select
                  id="tamano"
                  onChange={(e) => {
                    const indice = e.target.value;
                    const varianteSeleccionada = producto.variantes[indice];
                    console.log('🎯 [ProductDetail] Variante seleccionada:', varianteSeleccionada);
                    setTamanoSeleccionado(varianteSeleccionada);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    -- Elegir tamaño --
                  </option>
                  {producto.variantes.map((variante, i) => (
                    <option 
                      key={variante.id} 
                      value={i}
                      disabled={variante.stock === 0}
                    >
                      {variante.nombre} - ${variante.precio.toLocaleString("es-CL")}
                      {variante.stock === 0 && ' (Sin stock)'}
                      {variante.stock > 0 && variante.stock < 10 && ` (Quedan ${variante.stock})`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Precio */}
          {tamanoSeleccionado && (
            <div className="info-precio">
              <p className="precio">
                ${tamanoSeleccionado.precio.toLocaleString("es-CL")}
              </p>
              {tamanoSeleccionado.stock > 0 && tamanoSeleccionado.stock < 10 && (
                <p className="stock-bajo">⚠️ ¡Solo quedan {tamanoSeleccionado.stock} unidades!</p>
              )}
            </div>
          )}

          {/* Información nutricional */}
          {tamanoSeleccionado?.infoNutricional && (
            <div className="info-nutricional">
              <h3>Información Nutricional</h3>
              <p>{tamanoSeleccionado.infoNutricional}</p>
            </div>
          )}

          {/* Botón agregar */}
          <button
            className="boton-agregar"
            onClick={handleAgregar}
            disabled={!producto || !tamanoSeleccionado || tamanoSeleccionado.stock === 0}
          >
            {!tamanoSeleccionado 
              ? '⚠️ Selecciona un tamaño'
              : tamanoSeleccionado.stock === 0
              ? '❌ Sin stock'
              : '🛒 Agregar al Carrito'
            }
          </button>

          {/* ✅ Mensajes visuales */}
          {mensaje.texto && (
            <div
              className={`mensaje-notificacion ${
                mensaje.tipo === "exito" ? "mensaje-exito" : "mensaje-error"
              }`}
            >
              {mensaje.texto}
            </div>
          )}

  {/* Nutrición - Mantener el sticker original si existe */}
          {tamanoSeleccionado?.nutricion && (
            <div className="nutricion-sticker-container ">
              <StickerInfoNutricional
                nutritionData={tamanoSeleccionado.nutricion}
                sizeDescription={tamanoSeleccionado.nombre}
                productNotes={producto.notas} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
