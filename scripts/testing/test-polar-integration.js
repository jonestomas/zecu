/**
 * Script de Prueba para Integración de Polar.sh
 * 
 * Este script verifica que la integración con Polar.sh esté configurada correctamente.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

console.log('🧪 Iniciando pruebas de integración con Polar.sh...\n');

// Test 1: Verificar variables de entorno
console.log('📋 Test 1: Verificando variables de entorno...');
const requiredEnvVars = [
  'POLAR_ACCESS_TOKEN',
  'POLAR_PRICE_ID_PLUS'
];

let allEnvVarsPresent = true;
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName}: Configurado`);
  } else {
    console.log(`   ❌ ${varName}: NO CONFIGURADO`);
    allEnvVarsPresent = false;
  }
});

if (!allEnvVarsPresent) {
  console.log('\n⚠️  Algunas variables de entorno faltan.');
  console.log('   Para probar sin configuración real, continuamos con valores de prueba.\n');
}

// Test 2: Verificar que el servidor esté corriendo
console.log('📋 Test 2: Verificando que el servidor esté corriendo...');
fetch(`${BASE_URL}/api/auth/check-session`)
  .then(response => {
    if (response.ok) {
      console.log(`   ✅ Servidor corriendo en ${BASE_URL}\n`);
      return true;
    } else {
      console.log(`   ⚠️  Servidor respondió con código ${response.status}\n`);
      return false;
    }
  })
  .catch(error => {
    console.log(`   ❌ Error conectando al servidor: ${error.message}`);
    console.log(`   💡 Asegúrate de que el servidor esté corriendo con: pnpm dev\n`);
    process.exit(1);
  })
  .then((serverOk) => {
    if (!serverOk) return;

    // Test 3: Información sobre el flujo de prueba manual
    console.log('📋 Test 3: Flujo de prueba manual');
    console.log('   Para probar la integración completa:');
    console.log('   1. Abre tu navegador en: ' + BASE_URL);
    console.log('   2. Inicia sesión con tu usuario');
    console.log('   3. Click en "Suscribirme ahora"');
    console.log('   4. Serás redirigido al checkout de Polar.sh\n');

    if (allEnvVarsPresent) {
      console.log('✅ Integración configurada correctamente!');
      console.log('   Puedes proceder a hacer una prueba real.\n');
    } else {
      console.log('⚠️  Configuración incompleta.');
      console.log('   Necesitas configurar las variables de entorno en .env.local:\n');
      console.log('   POLAR_ACCESS_TOKEN=polar_at_xxxxxxxxxxxxx');
      console.log('   POLAR_PRICE_ID_PLUS=price_xxxxxxxxxxxxx');
      console.log('   POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx\n');
      console.log('   Consulta: docs/POLAR_SETUP_GUIDE.md\n');
    }

    // Mostrar tarjeta de prueba
    console.log('💳 Tarjeta de Prueba de Polar.sh:');
    console.log('   Número: 4242 4242 4242 4242');
    console.log('   Vencimiento: Cualquier fecha futura (ej: 12/25)');
    console.log('   CVV: Cualquier 3 dígitos (ej: 123)');
    console.log('   Código Postal: Cualquier 5 dígitos (ej: 12345)\n');

    console.log('🎯 URL de Prueba: ' + BASE_URL);
  });

