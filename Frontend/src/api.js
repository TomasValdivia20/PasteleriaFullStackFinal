import axios from 'axios';

// Configuración de la URL base desde variable de entorno
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// ===== VALIDACIÓN DE URL =====
// Detectar configuraciones incorrectas que causan errores silenciosos
if (BASE_URL && !BASE_URL.startsWith('http://') && !BASE_URL.startsWith('https://')) {
    console.error('❌ [API CONFIG ERROR] URL malformada - falta protocolo (http:// o https://)');
    console.error('   URL actual:', BASE_URL);
    console.error('   ⚠️  Esto causará que las peticiones fallen');
    console.error('   ✅ Debe ser: https://backend.railway.app/api');
    console.error('   ❌ Incorrecto: backend.railway.app/api');
}

if (BASE_URL && !BASE_URL.includes('/api')) {
    console.warn('⚠️  [API CONFIG WARNING] URL no incluye /api');
    console.warn('   URL actual:', BASE_URL);
    console.warn('   ✅ Recomendado: https://backend.railway.app/api');
}

console.log('🔧 [API CONFIG] Inicializando cliente API con baseURL:', BASE_URL);

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Timeout de 10 segundos
});

// ===== INTERCEPTOR DE REQUEST =====
api.interceptors.request.use(
    (config) => {
        const timestamp = new Date().toISOString();
        console.log(`📤 [REQUEST] ${timestamp}`);
        console.log(`   Method: ${config.method?.toUpperCase()}`);
        console.log(`   URL: ${config.baseURL}${config.url}`);
        console.log(`   Headers:`, config.headers);
        if (config.params) {
            console.log(`   Params:`, config.params);
        }
        if (config.data) {
            console.log(`   Data:`, config.data);
        }
        
        // Agregar timestamp para medir tiempo de respuesta
        config.metadata = { startTime: Date.now() };
        
        return config;
    },
    (error) => {
        console.error('❌ [REQUEST ERROR]', error);
        return Promise.reject(error);
    }
);

// ===== INTERCEPTOR DE RESPONSE =====
api.interceptors.response.use(
    (response) => {
        const duration = Date.now() - response.config.metadata.startTime;
        const timestamp = new Date().toISOString();
        
        console.log(`📥 [RESPONSE SUCCESS] ${timestamp}`);
        console.log(`   URL: ${response.config.url}`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Duration: ${duration}ms`);
        console.log(`   Data Type: ${Array.isArray(response.data) ? 'Array' : typeof response.data}`);
        
        // ===== VALIDACIÓN DE RESPUESTA =====
        // Detectar cuando el backend responde con HTML en vez de JSON
        if (typeof response.data === 'string') {
            const trimmedData = response.data.trim();
            if (trimmedData.startsWith('<!doctype') || trimmedData.startsWith('<html')) {
                console.error('❌ [API RESPONSE ERROR] Backend respondió con HTML en vez de JSON');
                console.error('   Esto significa que la URL está apuntando al frontend, no al backend API');
                console.error('   URL solicitada:', response.config.url);
                console.error('   Base URL:', response.config.baseURL);
                console.error('   ⚠️  Posibles causas:');
                console.error('      1. VITE_API_URL no incluye /api al final');
                console.error('      2. Backend no está sirviendo la API en esa ruta');
                console.error('      3. Problema de routing en el servidor');
                
                // Lanzar error para que se maneje en el catch
                throw new Error('Backend respondió con HTML en vez de JSON. Verifica VITE_API_URL incluya /api');
            }
        }
        
        if (Array.isArray(response.data)) {
            console.log(`   Data Length: ${response.data.length} items`);
            if (response.data.length > 0) {
                console.log(`   First Item Sample:`, response.data[0]);
            }
        } else {
            console.log(`   Data:`, response.data);
        }
        
        return response;
    },
    (error) => {
        const timestamp = new Date().toISOString();
        console.error(`❌ [RESPONSE ERROR] ${timestamp}`);
        
        if (error.response) {
            // El servidor respondió con un código de error
            console.error(`   Status: ${error.response.status} ${error.response.statusText}`);
            console.error(`   URL: ${error.config?.url}`);
            console.error(`   Method: ${error.config?.method?.toUpperCase()}`);
            console.error(`   Response Data:`, error.response.data);
            console.error(`   Response Headers:`, error.response.headers);
        } else if (error.request) {
            // La petición fue hecha pero no hubo respuesta
            console.error(`   No response received`);
            console.error(`   URL: ${error.config?.url}`);
            console.error(`   Method: ${error.config?.method?.toUpperCase()}`);
            console.error(`   Request:`, error.request);
            console.error(`   ⚠️  Posibles causas:`);
            console.error(`      - Backend no está corriendo`);
            console.error(`      - Problemas de red/CORS`);
            console.error(`      - URL incorrecta: ${error.config?.baseURL}${error.config?.url}`);
        } else {
            // Algo sucedió al configurar la petición
            console.error(`   Error Message: ${error.message}`);
            console.error(`   Error Config:`, error.config);
        }
        
        return Promise.reject(error);
    }
);

console.log('✅ [API CONFIG] Cliente API configurado correctamente');

export default api;