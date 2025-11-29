// src/utils/apiUsuarios.js

const esDemo = window.location.hostname.includes("github.io");

// === Base de datos simulada para modo demo ===
const usuariosDemo = [
  {
    id: 1,
    rut: "11111111-1",
    nombre: "Tulio",
    apellido: "Triviño",
    correo: "tulio@gmail.com",
    contrasena: "tuliotriviño",
    direccion: "Providencia 123",
    region: "Región Metropolitana"
  },
  {
    id: 2,
    rut: "22222222-2",
    nombre: "Juanita ",
    apellido: "Pastelera",
    correo: "juana@gmail.com",
    contrasena: "juanitapastelera",
    direccion: "Las Condes 456",
    region: "Región Metropolitana"
  }
];

// === API abstracta: usa json-server o simulación según entorno ===

// Obtener todos los usuarios
export async function obtenerUsuarios() {
  if (esDemo) {
    console.log("🔹 Usando datos demo (GitHub Pages)");
    return usuariosDemo;
  }
  const res = await fetch("http://localhost:3001/usuarios");
  return res.json();
}

// Buscar usuario por correo
export async function buscarUsuarioPorCorreo(correo) {
  if (esDemo) {
    console.log("🔹 Buscando usuario demo:", correo);
    return usuariosDemo.filter(u => u.correo === correo);
  }
  const res = await fetch(`http://localhost:3001/usuarios?correo=${correo}`);
  return res.json();
}

// Registrar usuario
export async function registrarUsuario(nuevoUsuario) {
  if (esDemo) {
    console.log("🔹 Registrando usuario en modo demo:", nuevoUsuario);
    usuariosDemo.push({ id: usuariosDemo.length + 1, ...nuevoUsuario });
    return nuevoUsuario;
  }

  const res = await fetch("http://localhost:3001/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoUsuario)
  });
  return res.json();
}
