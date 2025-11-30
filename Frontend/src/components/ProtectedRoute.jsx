import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

/**
 * Componente para proteger rutas que requieren autenticación y rol específico
 * @param {Object} props
 * @param {React.Component} props.children - Componente hijo a renderizar si tiene acceso
 * @param {string|string[]} props.requiredRole - Rol(es) requerido(s) (ej: "ADMIN" o ["ADMIN", "EMPLEADO"])
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { usuario } = useUser();

  // Si no hay usuario logueado, redirigir a login
  if (!usuario) {
    console.warn('⚠️ [ProtectedRoute] Usuario no autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  // Verificar token JWT
  if (!usuario.token) {
    console.warn('⚠️ [ProtectedRoute] Usuario sin token JWT válido, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico
  if (requiredRole) {
    const rolesPermitidos = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!rolesPermitidos.includes(usuario.rol)) {
      console.warn(`⚠️ [ProtectedRoute] Acceso denegado. Roles permitidos: ${rolesPermitidos.join(', ')}, Rol usuario: ${usuario.rol}`);
      return <Navigate to="/" replace />;
    }
  }

  console.log(`✅ [ProtectedRoute] Acceso permitido para: ${usuario.correo} (Rol: ${usuario.rol})`);
  return children;
};

export default ProtectedRoute;
