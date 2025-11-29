import { Link } from "react-router-dom";
import categoriaImages from "../utils/categoriaImages";
import placeholder from "../assets/img/product-thumb-1.png";

export default function CartasCategoriaProductos({ categoria }) {
  const title = categoria.nombre || categoria.categoria || "Categoría";
  const description = categoria.descripcion || "";
  const imgSrc = categoriaImages[categoria.id] || categoria.imagen || placeholder;

    if (typeof window !== 'undefined') console.log('CartasCategoriaProductos imgSrc:', imgSrc);

  return (
    <div className="CategoriaProductos-cartas">
      <img src={imgSrc} alt={title} />
      <div className="CategoriaProductos-informacion">
        <h2>{title}</h2>
        <p>{description}</p>
        <Link to={`/categorias/${categoria.id}`} className="CategoriaProductos-btn">
          Ver Categoría
        </Link>
      </div>
    </div>
  );
}
