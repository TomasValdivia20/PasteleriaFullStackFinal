import { Link } from "react-router-dom";
import productImages from "../utils/productImages";
import placeholder from "../assets/img/product-thumb-1.png";

export default function CartasProductos({ producto }) {
  const title = producto.nombre || producto.categoria || "Sin título";
  const description = producto.descripcion || "";
  const imgSrc = productImages[producto.id] || producto.imagen || producto.imagenUrl || placeholder;

  if (typeof window !== 'undefined') console.log('CartasProductos imgSrc:', imgSrc);

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