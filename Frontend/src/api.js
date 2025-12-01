import axios from 'axios';
import logger from './utils/logger';

// Configuración de la URL base desde variable de entorno
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// ===== VALIDACIÓN DE URL =====
// Detectar configuraciones incorrectas que causan errores silenciosos
if (BASE_URL && !BASE_URL.startsWith('http://') && !BASE_URL.startsWith('https://')) {
    logger.error('URL malformada - falta protocolo', null, {
        url: BASE_URL,
        expected: 'https://backend.railway.app/api',
        invalid: 'backend.railway.app/api'
    });
}

if (BASE_URL && !BASE_URL.includes('/api')) {
    logger.warn('URL no incluye /api', {
        url: BASE_URL,
        recommended: 'https://backend.railway.app/api'
    });
}

logger.info('Cliente API inicializado', { baseURL: BASE_URL });

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
        // 🔐 AGREGAR TOKEN JWT SI EXISTE
        const usuarioData = localStorage.getItem('usuario');
        if (usuarioData) {
            try {
                const usuario = JSON.parse(usuarioData);
                if (usuario.token) {
                    config.headers.Authorization = `Bearer ${usuario.token}`;
                }
            } catch (error) {
                logger.error('Error parseando usuario de localStorage', error);
            }
        }
        
        // Agregar correlation ID para rastrear request
        config.headers['X-Correlation-ID'] = logger.correlationId;
        
        // Timestamp para medir duración
        config.metadata = { startTime: Date.now() };
        
        // Log request
        logger.api(
            config.method?.toUpperCase() || 'GET',
            `${config.baseURL}${config.url}`,
            'REQUEST',
            {
                params: config.params,
                hasAuth: !!config.headers.Authorization
            }
        );
        
        return config;
    },
    (error) => {
        logger.error('Error en request interceptor', error);
        return Promise.reject(error);
    }
);

// ===== INTERCEPTOR DE RESPONSE =====
api.interceptors.response.use(
    (response) => {
        const duration = Date.now() - response.config.metadata.startTime;
        
        // Log response exitoso
        logger.api(
            response.config.method?.toUpperCase() || 'GET',
            response.config.url,
            response.status,
            {
                duration: `${duration}ms`,
                dataType: Array.isArray(response.data) ? 'Array' : typeof response.data,
                dataSize: Array.isArray(response.data) ? response.data.length : undefined
            }
        );
        
        // ===== VALIDACIÓN DE RESPUESTA =====
        // Detectar cuando el backend responde con HTML en vez de JSON
        if (typeof response.data === 'string') {
            const trimmedData = response.data.trim();
            if (trimmedData.startsWith('<!doctype') || trimmedData.startsWith('<html')) {
                logger.error('Backend respondió con HTML en vez de JSON', null, {
                    url: response.config.url,
                    baseURL: response.config.baseURL,
                    causes: [
                        'VITE_API_URL no incluye /api al final',
                        'Backend no está sirviendo la API en esa ruta',
                        'Problema de routing en el servidor'
                    ]
                });
                
                throw new Error('Backend respondió con HTML en vez de JSON. Verifica VITE_API_URL incluya /api');
            }
        }
        
        // Log data sample si es array
        if (Array.isArray(response.data) && response.data.length > 0) {
            logger.debug('Response data sample', {
                length: response.data.length,
                firstItem: response.data[0]
            });
        }
        
        return response;
    },
    (error) => {
        if (error.response) {
            // El servidor respondió con un código de error
            logger.apiError(
                error.config?.method?.toUpperCase() || 'UNKNOWN',
                error.config?.url || 'UNKNOWN',
                error,
                {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    headers: error.response.headers
                }
            );
        } else if (error.request) {
            // La petición fue hecha pero no hubo respuesta
            logger.error('No se recibió respuesta del servidor', error, {
                url: `${error.config?.baseURL}${error.config?.url}`,
                method: error.config?.method?.toUpperCase(),
                causes: [
                    'Backend no está corriendo',
                    'Problemas de red/CORS',
                    'URL incorrecta'
                ]
            });
        } else {
            // Algo sucedió al configurar la petición
            logger.error('Error configurando request', error, {
                message: error.message,
                config: error.config
            });
        }
        
        return Promise.reject(error);
    }
);

console.log('✅ [API CONFIG] Cliente API configurado correctamente');

export default api;