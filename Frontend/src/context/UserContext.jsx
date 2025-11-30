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
      try {
        const usuarioData = JSON.parse(usuarioGuardado);
        setUsuario(usuarioData);
        console.log("👤 [UserContext] Usuario cargado desde localStorage:", usuarioData.correo, "- Rol:", usuarioData.rol);
      } catch (error) {
        console.error("❌ [UserContext] Error al parsear usuario de localStorage:", error);
        localStorage.removeItem("usuario");
      }
    }
  }, []);

  // Función para iniciar sesión (guarda en estado y localStorage con token)
  const login = (usuarioData) => {
    // Validar que tenga token JWT
    if (!usuarioData.token) {
      console.warn("⚠️ [UserContext] Usuario sin token JWT:", usuarioData);
    }
    
    setUsuario(usuarioData);
    localStorage.setItem("usuario", JSON.stringify(usuarioData));
    console.log("✅ [UserContext] Login exitoso - Usuario:", usuarioData.correo, "- Rol:", usuarioData.rol, "- Token:", usuarioData.token ? "Sí" : "No");
  };

  // Función para cerrar sesión (limpia token)
  const logout = () => {
    console.log("🚪 [UserContext] Logout - Limpiando datos de usuario y token");
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
