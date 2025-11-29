import React, { useEffect } from "react";
import { useLocation } from "react-router-dom"; // 1. Importar useLocation
import "../css/Home.css"; // 2. Reutilizar estilos del Home para el fondo
import "../css/ConfirmacionCompra.css"; // 3. Estilos propios para la tabla

function ConfirmacionCompra() {
  // 4. Obtener los datos enviados desde el carrito
  const location = useLocation();
  const { items, subtotal, descuento, total } = location.state || { items: [], total: 0 }; // Fallback por si se recarga

  // Opcional: Evitar que el usuario recargue y pierda los datos
  useEffect(() => {
    if (items.length === 0) {
      // Si no hay items (ej. recargó la pág), lo mandamos al Home
      // navigate('/'); // (Necesitarías importar useNavigate)
    }
  }, [items]);

  return (
    // 5. Reutilizamos la estructura del Home para el fondo
    <section className="page-section cta">
      <div className="container">
        <div className="row">
          <div className="col-xl-9 mx-auto">
            <div className="cta-inner bg-faded text-center rounded p-5">
              
              <h2>🎉 ¡Compra exitosa!</h2>
              <p>
                Gracias por tu compra. Te enviaremos un correo con los detalles
                del pedido.
              </p>

              {/* --- INICIO RESUMEN DE COMPRA --- */}
              {items.length > 0 ? (
                <div className="resumen-compra">
                  <h4 className="mt-4" style={{ color: "#4b1e0b" }}>
                    Resumen de tu pedido
                  </h4>
                  <table className="resumen-tabla">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Tamaño</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.nombre}</td>
                          <td>{item.tamano}</td>
                          <td>{item.cantidad}</td>
                          <td>
                            ${(item.precio * item.cantidad).toLocaleString("es-CL")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      {/* Fila del Subtotal */}
                      <tr>
                        <td colSpan="3"><strong>Subtotal</strong></td>
                        <td><strong>${subtotal.toLocaleString("es-CL")}</strong></td>
                      </tr>
                      
                      {/* Fila del Descuento (solo si se aplicó) */}
                      {descuento > 0 && (
                        <tr className="descuento-aplicado">
                          <td colSpan="3">Descuento (10%)</td>
                          <td>-${descuento.toLocaleString("es-CL")}</td>
                        </tr>
                      )}
                      
                      {/* Fila del Total Final */}
                      <tr className="total-final">
                        <td colSpan="3"><strong>Total</strong></td>
                        <td><strong>${total.toLocaleString("es-CL")}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="mt-4" style={{ color: "#c15c2e" }}>
                  (No se pudo recuperar el resumen de tu compra. Revisa tu
                  correo.)
                </p>
              )}
              {/* --- FIN RESUMEN DE COMPRA --- */}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConfirmacionCompra;