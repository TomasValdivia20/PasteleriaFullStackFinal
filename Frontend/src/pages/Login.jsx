// src/pages/Login.jsx
import "../css/Login.css";
import "../css/general.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false); // 🟢 Nuevo estado
  const navigate = useNavigate();
  const { login } = useUser();

   const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!correo.trim() || !contrasena.trim()) {
      setMensaje("⚠️ Debes ingresar tu correo y contraseña.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/usuarios?correo=${correo}`);
      const usuarios = await response.json();

      if (usuarios.length === 0) {
        setMensaje("❌ Correo no registrado.");
        return;
      }

      const usuario = usuarios[0];

      if (usuario.contrasena !== contrasena) {
        setMensaje("❌ Contraseña incorrecta.");
        return;
      }

      login(usuario);
      setMensaje("✅ Inicio de sesión exitoso 🎉");

      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Error:", error);

      // ⚙️ MODO DEMO: si no hay servidor, intenta con localStorage
      const usuariosLocales = JSON.parse(localStorage.getItem("usuariosDemo")) || [];
      const usuario = usuariosLocales.find(u => u.correo === correo);

      if (!usuario) {
        setMensaje("❌ Correo no registrado (modo demo)");
        return;
      }

      if (usuario.contrasena !== contrasena) {
        setMensaje("❌ Contraseña incorrecta (modo demo)");
        return;
      }

      login(usuario);
      setMensaje("✅ Inicio de sesión exitoso (modo demo)");

      setTimeout(() => navigate("/"), 1000);
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
