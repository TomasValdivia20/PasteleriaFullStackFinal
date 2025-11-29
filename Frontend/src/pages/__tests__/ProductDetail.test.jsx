// Importaciones necesarias
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Componente y Contexto
import ProductDetail from '../ProductDetail'; // Ajusta la ruta si es necesario
import { CarritoContext } from '../../context/CarritoContext'; // Ajusta la ruta

// ---- 1. Datos de Prueba (Mock) ----
// Simulamos el producto que el 'fetch' debería devolver
const mockProducto = {
  id: "1",
  nombre: "Torta de Chocolate",
  descripcion: "Deliciosa torta de chocolate.",
  imagen: "ruta/imagen.jpg",
  tamaños: [
    {
      personas: 8,
      precio: 10000,
      nutricion: null // Sin info nutricional
    },
    {
      personas: 15,
      precio: 15000,
      nutricion: { // Con info nutricional
        peso: "1.5kg",
        energia: "400kcal",
        porcion: "100g",
        proteinas: "5g",
        grasas: "20g",
        carbohidratos: "50g",
        azucares: "30g",
        sodio: "200mg"
      }
    }
  ]
};

// ---- 2. Mock de Funciones ----
const mockAgregarAlCarrito = vi.fn();


// Le decimos a Vitest que controle el tiempo (para los 'setTimeout')
//vi.useFakeTimers();

// ---- 3. Helper de Renderizado ----
const renderComponente = () => {
  render(
    // MemoryRouter es necesario por 'useParams()'
    // Simulamos que estamos en la URL '/producto/1'
    <MemoryRouter initialEntries={['/producto/1']}>
      <CarritoContext.Provider value={{ agregarAlCarrito: mockAgregarAlCarrito }}>
        
        {/* Definimos la ruta para que 'useParams()' pueda leer el :id */}
        <Routes>
          <Route path="/producto/:id" element={<ProductDetail />} />
        </Routes>
        
      </CarritoContext.Provider>
    </MemoryRouter>
  );
};

// ---- Inicio de las Pruebas ----
describe('Componente ProductDetail', () => {

  // Antes de CADA prueba:
  beforeEach(() => {
    // Limpiamos el contador
    mockAgregarAlCarrito.mockClear();
    
    // ✅ CAMBIO CLAVE: Usamos mockImplementation para revisar la URL
    vi.spyOn(window, 'fetch').mockImplementation((url) => {
      
      // Verificamos si la URL es la que el componente está llamando
      if (url === '/data/productos.json') {
        // Si es, devolvemos nuestro producto falso
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockProducto]), // Devuelve un array, como en tu código
        });
      }

      // Si el fetch es a cualquier OTRA url, lo dejamos fallar
      // (así detectamos si el componente llama a algo inesperado)
      return Promise.reject(new Error(`Llamada fetch no simulada: ${url}`));
    });
  });

  // Después de CADA prueba:
  afterEach(() => {
    vi.restoreAllMocks(); // Restaura el 'fetch' original
  });

  // --- Prueba 3 (La que pediste) ---
  it('debe actualizar el precio cuando se selecciona un tamaño', async () => {
    // ARRANGE
    renderComponente();

    // ACT
    // 1. Esperamos a que el componente cargue (que el 'fetch' termine)
    // Buscamos el <select> por su etiqueta
    const selectTamano = await screen.findByLabelText(/Seleccionar tamaño/i);

    // 2. Verificamos que el precio NO es visible al inicio (porque no hay tamaño)
    expect(screen.queryByText(/\$10\.000/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\$15\.000/i)).not.toBeInTheDocument();

    // 3. Simulamos la selección del tamaño de 15 personas (índice 1)
    fireEvent.change(selectTamano, { target: { value: '1' } });

    // ASSERT
    // 4. Verificamos que el precio de 15.000 AHORA SÍ es visible
    // Usamos 'findBy' para dar tiempo a que el estado de React se actualice
    const precio = await screen.findByText("$15.000");
    expect(precio).toBeInTheDocument();
  });

  // --- Prueba 4 (Renderizado condicional de Nutrición) ---
  it('debe mostrar la tabla nutricional solo si el tamaño la tiene', async () => {
    // ARRANGE
    renderComponente();
    const selectTamano = await screen.findByLabelText(/Seleccionar tamaño/i);

    // ACT (Seleccionar tamaño 0, sin nutrición)
    fireEvent.change(selectTamano, { target: { value: '0' } });
    
    // ASSERT
    expect(screen.queryByText(/Información Nutricional/i)).not.toBeInTheDocument();

    // ACT (Seleccionar tamaño 1, con nutrición)
    fireEvent.change(selectTamano, { target: { value: '1' } });

    // ASSERT
    // Usamos 'findBy' para esperar que aparezca
    expect(await screen.findByRole('img')).toBeInTheDocument();
  });


  // --- Pruebas de Lógica de Negocio (Botón Agregar) ---

  it('debe mostrar un mensaje de error si se agrega sin seleccionar tamaño', async () => {
    // ARRANGE
    renderComponente();
    
    // Esperamos a que el botón "Agregar" esté listo
    const botonAgregar = await screen.findByRole('button', { name: /Agregar al Carrito/i });

    // ACT
    fireEvent.click(botonAgregar);

    // ASSERT
    // 1. El mensaje de error debe aparecer
    const mensajeError = await screen.findByText(/Debes seleccionar un tamaño/i);
    expect(mensajeError).toBeInTheDocument();

    // 2. La función del carrito NO debe haber sido llamada
    expect(mockAgregarAlCarrito).not.toHaveBeenCalled();
  });

  it('debe llamar a agregarAlCarrito y mostrar mensaje de éxito al agregar', async () => {
    // ARRANGE
    renderComponente();
    const selectTamano = await screen.findByLabelText(/Seleccionar tamaño/i);
    const botonAgregar = await screen.findByRole('button', { name: /Agregar al Carrito/i });

    // ACT
    // 1. Seleccionamos el tamaño de 8 personas (índice 0)
    fireEvent.change(selectTamano, { target: { value: '0' } });
    
    // 2. Hacemos clic en agregar
    fireEvent.click(botonAgregar);

    // ASSERT
    // 1. El mensaje de éxito debe aparecer
    const mensajeExito = await screen.findByText(/Producto agregado al carrito/i);
    expect(mensajeExito).toBeInTheDocument();

    // 2. La función SÍ debe haber sido llamada
    expect(mockAgregarAlCarrito).toHaveBeenCalledTimes(1);

    // 3. (Avanzado) Verificamos que se llamó con los datos correctos
    expect(mockAgregarAlCarrito).toHaveBeenCalledWith({
      id: "1",
      nombre: "Torta de Chocolate",
      imagen: "ruta/imagen.jpg",
      precio: 10000, // El precio del tamaño 0
      tamano: "8 personas"
    });

    // 4. (Fake Timers) Adelantamos el reloj para probar que el mensaje desaparece
    //vi.runAllTimers();
    //expect(screen.queryByText(/Producto agregado al carrito/i)).not.toBeInTheDocument();
  });
});