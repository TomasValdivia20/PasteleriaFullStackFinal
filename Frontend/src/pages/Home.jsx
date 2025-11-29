import React from "react";
import { Link } from "react-router-dom";


// Importar imágenes desde assets
import introImg from "../assets/img/Pasteleria Index.jpg";
import pastelesImg from "../assets/img/Pasteles.png";
import redVelvetImg from "../assets/img/Torta Cuadrada.webp";
import nuezManjarImg from "../assets/img/Pastel Nuez Manjar.png";
import chilenitosImg from "../assets/img/Chilenito.png";
import personaImg from "../assets/img/Persona-registrada.png";
import duocLogo from "../assets/img/logo-duoc.png";

function Home() {
  return (
    <>
      {/* SECCIÓN INTRO */}
      <section className="page-section clearfix">
        <div className="container">
          <div className="intro">
            <img
              className="intro-img img-fluid mb-3 mb-lg-0 rounded"
              src={introImg}
              alt="Pastelería"
            />
            <div className="intro-text left-0 text-center bg-faded p-5 rounded">
              <h2 className="section-heading mb-4">
                <span className="section-heading-upper">
                  Encarga tus pedidos online
                </span>
                <span className="section-heading-lower">
                  ¡Comienza a disfrutar de nuestra carta!
                </span>
              </h2>
              <p className="mb-3">
                Bienvenido/a a la pastelería de Chile que cumple con 50 años de
                historia, aportando a la gastronomía nacional desde 1975.
              </p>
              <div className="intro-button mx-auto">
                <Link to="/registro" className="btn btn-primary btn-xl">
                  ¡Regístrate para ordenar nuestros deliciosos productos!
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN PRODUCTOS DE INICIO */}
      <section className="page-section about-heading">
        <div className="container">
          <img
            className="img-fluid rounded about-heading-img mb-3 mb-lg-0"
            src={pastelesImg}
            alt="Pasteles"
          />
          <div className="about-heading-content">
            <div className="row">
              <div className="col-xl-9 col-lg-10 mx-auto">
                <div className="bg-faded rounded p-5">
                  <h2 className="section-heading mb-4">
                    <span className="section-heading-upper lato-regular">
                      Una demostración de lo que tenemos para ofrecer
                    </span>
                    <span className="section-heading-lower colorAcen1 pacifico-regular">
                      Productos más populares
                    </span>
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN RED VELVET */}
      <section className="page-section">
        <div className="container">
          <div className="product-item">
            <div className="product-item-title d-flex">
              <div className="bg-faded p-5 d-flex ms-auto rounded">
                <h2 className="section-heading mb-0">
                  <span className="section-heading-upper lato-regular">
                    N°1 en ventas
                  </span>
                  <span className="section-heading-lower colorcherryfuente lato-regular">
                    Pastel Red Velvet
                  </span>
                </h2>
              </div>
            </div>
            <img
              className="product-item-img mx-auto d-flex rounded img-fluid mb-3 mb-lg-0"
              src={redVelvetImg}
              alt="Torta Cuadrada Red Velvet"
            />
            <div className="product-item-description d-flex me-auto">
              <div className="bg-faded p-5 rounded">
                <p className="mb-0">
                  Nuestra deliciosa <strong>Red Velvet</strong> en formato
                  cuadrado, perfecta para compartir en ocasiones especiales.
                  Suave, esponjosa y con un toque de cacao, cubierta con un
                  cremoso frosting de queso crema.
                </p>
                <Link to="/productos" className="btn btn-dark text-uppercase mt-3">
                  Comprar ahora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN NUEZ MANJAR */}
      <section className="page-section">
        <div className="container">
          <div className="product-item">
            <div className="product-item-title d-flex">
              <div className="bg-faded p-5 d-flex me-auto rounded">
                <h2 className="section-heading mb-0">
                  <span className="section-heading-upper">N°2 en ventas</span>
                  <span className="section-heading-lower colorcherryfuente lato-regular">
                    Torta Nuez Manjar
                  </span>
                </h2>
              </div>
            </div>
            <img
              className="product-item-img mx-auto d-flex rounded img-fluid mb-3 mb-lg-0"
              src={nuezManjarImg}
              alt="Torta Redonda Nuez Manjar"
            />
            <div className="product-item-description d-flex ms-auto">
              <div className="bg-faded p-5 rounded">
                <p className="mb-0">
                  La especialidad desde nuestra inauguración, nuestra torta{" "}
                  <strong>Nuez Manjar</strong> en formato redondo ha sido
                  sinónimo con nuestra identidad como tienda. Crocante, dulce e
                  irresistible con su nuez molida y manjar, combinación que ha
                  existido por 50 años.
                </p>
                <Link to="/productos" className="btn btn-dark text-uppercase mt-3">
                  Comprar ahora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN CHILENITOS */}
      <section className="page-section">
        <div className="container">
          <div className="product-item">
            <div className="product-item-title d-flex">
              <div className="bg-faded p-5 d-flex ms-auto rounded">
                <h2 className="section-heading mb-0">
                  <span className="section-heading-upper">N°3 en ventas</span>
                  <span className="section-heading-lower colorcherryfuente lato-regular">
                    Chilenitos (12 unidades)
                  </span>
                </h2>
              </div>
            </div>
            <img
              className="product-item-img mx-auto d-flex rounded img-fluid mb-3 mb-lg-0"
              src={chilenitosImg}
              alt="Chilenitos"
            />
            <div className="product-item-description d-flex me-auto">
              <div className="bg-faded p-5 rounded">
                <p className="mb-0">
                  Deliciosos <strong>Chilenitos</strong>, el clásico sabor que
                  endulza generaciones. Crujientes por fuera, suaves por dentro y
                  rellenos de manjar artesanal.
                </p>
                <Link to="/productos" className="btn btn-dark text-uppercase mt-3">
                  Comprar ahora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN BIENVENIDA / REGISTRO */}
      <section className="page-section cta">
        <div className="container">
          <div className="row">
            <div className="col-xl-9 mx-auto">
              <div className="cta-inner bg-faded text-center rounded p-5">
                <div className="row align-items-center">
                  <div className="col-md-4">
                    <img
                      src={personaImg}
                      alt="Persona feliz registrada"
                      className="image-float img-fluid mb-3"
                    />
                    <p className="pacifico-regular colorAcen1 registrate-aqui">
                      Regístrate <Link to="/registro">aquí</Link>
                    </p>
                  </div>
                  <div className="col-md-8 text-start">
                    <h2 className="my-4 pacifico-regular">
                      ¿Te gustó nuestra carta? ¡Considera registrarte para acceder
                      a descuentos y promociones!
                    </h2>
                    <ul>
                      <li>
                        <b>50% de descuento para mayores de 50 años</b> — en una
                        compra hasta $150.000.
                      </li>
                      <li>
                        <b>10% de descuento a todo público durante 2025</b> — por
                        nuestros 50 años.
                      </li>
                      <li>
                        <b>Torta gratis para cumpleañeros Duoc UC</b> — si usas tu
                        correo institucional al registrarte.
                      </li>
                    </ul>
                    <img src={duocLogo} alt="Logo Duoc UC" className="img-fluid mt-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
