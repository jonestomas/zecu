#!/usr/bin/env node

/**
 * Script para verificar variables de entorno
 * Uso: node scripts/check-env.js
 */

require('dotenv').config({ path: '.env.local' });

const requiredVars = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'URL de tu proyecto en Supabase',
    example: 'https://abc123.supabase.co',
    required: true
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Service Role Key de Supabase (secret)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true
  },
  {
    name: 'JWT_SECRET',
    description: 'Secreto para firmar tokens JWT',
    example: '5f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c...',
    required: true
  },
  {
    name: 'MERCADOPAGO_ACCESS_TOKEN',
    description: 'Access Token de Mercado Pago (TEST para desarrollo)',
    example: 'TEST-1234567890123456-100000-abcdef...',
    required: true
  },
  {
    name: 'NEXT_PUBLIC_BASE_URL',
    description: 'URL base de tu aplicación',
    example: 'http://localhost:3000',
    required: true
  },
  {
    name: 'N8N_WEBHOOK_SEND_OTP_URL',
    description: 'URL del webhook de n8n para enviar OTP (opcional en dev)',
    example: 'https://tu-n8n.com/webhook/send-otp',
    required: false
  }
];

console.log('\n🔍 Verificando Variables de Entorno...\n');

let allGood = true;
let warnings = [];

requiredVars.forEach(varInfo => {
  const value = process.env[varInfo.name];
  const isSet = value && value.trim() !== '';
  
  if (isSet) {
    const preview = value.length > 50 
      ? value.substring(0, 47) + '...' 
      : value;
    console.log(`✅ ${varInfo.name}`);
    console.log(`   ${preview}`);
  } else {
    if (varInfo.required) {
      console.log(`❌ ${varInfo.name} - FALTA (REQUERIDA)`);
      console.log(`   ${varInfo.description}`);
      console.log(`   Ejemplo: ${varInfo.example}`);
      allGood = false;
    } else {
      console.log(`⚠️  ${varInfo.name} - No configurada (opcional)`);
      console.log(`   ${varInfo.description}`);
      warnings.push(varInfo);
    }
  }
  console.log('');
});

console.log('─'.repeat(70));

if (allGood) {
  console.log('\n✅ ¡Todas las variables requeridas están configuradas!\n');
  
  if (warnings.length > 0) {
    console.log('📝 Variables opcionales no configuradas:');
    warnings.forEach(w => {
      console.log(`   - ${w.name}: ${w.description}`);
    });
    console.log('');
  }
  
  console.log('🚀 Puedes iniciar el servidor con: npm run dev\n');
} else {
  console.log('\n❌ Faltan variables requeridas. Por favor configúralas en .env.local\n');
  console.log('📖 Guía completa: docs/ENVIRONMENT_VARIABLES.md');
  console.log('🧪 Guía de testing: docs/TESTING_GUIDE_DEV.md\n');
  process.exit(1);
}

