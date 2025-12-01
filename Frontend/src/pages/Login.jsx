// src/pages/Login.jsx
import "../css/Login.css";
import "../css/general.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import api from "../api";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!correo.trim() || !contrasena.trim()) {
      setMensaje("⚠️ Debes ingresar tu correo y contraseña.");
      return;
    }

    setCargando(true);

    try {
      console.log("🔐 [LOGIN] Intentando autenticar:", correo);

      const response = await api.post('/auth/login', {
        correo: correo.trim(),
        password: contrasena
      });

      const data = response.data;

      if (data.success) {
        console.log("✅ [LOGIN] Autenticación exitosa:", data);
        
        // 🔐 CRÍTICO: Guardar usuario con TOKEN JWT en contexto
        login({
          id: data.id,
          nombre: data.nombre,
          apellido: data.apellido,
          correo: data.correo,
          rol: data.rol,
          token: data.token  // ✅ TOKEN JWT del backend
        });

        setMensaje(`✅ ${data.mensaje} 🎉`);

        // Redirigir según rol
        setTimeout(() => {
          if (data.rol === 'ADMIN') {
            navigate('/backoffice');
          } else {
            navigate('/');
          }
        }, 1000);
      } else {
        console.warn("⚠️ [LOGIN] Autenticación fallida:", data.mensaje);
        setMensaje(`❌ ${data.mensaje}`);
      }
    } catch (error) {
      console.error("❌ [LOGIN] Error en autenticación:", error);
      
      if (error.response?.status === 401) {
        setMensaje("❌ Credenciales incorrectas");
      } else if (error.response?.data?.mensaje) {
        setMensaje(`❌ ${error.response.data.mensaje}`);
      } else {
        setMensaje("❌ Error de conexión. Verifica que el servidor esté activo.");
      }
    } finally {
      setCargando(false);
    }
  };


  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>

        <label>Correo</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="correo@ejemplo.com"
          disabled={cargando}
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          placeholder="••••••••"
          disabled={cargando}
        />

        <button type="submit" disabled={cargando}>
          {cargando ? "🔄 Iniciando sesión..." : "Ingresar"}
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
