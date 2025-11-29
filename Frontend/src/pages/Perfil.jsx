import "../css/general.css";
import "../css/Perfil.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    } else {
      navigate("/login"); // si no hay sesión, redirige a login
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  if (!usuario) {
    return <p className="text-center mt-10">Cargando datos...</p>;
  }

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <h2>👤 Perfil de Usuario</h2>

        <div className="perfil-info">
          <p><strong>RUT:</strong> {usuario.rut}</p>
          <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}</p>
          <p><strong>Correo:</strong> {usuario.correo}</p>
          <p><strong>Región:</strong> {usuario.region}</p>
          <p><strong>Comuna:</strong> {usuario.comuna}</p>
          <p><strong>Dirección:</strong> {usuario.direccion}</p>
        </div>

        <button className="btn-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
