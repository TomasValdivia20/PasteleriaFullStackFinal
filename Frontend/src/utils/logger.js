/**
 * Logger Service - Sistema centralizado de logging para Frontend
 * 
 * Niveles de log:
 * - debug: Información detallada para debugging (solo desarrollo)
 * - info: Información general (peticiones API, navegación, etc.)
 * - warn: Advertencias que no rompen funcionalidad
 * - error: Errores que afectan funcionalidad
 * 
 * Características:
 * - Formateo consistente con timestamp y contexto
 * - Filtrado por nivel según entorno (dev/prod)
 * - Envío de logs a backend en producción
 * - Integración con axios interceptors
 * - Correlation ID para rastrear requests
 * 
 * Uso:
 * import logger from '@/utils/logger'
 * 
 * logger.info('Producto cargado', { productoId: 1, nombre: 'Torta' })
 * logger.error('Error cargando productos', error)
 * logger.warn('Variantes vacías', { productoId: 1 })
 */

// Niveles de log (orden de severidad)
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Nivel mínimo según entorno
const MIN_LOG_LEVEL = import.meta.env.MODE === 'production' ? LogLevel.INFO : LogLevel.DEBUG;

// Configuración
const config = {
  // Enviar logs a backend solo en producción
  sendToBackend: import.meta.env.MODE === 'production',
  
  // URL backend para envío de logs
  backendUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  
  // Buffer de logs antes de enviar (evitar flood)
  batchSize: 10,
  batchTimeout: 5000, // 5 segundos
  
  // Logs locales en desarrollo
  consoleOutput: import.meta.env.MODE !== 'production',
  
  // Incluir stack trace completo
  includeStackTrace: import.meta.env.MODE !== 'production'
};

// Buffer para batch de logs
let logBuffer = [];
let batchTimer = null;

/**
 * Clase Logger principal
 */
class Logger {
  constructor() {
    this.correlationId = this.generateCorrelationId();
    this.sessionStart = new Date().toISOString();
  }

  /**
   * Genera correlation ID único para sesión
   */
  generateCorrelationId() {
    return Math.random().toString(36).substring(2, 10);
  }

  /**
   * Formatea timestamp legible
   */
  formatTimestamp() {
    const now = new Date();
    return now.toISOString().substring(11, 23); // HH:mm:ss.SSS
  }

