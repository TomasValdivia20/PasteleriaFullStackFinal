import React from "react";
import { Link } from "react-router-dom";
import blogImages from "../utils/blogImages";
import placeholder from "../assets/img/product-thumb-1.png";

export default function CartasCategoriaBlogs({ blog }) {
  const src = blogImages[blog.id] || blog.imagen || placeholder;
  if (typeof window !== 'undefined') console.log('CartasCategoriaBlogs imgSrc:', src);

  // build path: prefer slug (pretty URL) but fall back to numeric id if slug missing
  const path = blog.slug ? `/blogs/${blog.slug}` : `/blogs/${blog.id}`;

  return (
    <div className="CategoriaProductos-cartas">
      <Link to={path}>
        <img src={src} alt={blog.titulo} />
      </Link>
      <div className="CategoriaProductos-informacion">
        <h2>{blog.titulo}</h2>
        <p>{blog.descripcion}</p>
        <p className="blog-fecha">{blog.fecha}</p>
        <Link to={path} className="CategoriaProductos-btn">
          Leer más
        </Link>
      </div>
    </div>
  );
}