/**
 * Utilidad para generar rutas correctas de assets en desarrollo y producción
 * 
 * En desarrollo: /assets/img/foto.jpg
 * En producción (GitHub Pages): /Pasteleria-Mil-Sabores-VersionReactFinalFinal/assets/img/foto.jpg
 */

const BASE_PATH = import.meta.env.BASE_URL || '/';

/**
 * Genera la ruta completa para un asset (imagen, archivo, etc.)
 * @param {string} path - Ruta relativa del asset (ej: 'img/foto.jpg' o '/img/foto.jpg')
 * @returns {string} - Ruta completa del asset
 */
export const getAssetPath = (path) => {
  if (!path) {
    console.warn('⚠️ [getAssetPath] Path vacío, usando imagen por defecto');
    return `${BASE_PATH}assets/img/etiqueta-vacia.png`;
  }

  // Si la ruta ya incluye http:// o https://, es una URL completa
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Eliminar slash inicial si existe
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Si la ruta no incluye 'assets/', agregarla
  const finalPath = cleanPath.startsWith('assets/') 
    ? cleanPath 
    : `assets/${cleanPath}`;

  const fullPath = `${BASE_PATH}${finalPath}`;
  
  console.log(`🖼️ [getAssetPath] ${path} → ${fullPath}`);
  
  return fullPath;
};

/**
 * Genera la ruta para una imagen
 * @param {string} imageName - Nombre o ruta de la imagen
 * @returns {string} - Ruta completa de la imagen
 */
export const getImagePath = (imageName) => {
  if (!imageName) {
    return getAssetPath('img/etiqueta-vacia.png');
  }

  // Si ya incluye 'img/', usar directamente
  if (imageName.includes('img/')) {
    return getAssetPath(imageName);
  }

  // Si no, agregar el prefijo img/
  return getAssetPath(`img/${imageName}`);
};

/**
 * Ruta de imagen por defecto cuando falla la carga
 */
export const DEFAULT_IMAGE = `${BASE_PATH}assets/img/etiqueta-vacia.png`;

console.log('🛠️ [assetHelpers] Helpers de assets inicializados');
console.log(`   BASE_URL: ${import.meta.env.BASE_URL}`);
console.log(`   MODE: ${import.meta.env.MODE}`);
console.log(`   DEFAULT_IMAGE: ${DEFAULT_IMAGE}`);
