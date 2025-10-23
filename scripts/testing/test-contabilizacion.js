/**
 * Script para probar el sistema de contabilización de consultas
 * 
 * Uso: node scripts/testing/test-contabilizacion.js
 */

require('dotenv').config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_PHONE = '+5491134070204';

console.log('\n🧪 Test del Sistema de Contabilización de Consultas\n');
console.log('='.repeat(60));

async function runTests() {
  let consultaId;

  // Test 1: Validar Límite
  console.log('\n📊 TEST 1: Validar Límite de Consultas');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(`${BASE_URL}/api/consultas/validar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: TEST_PHONE })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Validación exitosa:');
      console.log(`   Plan: ${data.plan}`);
      console.log(`   Consultas usadas: ${data.consultas_usadas}/${data.limite}`);
      console.log(`   Puede consultar: ${data.puede_consultar ? 'SÍ' : 'NO'}`);
      console.log(`   Consultas restantes: ${data.consultas_restantes}`);
    } else {
      console.log('❌ Error:', data.error || data.razon);
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }

  // Test 2: Registrar Consulta
  console.log('\n📝 TEST 2: Registrar Nueva Consulta');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(`${BASE_URL}/api/consultas/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: TEST_PHONE,
        mensaje: 'Ganaste $10,000! Haz click aquí para reclamar tu premio: https://fake-link.com',
        tipo: 'analisis_estafa'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      consultaId = data.consulta_id;
      console.log('✅ Consulta registrada:');
      console.log(`   ID: ${consultaId}`);
      console.log(`   Mensaje: ${data.message}`);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }

  // Test 3: Actualizar Consulta
  if (consultaId) {
    console.log('\n🔄 TEST 3: Actualizar Consulta con Respuesta');
    console.log('-'.repeat(60));

    const respuestaBot = `🛡️ *Análisis de Seguridad*

*Riesgo:* SÍ
*Nivel:* ALTO
*Tipo:* Phishing/Scam

*¿Por qué?*
Este mensaje tiene todas las características de una estafa:
- Promesa de dinero fácil
- Urgencia artificial
- Link sospechoso
- No proviene de fuente oficial

*Recomendación:*
🚫 NO hagas click en el link
🗑️ Elimina el mensaje
⚠️ Nunca compartas tus datos personales o bancarios`;

    try {
      const response = await fetch(`${BASE_URL}/api/consultas/actualizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consulta_id: consultaId,
          respuesta: respuestaBot,
          riesgo_detectado: true,
          nivel_riesgo: 'alto'
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Consulta actualizada:');
        console.log(`   ${data.message}`);
        console.log(`   Riesgo: ALTO`);
      } else {
        console.log('❌ Error:', data.error);
      }
    } catch (error) {
      console.log('❌ Error de conexión:', error.message);
    }
  }

  // Test 4: Verificar Conteo Actualizado
  console.log('\n📈 TEST 4: Verificar Conteo Actualizado');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(`${BASE_URL}/api/consultas/validar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: TEST_PHONE })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Conteo actualizado:');
      console.log(`   Consultas usadas: ${data.consultas_usadas}/${data.limite}`);
      console.log(`   Consultas restantes: ${data.consultas_restantes}`);
      
      if (data.consultas_restantes === 0) {
        console.log('\n⚠️  ¡LÍMITE ALCANZADO!');
        console.log('   El usuario ya no puede hacer más consultas este mes');
      }
    } else {
      console.log('❌ Error:', data.error || data.razon);
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }

  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log('\n✅ Tests completados');
  console.log('\n💡 Próximos pasos:');
  console.log('   1. Importa el workflow de n8n');
  console.log('      Archivo: zecu/docs/n8n-workflows/BOT_WHATSAPP_CON_CONTABILIZACION.json');
  console.log('   2. Configura credenciales de OpenAI y Twilio');
  console.log('   3. Activa el workflow');
  console.log('   4. Configura el webhook en Twilio');
  console.log('   5. Prueba enviando un mensaje por WhatsApp');
  console.log('\n📚 Documentación: zecu/docs/SISTEMA_CONTABILIZACION.md\n');
}

runTests().catch(console.error);