  /**
   * Formatea mensaje de log con contexto
   */
  formatLogMessage(level, category, message, context = {}) {
    const timestamp = this.formatTimestamp();
    const levelStr = Object.keys(LogLevel).find(key => LogLevel[key] === level);
    
    return {
      timestamp: new Date().toISOString(),
      level: levelStr,
      category,
      message,
      context,
      correlationId: this.correlationId,
      sessionStart: this.sessionStart,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  /**
   * Log a consola (desarrollo)
   */
  logToConsole(level, category, message, context, error) {
    if (!config.consoleOutput) return;

    const timestamp = this.formatTimestamp();
    const emoji = this.getEmojiForLevel(level);
    const style = this.getStyleForLevel(level);
    
    const prefix = `%c${emoji} [${timestamp}] [${category}]`;
    
    console.groupCollapsed(prefix, style, message);
    
    if (Object.keys(context).length > 0) {
      console.log('📋 Context:', context);
    }
    
    if (error) {
      console.error('❌ Error:', error);
      if (config.includeStackTrace && error.stack) {
        console.log('📚 Stack:', error.stack);
      }
    }
    
    console.log('🔗 Correlation ID:', this.correlationId);
    console.groupEnd();
  }

  /**
   * Envía logs a backend (producción)
   */
  async sendToBackend(logEntry) {
    if (!config.sendToBackend) return;

    // Agregar a buffer
    logBuffer.push(logEntry);

    // Enviar inmediatamente si es ERROR
    if (logEntry.level === 'ERROR') {
      this.flushLogs();
      return;
    }

    // Enviar si buffer lleno
    if (logBuffer.length >= config.batchSize) {
      this.flushLogs();
      return;
    }

    // Enviar después de timeout
    if (!batchTimer) {
      batchTimer = setTimeout(() => {
        this.flushLogs();
      }, config.batchTimeout);
    }
  }

  /**
   * Envía buffer de logs al backend
   */
  async flushLogs() {
    if (logBuffer.length === 0) return;

    const logsToSend = [...logBuffer];
    logBuffer = [];
    
    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }

    try {
      await fetch(`${config.backendUrl}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logs: logsToSend })
      });
    } catch (error) {
      // Falla silenciosamente para evitar loop infinito
      console.error('[Logger] Failed to send logs to backend:', error);
    }
  }

  /**
   * Emoji según nivel
   */
  getEmojiForLevel(level) {
    switch (level) {
      case LogLevel.DEBUG: return '🐛';
      case LogLevel.INFO: return '📘';
      case LogLevel.WARN: return '⚠️';
      case LogLevel.ERROR: return '🔴';
      default: return '📝';
    }
  }

  /**
   * Estilo consola según nivel
   */
  getStyleForLevel(level) {
    switch (level) {
      case LogLevel.DEBUG: return 'color: #888; font-weight: normal;';
      case LogLevel.INFO: return 'color: #2196F3; font-weight: bold;';
      case LogLevel.WARN: return 'color: #FF9800; font-weight: bold;';
      case LogLevel.ERROR: return 'color: #F44336; font-weight: bold;';
      default: return 'color: #000;';
    }
  }

  /**
   * Método genérico de logging
   */
  log(level, category, message, context = {}, error = null) {
    // Filtrar por nivel
    if (level < MIN_LOG_LEVEL) return;

    // Formatear log
    const logEntry = this.formatLogMessage(level, category, message, context);
    
    // Agregar error si existe
    if (error) {
      logEntry.error = {
        message: error.message,
        name: error.name,
        stack: config.includeStackTrace ? error.stack : undefined
      };
    }

    // Log a consola
    this.logToConsole(level, category, message, context, error);

    // Enviar a backend
    this.sendToBackend(logEntry);
  }

  /**
   * Métodos públicos por nivel
   */
  debug(message, context = {}) {
    this.log(LogLevel.DEBUG, 'DEBUG', message, context);
  }

  info(message, context = {}) {
    this.log(LogLevel.INFO, 'INFO', message, context);
  }

  warn(message, context = {}) {
    this.log(LogLevel.WARN, 'WARNING', message, context);
  }

  error(message, error = null, context = {}) {
    this.log(LogLevel.ERROR, 'ERROR', message, context, error);
  }

  /**
   * Métodos específicos por categoría
   */
  
  // API calls
  api(method, url, status, data = {}) {
    this.info(`API ${method} ${url}`, { 
      method, 
      url, 
      status,
      ...data 
    });
  }

  apiError(method, url, error, response = null) {
    this.error(`API ${method} ${url} failed`, error, {
      method,
      url,
      status: response?.status,
      data: response?.data
    });
  }

  // Carrito
  carrito(action, context = {}) {
    this.info(`Carrito: ${action}`, context);
  }

  // Autenticación
  auth(action, context = {}) {
    this.info(`Auth: ${action}`, context);
  }

  // Navegación
  navigation(to, from = null) {
    this.debug('Navegación', { to, from });
  }

  // Variantes (debug específico)
  variantes(productoId, count, variantes = []) {
    if (count === 0) {
      this.warn('Variantes vacías detectadas', { 
        productoId, 
        count,
        variantesLength: variantes.length 
      });
    } else {
      this.debug('Variantes cargadas', { 
        productoId, 
        count,
        variantes: variantes.map(v => ({ id: v.id, nombre: v.nombre }))
      });
    }
  }
}

// Instancia singleton
const logger = new Logger();

// Exportar como default
export default logger;

// Exportar niveles para uso externo
export { LogLevel };
