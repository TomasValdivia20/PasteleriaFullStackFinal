// src/pages/Registro.jsx

import "../css/Registro.css";
import "../css/general.css";
import { useState } from "react";
import { validarFormulario } from "../utils/validarFormulario";
import { REGIONES_Y_COMUNAS } from "../utils/dataRegiones";
import api from "../api";

export default function Registro() {
  const [formData, setFormData] = useState({
    rut: "",
    nombre: "",
    apellido: "",
    correo: "",
    region: "",
    comuna: "",
    direccion: "",
    contrasena: "",
  });

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Función ESPECÍFICA para el cambio de Región
  const handleRegionChange = (e) => {
    const regionSeleccionada = e.target.value;

    // Al cambiar región, actualizamos la región Y reseteamos la comuna
    setFormData({
      ...formData,
      region: regionSeleccionada,
      comuna: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const erroresValidacion = validarFormulario(formData);

    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    setCargando(true);
    setErrores({});
    setMensaje("");

    try {
      // Enviar datos al backend
      const response = await api.post('/auth/registro', {
        rut: formData.rut,
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        password: formData.contrasena,
        direccion: formData.direccion,
        region: formData.region,
        comuna: formData.comuna
      });

      if (response.data.success) {
        setMensaje("✅ " + response.data.mensaje);
        
        // Resetear formulario
        setFormData({
          rut: "",
          nombre: "",
          apellido: "",
          correo: "",
          region: "",
          comuna: "",
          direccion: "",
          contrasena: "",
        });
      } else {
        setMensaje("❌ " + response.data.mensaje);
      }
    } catch (error) {
      console.error("Error en registro:", error);
      
      if (error.response && error.response.data && error.response.data.mensaje) {
        setMensaje("❌ " + error.response.data.mensaje);
      } else {
        setMensaje("❌ Error al conectar con el servidor. Intente nuevamente.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="registro-container">
      <form className="registro-form" onSubmit={handleSubmit}>
        <h2>Registro</h2>

        {/*Inputs de RUT, Nombre, Apellido y Correo */}
        <label>RUT (11111111-1)</label>
        <input
          type="text"
          name="rut"
          value={formData.rut}
          onChange={handleChange}
          disabled={cargando}
        />
        {errores.rut && <span className="error">{errores.rut}</span>}

        <label>Nombre</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          disabled={cargando}
        />
        {errores.nombre && <span className="error">{errores.nombre}</span>}

        <label>Apellido</label>
        <input
          type="text"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
          disabled={cargando}
        />
        {errores.apellido && <span className="error">{errores.apellido}</span>}

        <label>Correo electrónico</label>
        <input
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          disabled={cargando}
        />
        {errores.correo && <span className="error">{errores.correo}</span>}

        {/* SECCIÓN DE REGIÓN Y COMUNA */}
        
        <label>Región</label>
        <select
          name="region"
          value={formData.region}
          onChange={handleRegionChange} //  Usamos el handler específico
          disabled={cargando}
        >
          <option value="">Selecciona una región</option>
          {/* Mapeamos desde el JSON importado */}
          {REGIONES_Y_COMUNAS.map((reg, index) => (
            <option key={index} value={reg.nombre}>
              {reg.nombre}
            </option>
          ))}
        </select>
        {errores.region && <span className="error">{errores.region}</span>}

        <label>Comuna</label>
        <select
          name="comuna"
          value={formData.comuna}
          onChange={handleChange}
          // Se habilita solo si hay región seleccionada
          disabled={!formData.region || cargando} 
        >
          <option value="">
            {formData.region ? "Selecciona una comuna" : "Primero selecciona una región"}
          </option>
          
          {/* Lógica para filtrar las comunas de la región seleccionada */}
          {formData.region &&
            REGIONES_Y_COMUNAS.find((reg) => reg.nombre === formData.region)?.comunas.map((comuna, index) => (
              <option key={index} value={comuna}>
                {comuna}
              </option>
            ))
          }
        </select>
        {/* Si quisieras mostrar error de comuna, iría aquí */}

        {/* FIN SECCIÓN MODIFICADA */}

        <label>Dirección</label>
        <input
          type="text"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          disabled={cargando}
        />
        {errores.direccion && <span className="error">{errores.direccion}</span>}

        {/* Resto del formulario */}
        <label>Contraseña</label>
        <input
          type="password"
          name="contrasena"
          value={formData.contrasena}
          onChange={handleChange}
          disabled={cargando}
        />
        {errores.contrasena && <span className="error">{errores.contrasena}</span>}

        <button type="submit" disabled={cargando}>
          {cargando ? (
            <>
              <span className="spinner"></span>Registrando...
            </>
          ) : (
            "Registrar"
          )}
        </button>

        {mensaje && (
          <p
            className={`mensaje ${
              mensaje.startsWith("✅") ? "mensaje-exito" : "mensaje-error"
            }`}
          >
            {mensaje}
          </p>
        )}
      </form>
    </div>
  );
}