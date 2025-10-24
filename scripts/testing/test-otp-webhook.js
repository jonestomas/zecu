/**
 * Script para probar el webhook de n8n de envío de OTP
 * 
 * Uso:
 *   node scripts/testing/test-otp-webhook.js
 * 
 * Requisitos:
 *   - n8n con el workflow de OTP activo
 *   - N8N_WEBHOOK_SEND_OTP_URL configurada en .env.local
 */

require('dotenv').config({ path: '.env.local' });

const WEBHOOK_URL = process.env.N8N_WEBHOOK_SEND_OTP_URL;
const TEST_PHONE = process.env.TEST_PHONE || '+5491134070204';
const TEST_CODE = '999999'; // Código de prueba

async function testOTPWebhook() {
  console.log('\n🧪 Test de Webhook de OTP\n');
  console.log('━'.repeat(50));
  
  // Verificar que la URL esté configurada
  if (!WEBHOOK_URL) {
    console.error('❌ ERROR: N8N_WEBHOOK_SEND_OTP_URL no está configurada en .env.local');
    console.log('\n💡 Pasos para configurar:');
    console.log('1. Importa el workflow en n8n (zecu/docs/n8n-workflows/SEND_OTP_WORKFLOW.json)');
    console.log('2. Activa el workflow en n8n');
    console.log('3. Copia la Production URL del webhook');
    console.log('4. Agrégala a .env.local como N8N_WEBHOOK_SEND_OTP_URL');
    console.log('5. Reinicia el servidor de Next.js\n');
    process.exit(1);
  }
  
  console.log(`📡 URL del webhook: ${WEBHOOK_URL}`);
  console.log(`📱 Teléfono de prueba: ${TEST_PHONE}`);
  console.log(`🔢 Código de prueba: ${TEST_CODE}`);
  console.log('━'.repeat(50));
  
  // Preparar payload
  const payload = {
    phone: TEST_PHONE,
    code: TEST_CODE,
    name: 'Usuario de Prueba'
  };
  
  console.log('\n📤 Enviando request al webhook...\n');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    console.log('━'.repeat(50));
    console.log('📥 Respuesta recibida:\n');
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    console.log('━'.repeat(50));
    
    if (response.ok && data.success) {
      console.log('\n✅ ¡Test exitoso!');
      console.log(`\n📱 Verifica tu WhatsApp (${TEST_PHONE})`);
      console.log('Deberías recibir un mensaje con el código: ' + TEST_CODE);
      console.log('\n💡 Si no recibes el mensaje:');
      console.log('  - Verifica que el número esté registrado en Twilio (si usas Trial)');
      console.log('  - Revisa las ejecuciones en n8n para ver errores');
      console.log('  - Verifica que las credenciales de Twilio sean correctas');
    } else {
      console.log('\n⚠️ El webhook respondió pero con error');
      console.log('Revisa los detalles arriba y las ejecuciones en n8n');
    }
    
  } catch (error) {
    console.log('━'.repeat(50));
    console.error('\n❌ Error al conectar con el webhook:\n');
    console.error(error.message);
    console.log('\n💡 Posibles causas:');
    console.log('  1. n8n no está corriendo');
    console.log('  2. El workflow no está activo');
    console.log('  3. La URL del webhook es incorrecta');
    console.log('  4. Firewall bloqueando la conexión');
    console.log('\nVerifica:');
    console.log('  - n8n esté corriendo (ej: http://localhost:5678)');
    console.log('  - El workflow "Zecubot - Enviar OTP por WhatsApp" esté ACTIVO');
    console.log('  - La URL en .env.local sea la Production URL (sin -test)');
  }
  
  console.log('\n');
}

// Ejecutar test
testOTPWebhook().catch(console.error);
