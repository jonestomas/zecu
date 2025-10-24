/**
 * Utilidades para normalización de números de teléfono
 */

/**
 * Normaliza números de teléfono argentinos para WhatsApp/Twilio
 * 
 * Argentina tiene un formato especial:
 * - Código país: +54
 * - Para celulares, WhatsApp/Twilio añaden un 9 después del código de país
 * - Formato correcto: +54 9 11 XXXX XXXX
 * 
 * Ejemplos:
 * - Input: +541134070204 → Output: +5491134070204
 * - Input: +5491134070204 → Output: +5491134070204
 * - Input: +541534070204 → Output: +5491534070204
 */
export function normalizePhoneNumber(phone: string): string {
  // Remover espacios y caracteres no numéricos (excepto el +)
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // Si es un número argentino (+54) sin el 9
  if (normalized.startsWith('+54') && !normalized.startsWith('+549')) {
    // Verificar que sea un celular (códigos de área de celular argentinos)
    // 11, 15, 221, 223, 261, 291, 299, 341, 351, 370, 379, 381, 387, etc.
    const withoutCountryCode = normalized.substring(3); // Remover +54
    
    // Si el número siguiente es 1, 2, 3, 5 (códigos de área comunes de celular)
    // y no tiene el 9, agregarlo
    if (withoutCountryCode.match(/^(11|15|2[0-9]{2,3}|3[0-9]{2,3}|5[0-9]{2})/)) {
      normalized = '+549' + withoutCountryCode;
    }
  }
  
  return normalized;
}

/**
 * Compara dos números de teléfono para ver si son el mismo
 * después de normalizar
 */
export function phoneNumbersMatch(phone1: string, phone2: string): boolean {
  return normalizePhoneNumber(phone1) === normalizePhoneNumber(phone2);
}

/**
 * Formatea un número de teléfono para mostrarlo de forma legible
 * 
 * Ejemplos:
 * - +5491134070204 → +54 9 11 3407 0204
 * - +12692562013 → +1 269 256 2013
 */
export function formatPhoneNumber(phone: string): string {
  const normalized = phone.replace(/[^\d+]/g, '');
  
  // Formato argentino: +54 9 11 XXXX XXXX
  if (normalized.startsWith('+549')) {
    const match = normalized.match(/^(\+54)(9)(\d{2,4})(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
    }
  }
  
  // Formato USA: +1 XXX XXX XXXX
  if (normalized.startsWith('+1')) {
    const match = normalized.match(/^(\+1)(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
  }
  
  // Formato genérico
  return normalized;
}
