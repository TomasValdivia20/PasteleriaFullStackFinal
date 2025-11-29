import React from "react";

export default function ProductoDetalle({ producto, onVolver }) {
  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow">
      <button
        onClick={onVolver}
        className="text-sm text-blue-600 hover:underline mb-4"
      >
        ← Volver
      </button>
      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="w-full h-64 object-cover rounded-xl mb-4"
      />
      <h2 className="text-2xl font-bold mb-2">{producto.nombre}</h2>
      <p className="text-gray-700 mb-4">{producto.descripcion}</p>

      <h3 className="font-semibold text-lg mb-2">Tamaños y precios:</h3>
      <ul className="space-y-1 mb-4">
        {producto.tamaños.map((t, i) => (
          <li key={i}>
            •{" "}
            {t.descripcion
              ? `${t.descripcion} - $${t.precio.toLocaleString()}`
              : `${t.personas} personas - $${t.precio.toLocaleString()}`}
          </li>
        ))}
      </ul>

      {producto.tamaños[0].nutricion && (
        <>
          <h3 className="font-semibold text-lg mb-2">Información nutricional (aproximada):</h3>
          <ul className="text-sm text-gray-700">
            {Object.entries(producto.tamaños[0].nutricion).map(([key, val]) => (
              <li key={key}>{`${key}: ${val}`}</li>
            ))}
          </ul>
        </>
      )}

      <p className="text-xs text-gray-500 mt-4 italic">{producto.notas}</p>
    </div>
  );
}
