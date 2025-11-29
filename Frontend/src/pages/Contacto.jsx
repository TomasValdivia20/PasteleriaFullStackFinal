// src/pages/Contacto.jsx

import "../css/Registro.css";
import "../css/general.css";
import { useState } from "react";
// No se necesita importar validarFormulario ni dataRegiones

export default function Contacto() {
  // 1. Estado para los campos requeridos
  const [formData, setFormData] = useState({
    email: "", // Correo
    nombre: "",
    telefono: "",
    mensaje: "",
  });

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [mensajeEnvio, setMensajeEnvio] = useState("");

  // Handler genérico para actualizar el estado
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
// Función simple de validación para el formulario de Contacto
const validarFormularioContacto = (data) => {
    let errores = {};
    // 1. Limpiamos el teléfono (debe ser la primera línea después de la declaración de errores)
    const telefonoLimpio = data.telefono.replace(/\D/g, ''); 

    // 2. Validaciones Obligatorias
    if (!data.email) {
      errores.email = "El correo es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errores.email = "El correo no es válido.";
    }
    if (!data.nombre) errores.nombre = "El nombre es obligatorio.";
    if (!data.mensaje) errores.mensaje = "El mensaje es obligatorio.";

    // 3. Validación Chilena del Teléfono (No obligatorio)
    if (data.telefono) { // Solo validamos si el campo NO está vacío
      // Si el usuario ingresó algo, debe tener entre 8 y 9 dígitos limpios
      if (telefonoLimpio.length < 8 || telefonoLimpio.length > 9) {
        errores.telefono = "El teléfono debe tener 8 o 9 dígitos (sin incluir el +56).";
      }
    }
    
    return errores;
};

  const handleSubmit = (e) => {
    e.preventDefault();
    setMensajeEnvio("");
    const erroresValidacion = validarFormularioContacto(formData);

    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    setErrores({});
    setCargando(true);

    // --- Lógica de Envío Simulada (Aquí se enviaría el email real) ---
    // En un proyecto real, aquí usarías un servicio de backend (PHP, Node/Express)
    // o un servicio de formularios como Formspree/EmailJS.

    setTimeout(() => {
      setCargando(false);
      
      // Simulación de éxito
      setMensajeEnvio("✅ Mensaje enviado con éxito. Te responderemos pronto.");
      
      // Resetear campos después del envío
      setFormData({
        email: "",
        nombre: "",
        telefono: "",
        mensaje: "",
      });

    }, 2000); // Simula el tiempo que tardaría el servidor en responder
  };

  return (
    // Reutilizamos la clase principal del Registro para el estilo de fondo
    <div className="registro-container"> 
      
      {/* Reutilizamos la clase del formulario de Registro */}
      <form className="registro-form" onSubmit={handleSubmit}>
        
        <h2>Formulario de contacto</h2>
        <p className="descripcion-form" style={{ color: "white" }}>Envíanos un mensaje y te contestaremos tan pronto como sea posible.</p>

        {/* Campo: Nombre */}
        <label htmlFor="nombre">Nombre *</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          disabled={cargando}
        />
        {errores.nombre && <span className="error">{errores.nombre}</span>}

        {/* Campo: Email */}
        <label htmlFor="email">E-mail *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={cargando}
        />
        {errores.email && <span className="error">{errores.email}</span>}
        
        {/* Campo: Teléfono */}
        <label htmlFor="telefono">Teléfono*</label>
        <input
          type="tel"
          id="telefono"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          disabled={cargando}
        />
        {errores.telefono && <span className="error">{errores.telefono}</span>} 

        {/* Campo: Mensaje (Textarea) */}
        <label htmlFor="mensaje">Mensaje *</label>
        <textarea 
            id="mensaje"
            name="mensaje"
            rows="12" 
            value={formData.mensaje}
            onChange={handleChange}
            disabled={cargando}
        ></textarea>
        {errores.mensaje && <span className="error">{errores.mensaje}</span>}

        {/* Mensaje de campos obligatorios */}
        <p className="campos-obligatorios">* Campos obligatorios</p>
        
        {/* Botón ENVIAR */}
        {/* Usamos un estilo en línea temporal para el color rojo si no existe una clase .btn-enviar-rojo */}
        <button 
            type="submit" 
            disabled={cargando}
            style={{ 
                backgroundColor: '#b80041', // Color rojo/vino similar a la imagen
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1em',
                fontWeight: 'bold',
                marginTop: '15px'
            }}
            className="enviar-button" // Puedes definir esta clase en tu CSS si el estilo te sirve para más botones
        >
          {cargando ? (
            <>
              <span className="spinner"></span>Enviando...
            </>
          ) : (
            "Enviar"
          )}
        </button>

        {/* Mensaje de éxito/error del envío */}
        {mensajeEnvio && (
          <p
            className={`mensaje ${
              mensajeEnvio.startsWith("✅") ? "mensaje-exito" : "mensaje-error"
            }`}
          >
            {mensajeEnvio}
          </p>
        )}
      </form>
    </div>
  );
}