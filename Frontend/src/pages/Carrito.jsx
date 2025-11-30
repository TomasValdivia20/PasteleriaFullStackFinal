import React, { useState } from "react";
import "../css/Carrito.css";
import { useCarrito } from "../context/CarritoContext";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Carrito() {
  const { carrito, eliminarDelCarrito, vaciarCarrito } = useCarrito();
  const { usuario } = useUser();
  const navigate = useNavigate();
  // Para poder aplicar descuentos
  const [codigoInput, setCodigoInput] = useState("");
  const [descuentoAplicado, setDescuentoAplicado] = useState(false);
  const [mensajeDescuento, setMensajeDescuento] = useState("");
  const [errorConfirmacion, setErrorConfirmacion] = useState("");
  const [procesandoCompra, setProcesandoCompra] = useState(false);

  const CODIGO_DESCUENTO = "PMS50AGNOS";
  const TASA_DESCUENTO = 0.10; // 10%

  const subtotal = carrito.reduce(
    (acc, producto) => acc + producto.precio * producto.cantidad,
    0
  );
  // 2. Calcula el descuento y el total final
  const montoDescuento = descuentoAplicado ? subtotal * TASA_DESCUENTO : 0;
  const totalFinal = subtotal - montoDescuento;

  const handleAplicarDescuento = () => {
    // Si ya está aplicado, no hacer nada
    if (descuentoAplicado) {
      setMensajeDescuento("El descuento ya fue aplicado.");
      return;
    }

    // Comprobar el código
    if (codigoInput.toUpperCase() === CODIGO_DESCUENTO) {
      setDescuentoAplicado(true);
      setMensajeDescuento("¡10% de descuento aplicado!");
    } else {
      setDescuentoAplicado(false);
      setMensajeDescuento("Código de descuento incorrecto.");
    }
  };
  

  const handleConfirmarCompra = async () => {
    
    // Validacion si es que hay usuario
    if (!usuario) {
      // 1. Si NO hay usuario, muestra el error
      setErrorConfirmacion(
        "Debes iniciar sesión o registrarte para continuar."
      );
      
      // 2. Borra el mensaje después de 3 segundos
      setTimeout(() => {
        setErrorConfirmacion("");
      }, 3000);

      // 3. Detén la función aquí
      return; 
    }
    // --- FIN DE LA VALIDACIÓN ---

    try {
      setProcesandoCompra(true);
      setErrorConfirmacion("");

      // Preparar datos de la orden para el backend
      const ordenData = {
        usuarioId: usuario.id,
        totalOrden: Math.round(totalFinal), // Asegurar que sea entero
        items: carrito.map(item => ({
          productoId: item.productoId,
          varianteId: item.varianteId || null,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
          nombreProducto: item.nombre,
          tamano: item.tamano || "Tamaño único"
        }))
      };

      console.log("📦 [ORDEN] Enviando orden al backend:", ordenData);

      // Enviar al backend
      const response = await api.post('/ordenes/crear', ordenData);

      console.log("✅ [ORDEN] Respuesta del backend:", response.data);

      // Si todo salió bien, navegar a confirmación
      navigate("/confirmacion", {
        state: {
          items: [...carrito],
          subtotal: subtotal,
          descuento: montoDescuento,
          total: totalFinal,
          ordenId: response.data.id
        },
      });

      // Vaciar carrito después de crear la orden
      vaciarCarrito();

    } catch (error) {
      console.error("❌ [ORDEN] Error al crear orden:", error);
      
      const mensajeError = error.response?.data?.error || 
        "Error al procesar la compra. Por favor intenta nuevamente.";
      
      setErrorConfirmacion(mensajeError);
      
      setTimeout(() => {
        setErrorConfirmacion("");
      }, 5000);
    } finally {
      setProcesandoCompra(false);
    }
  };

  return (
    <div className="carrito-container">
      <h2>🛒 Carrito de Compras</h2>

      {carrito.length === 0 ? (
        <p className="carrito-vacio">Tu carrito está vacío.</p>
      ) : (
        <>
          <table className="carrito-tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>${item.precio.toLocaleString()}</td>
                  <td>{item.cantidad}</td>
                  <td>${(item.precio * item.cantidad).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn-eliminar"
                      onClick={() => eliminarDelCarrito(item.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="carrito-total">
            {/* --- Formulario de Descuento --- */}
            <div className="descuento-form">
              <input
                type="text"
                placeholder="Código de descuento"
                className="descuento-input"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value)}
              />
              <button
                className="btn-aplicar"
                onClick={handleAplicarDescuento}
              >
                Aplicar
              </button>
            </div>
            {mensajeDescuento && (
              <p
                className={`descuento-mensaje ${
                  descuentoAplicado ? "exito" : "error"
                }`}
              >
                {mensajeDescuento}
              </p>
            )}

            {/* --- Resumen del Total --- */}
            <div className="resumen-total">
              <p>
                Subtotal: <span>${subtotal.toLocaleString("es-CL")}</span>
              </p>

              {/* Se muestra solo si el descuento está aplicado */}
              {descuentoAplicado && (
                <p className="descuento-aplicado">
                  Descuento (10%):
                  <span>-${montoDescuento.toLocaleString("es-CL")}</span>
                </p>
              )}

              <hr />

              <h3>
                Total: <span>${totalFinal.toLocaleString("es-CL")}</span>
              </h3>
            </div>

            {errorConfirmacion && (
            <p className="mensaje-error-confirmacion">{errorConfirmacion}</p>
          )}

            <div className="carrito-botones">
              <button className="btn-vaciar" onClick={vaciarCarrito} disabled={procesandoCompra}>
                Vaciar carrito
              </button>
              <button
                className="btn-comprar"
                onClick={handleConfirmarCompra}
                disabled={procesandoCompra}
              >
                {procesandoCompra ? "Procesando..." : "Confirmar compra"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 