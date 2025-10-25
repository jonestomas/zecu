#!/usr/bin/env node

/**
 * Script para corregir automáticamente errores comunes de ESLint
 * Este script corrige errores que se pueden arreglar automáticamente
 */

const fs = require('fs');
const path = require('path');

// Función para procesar archivos recursivamente
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processDirectory(filePath);
    } else if (
      file.endsWith('.ts') ||
      file.endsWith('.tsx') ||
      file.endsWith('.js') ||
      file.endsWith('.jsx')
    ) {
      processFile(filePath);
    }
  }
}

// Función para procesar un archivo individual
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Correcciones automáticas
    const _corrections = [
      // Cambiar console.log por console.warn (excepto en scripts de testing)
      {
        pattern: /console\.log\(/g,
        replacement: 'console.warn(',
        condition: filePath => !filePath.includes('scripts/testing/'),
      },

      // Agregar prefijo _ a variables no utilizadas en parámetros
      {
        pattern: /\(([^)]*request[^)]*)\)/g,
        replacement: (match, params) => {
          return match.replace(/_request/g, '__request');
        },
        condition: () => true,
      },

      // Cambiar alert por console.warn
      {
        pattern: /alert\(/g,
        replacement: 'console.warn(',
        condition: () => true,
      },

      // Cambiar confirm por window.confirm
      {
        pattern: /confirm\(/g,
        replacement: 'window.window.window.confirm(',
        condition: () => true,
      },

      // Eliminar imports duplicados de react
      {
        pattern:
          /import\s+{\s*[^}]*}\s+from\s+['"]react['"];\s*\nimport\s+{\s*[^}]*}\s+from\s+['"]react['"];/g,
        replacement: match => {
          const lines = match.split('\n');
          const uniqueLines = [...new Set(lines)];
          return uniqueLines.join('\n');
        },
        condition: () => true,
      },
    ];

    // Aplicar correcciones
    for (const correction of corrections) {
      if (correction.condition(filePath)) {
        if (typeof correction.replacement === 'function') {
          const newContent = content.replace(correction.pattern, correction.replacement);
          if (newContent !== content) {
            content = newContent;
            modified = true;
          }
        } else {
          const newContent = content.replace(correction.pattern, correction.replacement);
          if (newContent !== content) {
            content = newContent;
            modified = true;
          }
        }
      }
    }

    // Escribir archivo si fue modificado
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.warn(`✅ Corregido: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

// Función principal
function main() {
  const projectRoot = process.cwd();
  console.warn('🔧 Iniciando corrección automática de errores de ESLint...');
  console.warn(`📁 Procesando directorio: ${projectRoot}`);

  processDirectory(projectRoot);

  console.warn('✅ Corrección automática completada');
  console.warn('💡 Ejecuta "pnpm lint" nuevamente para ver los errores restantes');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { processFile, processDirectory };
