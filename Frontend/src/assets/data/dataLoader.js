import api from '../../api'; 

// ===== CARGAR TODAS LAS CATEGORÍAS =====
export const cargarCategorias = async () => {
  console.log('📚 [dataLoader] Iniciando carga de categorías...');
  
  try {
    const response = await api.get('/categorias');
    
    console.log('✅ [dataLoader] Categorías cargadas exitosamente');
    console.log(`   Total de categorías: ${response.data?.length || 0}`);
    
    if (!response.data || response.data.length === 0) {
      console.warn('⚠️  [dataLoader] La respuesta de categorías está vacía');
    }
    
    return response.data || [];
  } catch (error) {
    console.error('❌ [dataLoader] Error cargando categorías:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    
    // Retornamos array vacío para evitar crashes en el frontend
    return [];
  }
};

// ===== CARGAR TODOS LOS PRODUCTOS =====
export const cargarProductos = async () => {
  console.log('🎂 [dataLoader] Iniciando carga de todos los productos...');
  
  try {
    const response = await api.get('/productos');
    
    console.log('✅ [dataLoader] Productos cargados exitosamente');
    console.log(`   Total de productos: ${response.data?.length || 0}`);
    
    if (!response.data || response.data.length === 0) {
      console.warn('⚠️  [dataLoader] La respuesta de productos está vacía');
    }
    
    return response.data || [];
  } catch (error) {
    console.error('❌ [dataLoader] Error cargando productos:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    
    return [];
  }
};

// ===== CARGAR PRODUCTOS POR ID DE CATEGORÍA =====
export const cargarProductosPorCategoria = async (idCategoria) => {
    console.log(`🎯 [dataLoader] Iniciando carga de productos para categoría ID: ${idCategoria}`);
    
    if (!idCategoria) {
        console.error('❌ [dataLoader] ID de categoría inválido:', idCategoria);
        return [];
    }
    
    try {
        const response = await api.get(`/productos/categoria/${idCategoria}`);
        
        console.log('✅ [dataLoader] Productos por categoría cargados exitosamente');
        console.log(`   Categoría ID: ${idCategoria}`);
        console.log(`   Total de productos: ${response.data?.length || 0}`);
        
        if (!response.data || response.data.length === 0) {
            console.warn(`⚠️  [dataLoader] No se encontraron productos para la categoría ${idCategoria}`);
        }
        
        return response.data || [];
    } catch (error) {
        console.error(`❌ [dataLoader] Error cargando productos para categoría ${idCategoria}:`, {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            baseURL: error.config?.baseURL
        });
        
        return [];
    }
};

// ===== CARGAR PRODUCTO POR ID =====
export const cargarProductoPorId = async (idProducto) => {
    console.log(`🔍 [dataLoader] Iniciando carga de producto ID: ${idProducto}`);
    
    if (!idProducto) {
        console.error('❌ [dataLoader] ID de producto inválido:', idProducto);
        return null;
    }
    
    try {
        // INTENTO 1: Intentar endpoint directo GET /productos/{id}
        console.log(`🎯 [dataLoader] Intento 1: GET /productos/${idProducto}`);
        const response = await api.get(`/productos/${idProducto}`);
        
        console.log('✅ [dataLoader] Producto cargado exitosamente desde endpoint directo');
        console.log(`   Producto ID: ${idProducto}`);
        console.log(`   Nombre: ${response.data?.nombre || 'N/A'}`);
        
        return response.data || null;
    } catch (error) {
        // Si falla con 405, el backend no implementó el endpoint individual
        if (error.response?.status === 405) {
            console.warn(`⚠️  [dataLoader] Endpoint GET /productos/${idProducto} no disponible (405)`);
            console.log(`🔄 [dataLoader] Intento 2: Cargar todos y filtrar por ID`);
            
            try {
                // INTENTO 2: Cargar todos los productos y filtrar
                const todosLosProductos = await cargarProductos();
                
                if (!todosLosProductos || todosLosProductos.length === 0) {
                    console.warn('⚠️  [dataLoader] No se pudieron cargar los productos');
                    return null;
                }
                
                // Filtrar por ID (convertir ambos a números para comparación segura)
                const producto = todosLosProductos.find(p => Number(p.id) === Number(idProducto));
                
                if (producto) {
                    console.log('✅ [dataLoader] Producto encontrado mediante filtrado local');
                    console.log(`   Producto ID: ${idProducto}`);
                    console.log(`   Nombre: ${producto.nombre || 'N/A'}`);
                    return producto;
                } else {
                    console.warn(`⚠️  [dataLoader] No se encontró producto con ID ${idProducto} en la lista`);
                    return null;
                }
            } catch (fallbackError) {
                console.error(`❌ [dataLoader] Error en método de respaldo:`, {
                    message: fallbackError.message,
                    code: fallbackError.code
                });
                return null;
            }
        }
        
        // Error diferente a 405
        console.error(`❌ [dataLoader] Error cargando producto ${idProducto}:`, {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            baseURL: error.config?.baseURL
        });
        
        return null;
    }
};

console.log('🛠️  [dataLoader] Módulo de carga de datos inicializado');