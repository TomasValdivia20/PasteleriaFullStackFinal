import { Link } from "react-router-dom";
import productImages from "../utils/productImages";
import placeholder from "../assets/img/product-thumb-1.png";

export default function CartasProductos({ producto }) {
  const title = producto.nombre || producto.categoria || "Sin título";
  const description = producto.descripcion || "";
  
  // Prioridad: imagen principal de Supabase > imagen local > placeholder
  let imgSrc = placeholder;
  
  if (producto.imagenes && producto.imagenes.length > 0) {
    // Buscar imagen principal
    const imagenPrincipal = producto.imagenes.find(img => img.esPrincipal);
    const imagenUrl = imagenPrincipal ? imagenPrincipal.urlSupabase : producto.imagenes[0].urlSupabase;
    
    // Si es URL de Supabase (https://), usarla directamente
    if (imagenUrl && imagenUrl.startsWith('http')) {
      imgSrc = imagenUrl;
      console.log('✅ [CartasProductos] Usando imagen de Supabase:', imgSrc);
    } else {
      // Si es ruta local (/assets/...), usar productImages fallback
      imgSrc = productImages[producto.id] || placeholder;
      console.log('⚠️  [CartasProductos] Ruta local detectada, usando fallback:', imgSrc);
    }
  } else {
    // Fallback final: productImages por ID
    imgSrc = productImages[producto.id] || placeholder;
    console.log('⚠️  [CartasProductos] Sin imagenes[], usando productImages[' + producto.id + ']');
  }

  return (
    <div className="CategoriaProductos-cartas">
      <img 
        src={imgSrc} 
        alt={title} 
        loading="lazy" 
        decoding="async"
        onError={(e) => {
          // Prevenir loop infinito si ya estamos usando placeholder
          if (e.target.src === placeholder || e.target.src.includes('product-thumb-1.png')) {
            console.error(`❌ [CartasProductos] Placeholder falló para producto ${producto.id}`);
            e.target.onerror = null;
            return;
          }
          
          console.warn(`⚠️  [CartasProductos] Error cargando imagen para producto ${producto.id}, usando placeholder`);
          e.target.onerror = null;
          e.target.src = placeholder;
        }}
      />
      <div className="CategoriaProductos-informacion">
        <h2>{title}</h2>
        <p>{description}</p>
        <Link to={`/productos/${producto.id}`} className="CategoriaProductos-btn">
          Ver
        </Link>
      </div>
    </div>
  );
}