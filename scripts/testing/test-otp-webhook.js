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
  console.warn('\n🧪 Test de Webhook de OTP\n');
  console.warn('━'.repeat(50));

  // Verificar que la URL esté configurada
  if (!WEBHOOK_URL) {
    console.error('❌ ERROR: N8N_WEBHOOK_SEND_OTP_URL no está configurada en .env.local');
    console.warn('\n💡 Pasos para configurar:');
    console.warn('1. Importa el workflow en n8n (zecu/docs/n8n-workflows/SEND_OTP_WORKFLOW.json)');
    console.warn('2. Activa el workflow en n8n');
    console.warn('3. Copia la Production URL del webhook');
    console.warn('4. Agrégala a .env.local como N8N_WEBHOOK_SEND_OTP_URL');
    console.warn('5. Reinicia el servidor de Next.js\n');
    process.exit(1);
  }

  console.warn(`📡 URL del webhook: ${WEBHOOK_URL}`);
  console.warn(`📱 Teléfono de prueba: ${TEST_PHONE}`);
  console.warn(`🔢 Código de prueba: ${TEST_CODE}`);
  console.warn('━'.repeat(50));

  // Preparar payload
  const payload = {
    phone: TEST_PHONE,
    code: TEST_CODE,
    name: 'Usuario de Prueba',
  };

  console.warn('\n📤 Enviando _request al webhook...\n');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.warn('━'.repeat(50));
    console.warn('📥 Respuesta recibida:\n');
    console.warn(`Status: ${response.status} ${response.statusText}`);
    console.warn(`Response:`, JSON.stringify(data, null, 2));
    console.warn('━'.repeat(50));

    if (response.ok && data.success) {
      console.warn('\n✅ ¡Test exitoso!');
      console.warn(`\n📱 Verifica tu WhatsApp (${TEST_PHONE})`);
      console.warn(`Deberías recibir un mensaje con el código: ${TEST_CODE}`);
      console.warn('\n💡 Si no recibes el mensaje:');
      console.warn('  - Verifica que el número esté registrado en Twilio (si usas Trial)');
      console.warn('  - Revisa las ejecuciones en n8n para ver errores');
      console.warn('  - Verifica que las credenciales de Twilio sean correctas');
    } else {
      console.warn('\n⚠️ El webhook respondió pero con error');
      console.warn('Revisa los detalles arriba y las ejecuciones en n8n');
    }
  } catch (error) {
    console.warn('━'.repeat(50));
    console.error('\n❌ Error al conectar con el webhook:\n');
    console.error(error.message);
    console.warn('\n💡 Posibles causas:');
    console.warn('  1. n8n no está corriendo');
    console.warn('  2. El workflow no está activo');
    console.warn('  3. La URL del webhook es incorrecta');
    console.warn('  4. Firewall bloqueando la conexión');
    console.warn('\nVerifica:');
    console.warn('  - n8n esté corriendo (ej: http://localhost:5678)');
    console.warn('  - El workflow "Zecubot - Enviar OTP por WhatsApp" esté ACTIVO');
    console.warn('  - La URL en .env.local sea la Production URL (sin -test)');
  }

  console.warn('\n');
}

// Ejecutar test
testOTPWebhook().catch(console.error);
