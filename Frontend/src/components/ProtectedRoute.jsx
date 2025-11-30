import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

/**
 * Componente para proteger rutas que requieren autenticación y rol específico
 * @param {Object} props
 * @param {React.Component} props.children - Componente hijo a renderizar si tiene acceso
 * @param {string} props.requiredRole - Rol requerido (ej: "ADMIN", "EMPLEADO")
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { usuario } = useUser();

  // Si no hay usuario logueado, redirigir a login
  if (!usuario) {
    console.warn('⚠️ [ProtectedRoute] Usuario no autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole && usuario.rol !== requiredRole) {
    console.warn(`⚠️ [ProtectedRoute] Acceso denegado. Rol requerido: ${requiredRole}, Rol usuario: ${usuario.rol}`);
    return <Navigate to="/" replace />;
  }

  console.log(`✅ [ProtectedRoute] Acceso permitido para: ${usuario.correo} (Rol: ${usuario.rol})`);
  return children;
};

export default ProtectedRoute;
