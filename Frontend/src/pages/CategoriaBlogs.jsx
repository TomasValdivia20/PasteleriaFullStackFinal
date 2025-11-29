import blogs from "../assets/data/blogs.json";
import CartasCategoriaBlogs from "../components/CartasCategoriaBlogs";
import { Link } from "react-router-dom";

export default function CategoriaBlogs() {
  return (
    <div>
      <header>
  <section className="page-section about-heading">
  <div className="container">
    <div className="about-heading-content">
      <div className="row">
        <div className="col-xl-9 col-lg-10 mx-auto">
          <div className="bg-faded rounded p-5">
            <h2 className="section-heading mb-4">
              <span className="section-heading-upper">¡Los Mejores Articulos sobre Reposteria!</span>
              <span className="section-heading-lower"><strong>El Blog de la Reposteria DuocUc</strong></span>
            </h2>
            <p><strong>¡Hola, futuros maestros de la repostería!</strong></p>
            <p className="mb-0">
              Sabemos que la carrera va mucho más allá de las horas en el taller. Es un mundo de técnicas, arte y negocio. Por eso, este blog será tu ingrediente secreto: un lugar donde compartiremos aquellos conocimientos, trucos, tendencias y reflexiones que complementarán lo que aprendes en las aulas y las cocinas del Mejor Instituto.
            </p>
            <p>
              Espero que estos artículos te inspiren, te desafíen y, sobre todo, te ayuden a transformar esa pasión en una carrera exitosa y llena de sabor. ¡Manos a la obra!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
      </header>
      <section className="page-section">
        <main className="CategoriaProductos-container">
          <div className="CategoriaProductos-grid">
            {blogs.map((b) => (
              <CartasCategoriaBlogs key={b.id} blog={b} />
            ))}
          </div>
        </main>
      </section>
      <footer className=" text-faded text-center py-5">
        <div className="container">
        </div>
      </footer>
    </div>
  );
}

