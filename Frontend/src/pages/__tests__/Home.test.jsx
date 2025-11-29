// Importaciones necesarias para la prueba
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// El componente que vamos a probar
import Home from '../Home.jsx';

// Agrupamos las pruebas para el componente Home
describe('Componente Home', () => {

  // Prueba 1: Verificar que el texto de bienvenida principal se renderiza
  it('debe renderizar el encabezado principal de bienvenida', () => {
    
    // ARRANGE (Preparar)
    // Renderizamos el componente Home.
    // Lo envolvemos en MemoryRouter porque Home.jsx usa <Link>
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // ACT (Actuar)
    // Buscamos el texto específico en el componente renderizado.
    // Usamos una expresión regular /.../i para ignorar mayúsculas/minúsculas.
    const headingElement = screen.getByText(
      /¡Comienza a disfrutar de nuestra carta!/i
    );

    // ASSERT (Afirmar)
    // Esperamos que el elemento (headingElement) exista en el documento.
    expect(headingElement).toBeInTheDocument();
  });

  // Prueba 2 (Bonus): Verificar que el botón de registro existe
  it('debe mostrar el enlace/botón de registro', () => {
    
    // ARRANGE
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // ACT
    // Buscamos un elemento que tenga el rol 'link' (como <Link> o <a>)
    // y que tenga un nombre (texto) específico.
    const registerLink = screen.getByRole('link', {
      name: /¡Regístrate para ordenar nuestros deliciosos productos!/i
    });

    // ASSERT
    expect(registerLink).toBeInTheDocument();
  });

  // Prueba 3 (Bonus): Verificar que se renderiza un producto popular (Red Velvet)
  it('debe mostrar la sección del producto popular "Pastel Red Velvet"', () => {

    // ARRANGE
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // ACT
    // Buscamos por el texto que describe el producto
    const productText = screen.getByText(/Pastel Red Velvet/i);
    
    // ASSERT
    expect(productText).toBeInTheDocument();
  });
});