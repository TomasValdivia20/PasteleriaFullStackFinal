// Importaciones necesarias
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Componentes y Contextos
import Header from '../Header'; // Ajusta la ruta si Header no está en ../
import { UserContext } from '../../context/UserContext'; // Ajusta la ruta a tu UserContext
import { CarritoContext } from '../../context/CarritoContext'; // Ajusta la ruta a tu CarritoContext

// ---- Mocks para las funciones de los contextos ----
// Creamos "funciones espía"
const mockLogout = vi.fn();
const mockVaciarCarrito = vi.fn();

// ---- Helper de Renderizado ----
// Esta función envuelve el Header con todos los proveedores que necesita
const renderConContexto = (estadoUsuario, itemsCarrito = []) => {
  render(
    // 1. MemoryRouter simula el Router
    <MemoryRouter initialEntries={['/']}>
      {/* 2. Proveedor de Usuario */}
      <UserContext.Provider value={{ usuario: estadoUsuario, logout: mockLogout }}>
        {/* 3. Proveedor de Carrito */}
        <CarritoContext.Provider 
          value={{ carrito: itemsCarrito, vaciarCarrito: mockVaciarCarrito }}
        >
          {/* El componente a probar */}
          <Header />

          {/* Definimos rutas falsas para probar la navegación */}
          <Routes>
            <Route path="/" element={<div>Estás en Inicio</div>} />
            <Route path="/productos" element={<div>Estás en Productos</div>} />
            <Route path="/login" element={<div>Estás en Login</div>} />
          </Routes>
          
        </CarritoContext.Provider>
      </UserContext.Provider>
    </MemoryRouter>
  );
};

// ---- Inicio de las Pruebas ----
describe('Componente Header', () => {

  // Limpiamos los mocks antes de CADA prueba
  beforeEach(() => {
    mockLogout.mockClear();
    mockVaciarCarrito.mockClear();
  });

  // --- Prueba 2 (La que pediste) ---
  it('debe navegar a /productos al hacer clic en el enlace "Productos"', () => {
    // ARRANGE
    renderConContexto(null); // Usuario no logueado

    // ACT
    // Buscamos el link por su "rol" y "nombre" (texto)
    const linkProductos = screen.getByRole('link', { name: /Productos/i });
    fireEvent.click(linkProductos);

    // ASSERT
    // Verificamos que el texto de la "página" de Productos apareció
    expect(screen.getByText(/Estás en Productos/i)).toBeInTheDocument();
  });

  // --- Pruebas Adicionales (Muy recomendadas) ---

  it('debe mostrar "Registro" e "Iniciar Sesión" si el usuario NO está logueado', () => {
    // ARRANGE
    renderConContexto(null); // 'null' significa usuario no logueado

    // ASSERT
    expect(screen.getByRole('link', { name: /Registro/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    
    // Verificamos que los links de "logueado" NO están
    expect(screen.queryByRole('link', { name: /Mi Cuenta/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cerrar Sesión/i })).not.toBeInTheDocument();
  });

  it('debe mostrar "Mi Cuenta" y "Cerrar Sesión" si el usuario SÍ está logueado', () => {
    // ARRANGE
    const usuarioMock = { nombre: 'Juan Perez' }; // Un objeto de usuario simple
    renderConContexto(usuarioMock);

    // ASSERT
    expect(screen.getByRole('link', { name: /Mi Cuenta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cerrar Sesión/i })).toBeInTheDocument();

    // Verificamos que los links de "no logueado" NO están
    expect(screen.queryByRole('link', { name: /Registro/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Iniciar Sesión/i })).not.toBeInTheDocument();
  });

  it('debe llamar a logout, vaciarCarrito y navegar a /login al cerrar sesión', () => {
    // ARRANGE
    const usuarioMock = { nombre: 'Juan Perez' };
    renderConContexto(usuarioMock);

    // ACT
    const botonCerrarSesion = screen.getByRole('button', { name: /Cerrar Sesión/i });
    fireEvent.click(botonCerrarSesion);

    // ASSERT
    // 1. Verificamos que las funciones mock fueron llamadas
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockVaciarCarrito).toHaveBeenCalledTimes(1);

    // 2. Verificamos que navegó a la página de Login
    expect(screen.getByText(/Estás en Login/i)).toBeInTheDocument();
  });

  it('debe mostrar la cantidad correcta de items en el carrito', () => {
    // ARRANGE
    const carritoMock = [
      { id: 1, cantidad: 2 },
      { id: 2, cantidad: 3 },
    ]; // Total 5 items
    renderConContexto(null, carritoMock);

    // ACT
    // El texto del link es "🛒 (5)"
    const linkCarrito = screen.getByText(`(${5})`);

    // ASSERT
    expect(linkCarrito).toBeInTheDocument();
  });
});