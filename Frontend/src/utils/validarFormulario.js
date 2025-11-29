// src/utils/validarFormulario.js
const validarRut = (input) => {
  // Asegurarnos de que el input es un string y no está vacío
  if (!input || typeof input !== 'string') {
    return false;
  }

  // 1. Limpiar el RUT
  // Deja solo números, 'k' y guion.
  const rutLimpio = input.toLowerCase().replace(/[^0-9k-]/g, "").trim();

  // 2. Validar formato básico (6-8 dígitos, guion, 1 dígito/k)
  if (!/^[0-9]{6,8}-[0-9k]$/.test(rutLimpio)) {
    return false;
  }

  // 3. Separar cuerpo y dígito verificador
  const [cuerpo, dvIngresado] = rutLimpio.split('-');

  // 4. Calcular dígito verificador (Módulo 11)
  let suma = 0;
  let multiplo = 2;

  // Iterar sobre el cuerpo al revés
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  // 5. Obtener DV esperado
  const resto = suma % 11;
  const dvCalculadoInt = 11 - resto;

  let dvEsperado;

  if (dvCalculadoInt === 11) {
    dvEsperado = '0';
  } else if (dvCalculadoInt === 10) {
    dvEsperado = 'k';
  } else {
    dvEsperado = dvCalculadoInt.toString();
  }

  // 6. Comparar DV ingresado con DV esperado
  return dvIngresado === dvEsperado;
};

export const validarFormulario = (formData) => {
  const errores = {};

  if (!formData.rut || !validarRut(formData.rut)) {
    errores.rut = "El RUT no es válido. Ej: 21503678-5";
  }

  if (!formData.nombre.trim()) errores.nombre = "El nombre es obligatorio";
  if (!formData.apellido.trim()) errores.apellido = "El apellido es obligatorio";

  if (!formData.correo || !/\S+@\S+\.\S+/.test(formData.correo)) {
  errores.correo = "Correo inválido";
}

  if (!formData.region.trim()) errores.region = "Debe ingresar una región";
  if (!formData.direccion.trim()) errores.direccion = "Debe ingresar una dirección";

  if (!formData.contrasena || formData.contrasena.length < 6) {
    errores.contrasena = "La contraseña debe tener al menos 6 caracteres";
  }

  return errores;
};
