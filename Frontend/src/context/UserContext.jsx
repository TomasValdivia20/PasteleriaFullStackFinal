// src/context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

export const UserContext = createContext(null);

// Este será el proveedor que envolverá toda tu app
export function UserProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  // Cargar usuario guardado desde localStorage al iniciar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  // Función para iniciar sesión (guarda en estado y localStorage)
  const login = (usuarioData) => {
    setUsuario(usuarioData);
    localStorage.setItem("usuario", JSON.stringify(usuarioData));
  };

  // Función para cerrar sesión
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
  };

  // Hacemos disponible todo a los hijos
  return (
    <UserContext.Provider value={{ usuario, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook para usar el contexto en cualquier parte
export const useUser = () => useContext(UserContext);
