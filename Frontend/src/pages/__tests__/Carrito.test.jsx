// Importaciones necesarias
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Componente y Contexto
import Carrito from '../Carrito'; // Ajusta la ruta si es necesario
import { CarritoContext } from '../../context/CarritoContext'; // Ajusta la ruta
import { UserContext } from '../../context/UserContext';

// ---- 1. Datos de Prueba (Mock) ----
const mockItems = [
  { id: 1, nombre: "Torta Chocolate", precio: 10000, cantidad: 1 }, // Subtotal 10.000
  { id: 2, nombre: "Pie de Limón", precio: 5000, cantidad: 2 }   // Subtotal 10.000
];
// Total: 20.000

// ---- 2. Mock de Funciones ----
const mockEliminarDelCarrito = vi.fn();
const mockVaciarCarrito = vi.fn();

// ---- 3. Helper de Renderizado ----
const renderCarritoConContexto = (items = [], usuarioMock = null) => {
  render(
    <MemoryRouter> { /* <-- 1. ENVUELVE CON EL ROUTER */ }
      <UserContext.Provider value={{ usuario: usuarioMock }}>
        <CarritoContext.Provider
          value={{
            carrito: items,
            eliminarDelCarrito: mockEliminarDelCarrito,
            vaciarCarrito: mockVaciarCarrito,
          }}
        >
          <Carrito />
        </CarritoContext.Provider>
      </UserContext.Provider>
    </MemoryRouter> 
  );
};

// ---- Inicio de las Pruebas ----
describe('Componente Carrito', () => {
  
  // Limpiamos los mocks antes de CADA prueba
  beforeEach(() => {
    mockEliminarDelCarrito.mockClear();
    mockVaciarCarrito.mockClear();
  });

  // --- Prueba 1: Carrito Vacío ---
  it('debe mostrar "Tu carrito está vacío" si no hay productos', () => {
    // ARRANGE
    renderCarritoConContexto([]); // Le pasamos un array vacío

    // ACT
    const mensajeVacio = screen.getByText(/Tu carrito está vacío/i);
    
    // ASSERT
    // 1. El mensaje debe existir
    expect(mensajeVacio).toBeInTheDocument();
    
    // 2. La tabla NO debe existir
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  // --- Prueba 2: Carrito Lleno y Total ---
  it('debe mostrar la tabla de productos y el total correcto si hay items', () => {
    // ARRANGE
    renderCarritoConContexto(mockItems);

    // ACT
    // Verificamos que los nombres de los productos están
    const item1 = screen.getByText("Torta Chocolate");
    const item2 = screen.getByText("Pie de Limón");

    // Verificamos el PRECIO del Pie de Limón
    const precioPie = screen.getByText("$5.000");

    // Verificamos TODAS las instancias de "$10.000"
    // (Precio Torta, Subtotal Torta, Subtotal Pie)
    const instanciasDiezMil = screen.getAllByText("$10.000");

    // Verificamos el total ($10.000 + $10.000 = $20.000)
    const totalHeading = screen.getByRole('heading', { name: /Total:/i, level: 3 });

    // ASSERT
    expect(item1).toBeInTheDocument();
    expect(item2).toBeInTheDocument();
    expect(precioPie).toBeInTheDocument(); // Verificamos el precio del pie
    expect(instanciasDiezMil.length).toBe(3); // <-- ¡Arreglado!
    expect(totalHeading).toHaveTextContent("$20.000");

    // El mensaje de vacío NO debe estar
    expect(screen.queryByText(/Tu carrito está vacío/i)).not.toBeInTheDocument();
  });

  // --- Prueba 3: Interacción de Botones ---
  it('debe llamar a las funciones del contexto al hacer clic en los botones', () => {
    // ARRANGE
    renderCarritoConContexto(mockItems);

    // ACT (Botón Eliminar)
    // Buscamos TODOS los botones de eliminar
    const botonesEliminar = screen.getAllByRole('button', { name: /Eliminar/i });
    
    // Hacemos clic en el segundo botón (el del Pie de Limón, id: 2)
    fireEvent.click(botonesEliminar[1]);

    // ASSERT (Eliminar)
    expect(mockEliminarDelCarrito).toHaveBeenCalledTimes(1);
    expect(mockEliminarDelCarrito).toHaveBeenCalledWith(2); // Verificamos que se llamó con el ID 2

    // ACT (Botón Vaciar)
    const botonVaciar = screen.getByRole('button', { name: /Vaciar carrito/i });
    fireEvent.click(botonVaciar);

    // ASSERT (Vaciar)
    expect(mockVaciarCarrito).toHaveBeenCalledTimes(1);
  });
});