/**
 * Utilidad para generar rutas correctas de assets en desarrollo y producción
 * 
 * En desarrollo y producción (Vercel): /assets/img/foto.jpg
 */

const BASE_PATH = '/';

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

/**
 * Resuelve la URL de imagen de un producto, manejando Supabase URLs y paths locales
 * @param {Object} producto - Objeto producto con imagenes[] o imagen
 * @returns {string} - URL completa de la imagen
 */
export const resolveProductImageUrl = (producto) => {
  if (!producto) {
    console.warn('⚠️ [resolveProductImageUrl] Producto undefined');
    return DEFAULT_IMAGE;
  }

  // PRIORIDAD 1: Imágenes de Supabase (tabla imagenes_producto)
  if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
    const imagenPrincipal = producto.imagenes.find(img => img.esPrincipal);
    const urlSupabase = imagenPrincipal ? imagenPrincipal.urlSupabase : producto.imagenes[0].urlSupabase;
    
    if (urlSupabase) {
      console.log(`✅ [resolveProductImageUrl] Usando Supabase: ${urlSupabase}`);
      return urlSupabase;
    }
  }

  // PRIORIDAD 2: Path local en producto.imagen
  if (producto.imagen) {
    // Si es URL completa (Supabase), usarla directamente
    if (producto.imagen.startsWith('http://') || producto.imagen.startsWith('https://')) {
      console.log(`✅ [resolveProductImageUrl] Usando URL completa: ${producto.imagen}`);
      return producto.imagen;
    }

    // Si es path local, convertir a asset de Vite
    console.log(`ℹ️ [resolveProductImageUrl] Convirtiendo path local: ${producto.imagen}`);
    return getAssetPath(producto.imagen);
  }

  // FALLBACK: Imagen por defecto
  console.warn(`⚠️ [resolveProductImageUrl] No se encontró imagen para producto ${producto.id || 'unknown'}, usando fallback`);
  return DEFAULT_IMAGE;
};
