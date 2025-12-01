// src/components/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useUser } from "../context/UserContext";
import "../css/Header.css";
import "../css/general.css";
import logo from "../assets/img/Logo.png";

export default function Header() {
  const { carrito, vaciarCarrito } = useCarrito();
  const { usuario, logout } = useUser();
  const navigate = useNavigate();

  // 🔹 Calcular cantidad total de productos del carrito
  const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  // 🔹 Al cerrar sesión, limpiar sesión y carrito
  const handleLogout = () => {
    logout();
    vaciarCarrito();
    navigate("/login");
  };

  return (
    <header className="header-container">
      {/* === Sección superior (logo + título) === */}
      <div className="header-top">
        <div className="logo-container">
          <img src={logo} alt="Logo Mil Sabores" className="header-logo" />
          <div className="header-title">
            <span>PASTELERÍA</span>
            <h1>MIL SABORES</h1>
          </div>
        </div>
      </div>

      {/* === Barra de navegación principal === */}
      <nav className="header-navbar">
        <ul>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/acercadenosotros">Acerca de Nosotros</Link></li>
          <li><Link to="/productos">Productos</Link></li>
          <li><Link to="/blogs">Blog</Link></li>
          <li><Link to="/contacto">Contacto</Link></li>
          <li><Link to="/carrito">Carrito de Compras</Link></li>

          {/* 🔹 Mostrar opciones según si el usuario está logueado */}
          {usuario ? (
            <>
              <li><Link to="/perfil">Mi Cuenta</Link></li>
              
              {/* 🔒 Mostrar enlace a Empleados si es ADMIN o EMPLEADO */}
              {(usuario.rol === 'ADMIN' || usuario.rol === 'EMPLEADO') && (
                <li><Link to="/backoffice">Empleados</Link></li>
              )}
              
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/registro">Registro</Link></li>
              <li><Link to="/login">Iniciar Sesión</Link></li>
            </>
          )}
        </ul>

        {/* 🔹 Carrito visible en la parte derecha */}
        <div className="header-cart">
          <Link to="/carrito" className="cart-link">
            🛒 <span>({cantidadTotal})</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
