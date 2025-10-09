#!/usr/bin/env node

/**
 * Script de testing para flujos de login y suscripción
 * Uso: node scripts/testing/test-flows.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function header(text) {
  log('\n' + '='.repeat(70), COLORS.cyan);
  log(`  ${text}`, COLORS.bright + COLORS.cyan);
  log('='.repeat(70) + '\n', COLORS.cyan);
}

function section(text) {
  log(`\n${text}`, COLORS.yellow);
  log('-'.repeat(text.length), COLORS.yellow);
}

function success(text) {
  log(`✅ ${text}`, COLORS.green);
}

function info(text) {
  log(`ℹ️  ${text}`, COLORS.blue);
}

function warning(text) {
  log(`⚠️  ${text}`, COLORS.yellow);
}

function error(text) {
  log(`❌ ${text}`, COLORS.red);
}

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function showMenu() {
  header('🧪 TESTING DE FLUJOS - ZECU');

  log('Selecciona el caso de prueba:\n');

  log('CAMINO 1: Login directo', COLORS.bright);
  log('  1. Usuario nuevo → Plan Free');
  log('  2. Usuario nuevo → Plan Plus');
  log('  3. Usuario existente sin plan');
  log('  4. Usuario existente con plan activo\n');

  log('CAMINO 2: Suscripción desde Landing', COLORS.bright);
  log('  5. Usuario NO autenticado → Free desde landing');
  log('  6. Usuario NO autenticado → Plus desde landing');
  log('  7. Usuario autenticado → Free desde landing');
  log('  8. Usuario autenticado → Plus desde landing\n');

  log('UTILIDADES', COLORS.bright);
  log('  9. Generar teléfono de prueba');
  log('  10. Ver queries SQL útiles');
  log('  11. Ver comandos de debugging');
  log('  0. Salir\n');

  const choice = await question('Ingresa el número de la opción: ');
  return choice.trim();
}

async function testCase1() {
  header('Caso 1.1: Usuario nuevo → Plan Free');

  const phone = Math.floor(Math.random() * 900000000 + 1100000000);
  info(`Teléfono de prueba: +54${phone}`);

  section('Paso 1: Ir a login');
  log('URL: http://localhost:3000/login');
  await question('\nPresiona ENTER cuando estés en la página de login...');

  section('Paso 2: Ingresar teléfono');
  log(`Código de país: +54`);
  log(`Teléfono: ${phone}`);
  log(`Click "Enviar código"`);
  await question('\nPresiona ENTER cuando hayas enviado el código...');

  section('Paso 3: Ver código OTP en la terminal del servidor');
  warning('Busca en la terminal del servidor (donde corre npm run dev):');
  log(`📱 [DESARROLLO] Código OTP para +54${phone}: XXXXXX`);
  const otp = await question('\nIngresa el código OTP que apareció: ');

  section('Paso 4: Ingresar código OTP');
  log(`Código: ${otp}`);
  log(`Click "Verificar"`);
  await question('\nPresiona ENTER cuando hayas verificado...');

  section('Paso 5: Completar perfil');
  log('Nombre: Test User');
  log('País: Argentina');
  log('Ciudad: Buenos Aires');
  log('Click "Continuar"');
  await question('\nPresiona ENTER cuando hayas completado el perfil...');

  section('Paso 6: Seleccionar plan Free');
  log('Click "Comenzar gratis"');
  await question('\nPresiona ENTER cuando hayas seleccionado Free...');

  section('Paso 7: Verificar redirect a /welcome');
  const url = await question('¿Cuál es la URL actual? ');
  
  if (url.includes('/welcome')) {
    success('✓ URL correcta: /welcome');
  } else {
    error('✗ URL incorrecta. Esperada: /welcome, Actual: ' + url);
  }

  const showsName = await question('¿Muestra "¡Bienvenido, Test User!"? (s/n): ');
  if (showsName.toLowerCase() === 's') {
    success('✓ Muestra nombre correcto');
  } else {
    error('✗ No muestra el nombre correctamente');
  }

  const showsPlan = await question('¿Muestra "Plan Free"? (s/n): ');
  if (showsPlan.toLowerCase() === 's') {
    success('✓ Muestra plan correcto');
  } else {
    error('✗ No muestra el plan correctamente');
  }

  section('Verificación en Supabase');
  log('Ejecuta esta query en Supabase SQL Editor:');
  log(`\nSELECT * FROM users WHERE phone = '+54${phone}';\n`, COLORS.cyan);
  log('Debería mostrar:');
  log('  - name: Test User');
  log('  - country: Argentina');
  log('  - city: Buenos Aires');
  log('  - plan: free');
  log('  - plan_expires_at: NULL\n');

  await question('Presiona ENTER para continuar...');

  header('✅ Caso 1.1 completado');
}

async function testCase2() {
  header('Caso 1.2: Usuario nuevo → Plan Plus');
  warning('Este caso requiere completar un pago en Mercado Pago.');
  warning('Asegúrate de tener la tarjeta de prueba lista:');
  log('\nTarjeta de prueba APROBADA:');
  log('  Número: 5031 7557 3453 0604');
  log('  CVV: 123');
  log('  Fecha: 11/25');
  log('  Titular: APRO');
  log('  DNI: 12345678\n');

  const confirm = await question('¿Quieres continuar? (s/n): ');
  if (confirm.toLowerCase() !== 's') {
    info('Test cancelado');
    return;
  }

  info('Sigue los mismos pasos que el Caso 1.1, pero en el paso 6:');
  log('  - Selecciona "Comenzar con Mercado Pago" en lugar de Free');
  log('  - Completa el pago en Mercado Pago');
  log('  - Simula el webhook manualmente\n');

  section('Simulación del webhook');
  log('Después de completar el pago, copia el PAYMENT_ID de la URL:');
  log('  /payment/success?payment_id=XXXXXXXX\n');

  const paymentId = await question('Ingresa el PAYMENT_ID: ');

  log('\nEjecuta este comando en otra terminal:\n', COLORS.cyan);
  log(`curl http://localhost:3000/api/webhooks/mercadopago \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"type":"payment","data":{"id":${paymentId}}}'`, COLORS.cyan);

  await question('\nPresiona ENTER después de ejecutar el webhook...');

  success('Si todo funcionó, deberías ver el plan Plus activado en Supabase');
}

function showSQLQueries() {
  header('📊 Queries SQL Útiles');

  section('Ver todos los usuarios');
  log(`SELECT 
  phone, 
  name, 
  plan, 
  plan_expires_at, 
  created_at 
FROM users 
ORDER BY created_at DESC;`, COLORS.cyan);

  section('Ver códigos OTP recientes');
  log(`SELECT 
  phone, 
  code, 
  expires_at, 
  verified,
  created_at 
FROM otp_codes 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;`, COLORS.cyan);

  section('Limpiar usuario de prueba');
  log(`DELETE FROM users WHERE phone = '+541112345678';
DELETE FROM otp_codes WHERE phone = '+541112345678';`, COLORS.cyan);

  section('Expirar plan Plus de un usuario');
  log(`UPDATE users 
SET plan_expires_at = NOW() - INTERVAL '1 day'
WHERE phone = '+541112345678';`, COLORS.cyan);
}

function showDebuggingCommands() {
  header('🔧 Comandos de Debugging');

  section('Verificar sesión (en consola del navegador)');
  log(`fetch('/api/auth/check-session')
  .then(r => r.json())
  .then(console.log)`, COLORS.cyan);

  section('Ver pendingPurchase');
  log(`console.log(JSON.parse(sessionStorage.getItem('pendingPurchase')))`, COLORS.cyan);

  section('Limpiar sesión');
  log(`// Limpiar sessionStorage
sessionStorage.clear()

// Limpiar cookies
document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"

// Recargar
location.reload()`, COLORS.cyan);

  section('Simular webhook de Mercado Pago');
  log(`curl http://localhost:3000/api/webhooks/mercadopago \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"type":"payment","data":{"id":PAYMENT_ID}}'`, COLORS.cyan);
}

function generateTestPhone() {
  const phone = Math.floor(Math.random() * 900000000 + 1100000000);
  success(`Teléfono de prueba generado: +54${phone}`);
  log(`\nUsa este teléfono en tus pruebas. Es único y no debería existir en la DB.`);
}

async function main() {
  try {
    while (true) {
      const choice = await showMenu();

      switch(choice) {
        case '1':
          await testCase1();
          break;
        case '2':
          await testCase2();
          break;
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
          warning(`Caso ${choice} no implementado aún. Consulta docs/TESTING_FLOWS_GUIDE.md`);
          await question('\nPresiona ENTER para continuar...');
          break;
        case '9':
          generateTestPhone();
          await question('\nPresiona ENTER para continuar...');
          break;
        case '10':
          showSQLQueries();
          await question('\nPresiona ENTER para continuar...');
          break;
        case '11':
          showDebuggingCommands();
          await question('\nPresiona ENTER para continuar...');
          break;
        case '0':
          log('\n¡Hasta luego! 👋\n', COLORS.green);
          rl.close();
          process.exit(0);
        default:
          error('Opción inválida');
          await question('\nPresiona ENTER para continuar...');
      }
    }
  } catch (err) {
    error('Error: ' + err.message);
    rl.close();
    process.exit(1);
  }
}

// Ejecutar
main();

