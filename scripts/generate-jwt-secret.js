#!/usr/bin/env node

/**
 * Script para generar JWT Secret seguro
 * Uso: node scripts/generate-jwt-secret.js
 */

const crypto = require('crypto');

console.warn('\n🔐 Generando JWT Secret...\n');

const secret = crypto.randomBytes(32).toString('hex');

console.warn('Tu JWT Secret:');
console.warn('─'.repeat(70));
console.warn(secret);
console.warn('─'.repeat(70));

console.warn('\n📋 Copia esta línea a tu .env.local:\n');
console.warn(`JWT_SECRET=${secret}`);
console.warn('\n✅ ¡Listo! Mantén este secreto seguro y nunca lo compartas.\n');
