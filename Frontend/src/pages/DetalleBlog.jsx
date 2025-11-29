import React from 'react';
import { useParams, Link } from "react-router-dom";
import blogs from "../assets/data/blogs.js";
import blogImages from "../utils/blogImages";

export default function DetalleBlog() {
  const { slug } = useParams();
  let blog = blogs.find((b) => b.slug === slug || b.id === parseInt(slug, 10));

  if (!blog) return <p>Blog no encontrado.</p>;

  // 1. Clases de imagen
  const imgClasses = "product-item-img mx-auto d-flex rounded img-fluid mb-3 mb-lg-0";
  
  return (
    <div>
      <header>{/* Aquí va tu header */}</header>
      
      {/* 2. MAQUETACIÓN EXTERNA (Tomada de DetalleBlog1) */}
      <section className="page-section about-heading">
        <div className="container">
          
          {/* Imagen Principal del Blog */}
          <Link to={`/blog/${blog.slug || blog.id}`}>
            <img
              className={imgClasses}
              src={blogImages[blog.id] || blog.imagen}
              alt={blog.titulo}
            />
          </Link>

          {/* 3. CONTENEDORES DE CONTENIDO (Tomados de DetalleBlog1) */}
          <div className="about-heading-content">
            <div className="row">
              <div className="col-xl-9 col-lg-10 mx-auto">
                {/* 4. FONDO Y PADDING (Tomado de DetalleBlog1) */}
                <div className="bg-faded rounded p-5"> 
                  
                  {/* 5. CONTENEDOR DE CONTENIDO DINÁMICO */}
                  <div className="blog-post-wrapper"> 
                    
                    {/* Título y Fecha (Componentes fijos) */}
                    <h1 className="pacifico-regular">{blog.titulo}</h1>
                    <p className="blog-fecha text-muted mb-4">{blog.fecha}</p>

                    {/* 6. INYECCIÓN DEL CONTENIDO HTML DEL blogs.js */}
                    <div 
                      className="blog-contenido" // <-- Clase para CSS genérico
                      dangerouslySetInnerHTML={{ __html: blog.contenido }}
                    />
                    
                  </div>
                  {/* Fin del blog-post-wrapper */}
                  
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>
      
      <footer className=" text-faded text-center py-5">
        <div className="container">
          {/* Contenido del footer */}
        </div>
      </footer>
    </div>
  );
}