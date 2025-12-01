import "../css/general.css";
import "../css/Perfil.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import api from "../api";

export default function Perfil() {
  const [usuarioCompleto, setUsuarioCompleto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { usuario: usuarioLocal, logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      // Verificar si hay usuario en contexto/localStorage
      if (!usuarioLocal || !usuarioLocal.id) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("📡 [PERFIL] Cargando datos del usuario autenticado");
        
        // Usar endpoint de perfil autenticado (no requiere ID, usa token JWT)
        const response = await api.get('/auth/perfil');
        
        console.log("✅ [PERFIL] Datos cargados:", response.data);
        setUsuarioCompleto(response.data);
        
      } catch (err) {
        console.error("❌ [PERFIL] Error al cargar datos:", err);
        setError("Error al cargar los datos del usuario");
        
        // Si el error es 401/403, cerrar sesión
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.warn("⚠️ [PERFIL] Token inválido o expirado, cerrando sesión");
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    cargarDatosUsuario();
  }, [usuarioLocal, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="perfil-container">
        <div className="perfil-card">
          <p className="text-center">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="perfil-container">
        <div className="perfil-card">
          <p className="text-center text-danger">{error}</p>
          <button className="btn-logout" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!usuarioCompleto) {
    return null;
  }

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <h2>👤 Perfil de Usuario</h2>

        <div className="perfil-info">
          <p><strong>RUT:</strong> {usuarioCompleto.rut}</p>
          <p><strong>Nombre:</strong> {usuarioCompleto.nombre} {usuarioCompleto.apellido}</p>
          <p><strong>Correo:</strong> {usuarioCompleto.correo}</p>
          <p><strong>Región:</strong> {usuarioCompleto.region}</p>
          <p><strong>Comuna:</strong> {usuarioCompleto.comuna}</p>
          <p><strong>Dirección:</strong> {usuarioCompleto.direccion}</p>
          <p><strong>Rol:</strong> <span className="badge-rol">{usuarioCompleto.rol?.nombre || 'USUARIO'}</span></p>
        </div>

        <button className="btn-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
