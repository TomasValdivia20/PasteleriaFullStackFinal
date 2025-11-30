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
    imgSrc = imagenPrincipal ? imagenPrincipal.urlSupabase : producto.imagenes[0].urlSupabase;
    console.log('✅ [CartasProductos] Usando imagen de Supabase:', imgSrc);
  } else if (producto.imagen) {
    // Fallback: imagen local legacy
    imgSrc = productImages[producto.id] || producto.imagen;
    console.log('⚠️  [CartasProductos] Usando imagen legacy:', imgSrc);
  }

  return (
    <div className="CategoriaProductos-cartas">
      <img src={imgSrc} alt={title} loading="lazy" decoding="async" />
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