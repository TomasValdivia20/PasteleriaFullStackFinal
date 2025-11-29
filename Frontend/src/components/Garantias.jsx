import React from "react";

export default function Garantias() {
  const garantias = [
    {
      titulo: "Delivery Gratis",
      texto:
        "Lleva la magia de la pastelería directo a tu puerta, sin costo adicional en tu envío.",
      icono: "🛒",
    },
    {
      titulo: "Pago 100% Seguro",
      texto:
        "Compra con total tranquilidad, tus transacciones están protegidas con la mejor tecnología de seguridad.",
      icono: "🔒",
    },
    {
      titulo: "Garantía de Seguridad",
      texto:
        "Tu confianza es lo más importante, por eso cuidamos cada detalle para que tu experiencia sea siempre confiable.",
      icono: "🛡️",
    },
    {
      titulo: "Garantía de Ahorro",
      texto:
        "Disfruta de la mejor relación entre calidad y precio, porque endulzar la vida no tiene que ser caro.",
      icono: "💰",
    },
  ];

  return (
    <section className="producto-container formulario">
      <div className="container-fluid fondo-g">
        <h1 className="pacifico-regular centralizar">Calidad garantizada</h1>
        <br />
        <div className="lato-regular fondo-g">
          {garantias.map((g, i) => (
            <div key={i} className="card mb-3 border-0 fondo-frase">
              <div className="row align-items-center">
                <div className="col-md-2 text-dark fondo-frase pad-garantias text-center fs-1">
                  {g.icono}
                </div>
                <div className="col-md-10 fondo-frase">
                  <div className="card-body p-0">
                    <h5 className="pacifico-regular">{g.titulo}</h5>
                    <p className="card-text">{g.texto}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
