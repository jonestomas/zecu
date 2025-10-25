#!/usr/bin/env node

/**
 * Script para verificar variables de entorno
 * Uso: node scripts/check-env.js
 */

require('dotenv').config({ path: '.env.local' });

const _requiredVars = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'URL de tu proyecto en Supabase',
    example: 'https://abc123.supabase.co',
    required: true,
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Service Role Key de Supabase (secret)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  },
  {
    name: 'JWT_SECRET',
    description: 'Secreto para firmar tokens JWT',
    example: '5f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c...',
    required: true,
  },
  {
    name: 'MERCADOPAGO_ACCESS_TOKEN',
    description: 'Access Token de Mercado Pago (TEST para desarrollo)',
    example: 'TEST-1234567890123456-100000-abcdef...',
    required: true,
  },
  {
    name: 'NEXT_PUBLIC_BASE_URL',
    description: 'URL base de tu aplicación',
    example: 'http://localhost:3000',
    required: true,
  },
  {
    name: 'N8N_WEBHOOK_SEND_OTP_URL',
    description: 'URL del webhook de n8n para enviar OTP (opcional en dev)',
    example: 'https://tu-n8n.com/webhook/send-otp',
    required: false,
  },
];

console.warn('\n🔍 Verificando Variables de Entorno...\n');

let allGood = true;
const warnings = [];

requiredVars.forEach(varInfo => {
  const value = process.env[varInfo.name];
  const isSet = value && value.trim() !== '';

  if (isSet) {
    const preview = value.length > 50 ? `${value.substring(0, 47)}...` : value;
    console.warn(`✅ ${varInfo.name}`);
    console.warn(`   ${preview}`);
  } else {
    if (varInfo.required) {
      console.warn(`❌ ${varInfo.name} - FALTA (REQUERIDA)`);
      console.warn(`   ${varInfo.description}`);
      console.warn(`   Ejemplo: ${varInfo.example}`);
      allGood = false;
    } else {
      console.warn(`⚠️  ${varInfo.name} - No configurada (opcional)`);
      console.warn(`   ${varInfo.description}`);
      warnings.push(varInfo);
    }
  }
  console.warn('');
});

console.warn('─'.repeat(70));

if (allGood) {
  console.warn('\n✅ ¡Todas las variables requeridas están configuradas!\n');

  if (warnings.length > 0) {
    console.warn('📝 Variables opcionales no configuradas:');
    warnings.forEach(w => {
      console.warn(`   - ${w.name}: ${w.description}`);
    });
    console.warn('');
  }

  console.warn('🚀 Puedes iniciar el servidor con: npm run dev\n');
} else {
  console.warn('\n❌ Faltan variables requeridas. Por favor configúralas en .env.local\n');
  console.warn('📖 Guía completa: docs/ENVIRONMENT_VARIABLES.md');
  console.warn('🧪 Guía de testing: docs/TESTING_GUIDE_DEV.md\n');
  process.exit(1);
}
