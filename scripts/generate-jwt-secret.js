#!/usr/bin/env node

/**
 * Script para generar JWT Secret seguro
 * Uso: node scripts/generate-jwt-secret.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generando JWT Secret...\n');

const secret = crypto.randomBytes(32).toString('hex');

console.log('Tu JWT Secret:');
console.log('─'.repeat(70));
console.log(secret);
console.log('─'.repeat(70));

console.log('\n📋 Copia esta línea a tu .env.local:\n');
console.log(`JWT_SECRET=${secret}`);
console.log('\n✅ ¡Listo! Mantén este secreto seguro y nunca lo compartas.\n');
