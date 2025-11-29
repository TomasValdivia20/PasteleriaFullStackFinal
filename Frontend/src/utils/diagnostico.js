/**
 * 🔍 Script de Diagnóstico de Conectividad API
 * 
 * Este script verifica la conexión entre el frontend y el backend
 * Ejecuta esto en la consola del navegador para diagnosticar problemas
 */

export const diagnosticarConexion = async () => {
  console.log('🔍 ========================================');
  console.log('🔍 DIAGNÓSTICO DE CONEXIÓN API');
  console.log('🔍 ========================================\n');

  const API_URL = import.meta.env.VITE_API_URL || 'http://98.92.85.200:8080/api';
  
  console.log('📋 Configuración:');
  console.log(`   VITE_API_URL: ${import.meta.env.VITE_API_URL}`);
  console.log(`   BASE_URL: ${import.meta.env.BASE_URL}`);
  console.log(`   MODE: ${import.meta.env.MODE}`);
  console.log(`   DEV: ${import.meta.env.DEV}`);
  console.log(`   PROD: ${import.meta.env.PROD}`);
  console.log(`   API URL final: ${API_URL}\n`);

  // Test 1: Verificar que la URL sea accesible
  console.log('🧪 Test 1: Verificando accesibilidad de la API...');
  try {
    const response = await fetch(`${API_URL}/categorias`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Respuesta recibida:');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Datos recibidos: ${data.length} categorías`);
      console.log('   Primera categoría:', data[0]);
    } else {
      console.error(`❌ Error HTTP: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error al conectar con la API:');
    console.error(`   Tipo: ${error.name}`);
    console.error(`   Mensaje: ${error.message}`);
    
    if (error.message.includes('CORS')) {
      console.error('\n⚠️  ERROR CORS DETECTADO');
      console.error('   El backend no tiene configurado CORS correctamente');
      console.error('   Revisa: CONFIGURACION_CORS_AWS.md');
    } else if (error.message.includes('Failed to fetch')) {
      console.error('\n⚠️  ERROR DE CONEXIÓN');
      console.error('   Posibles causas:');
      console.error('   1. El backend no está corriendo');
      console.error('   2. La URL es incorrecta');
      console.error('   3. El puerto no está abierto en AWS');
      console.error('   4. Problemas de red');
    }
  }

  // Test 2: Verificar endpoints
  console.log('\n🧪 Test 2: Verificando endpoints disponibles...');
  const endpoints = [
    '/categorias',
    '/productos',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: ${data.length} items`);
      } else {
        console.error(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ ${endpoint}: ${error.message}`);
    }
  }

  // Test 3: Verificar CORS headers
  console.log('\n🧪 Test 3: Verificando CORS headers...');
  try {
    const response = await fetch(`${API_URL}/categorias`);
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    };

    if (corsHeaders['Access-Control-Allow-Origin']) {
      console.log('✅ CORS configurado correctamente');
      console.log('   Headers CORS:', corsHeaders);
    } else {
      console.warn('⚠️  CORS headers no encontrados');
      console.warn('   El backend podría no tener CORS configurado');
    }
  } catch (error) {
    console.error('❌ No se pudieron verificar CORS headers:', error.message);
  }

  console.log('\n🔍 ========================================');
  console.log('🔍 FIN DEL DIAGNÓSTICO');
  console.log('🔍 ========================================\n');

  console.log('💡 Siguiente paso:');
  console.log('   Si hay errores, revisa CONFIGURACION_CORS_AWS.md');
  console.log('   para instrucciones de configuración del backend.\n');
};

// Para usar en la consola del navegador:
// import { diagnosticarConexion } from './utils/diagnostico.js';
// diagnosticarConexion();

export default diagnosticarConexion;
