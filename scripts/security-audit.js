#!/usr/bin/env node

/**
 * Script de Auditoría de Seguridad Automática
 * Ejecuta auditorías de dependencias y genera reportes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
  outputDir: './security-reports',
  reportFile: 'dependency-audit.json',
  criticalThreshold: 'high',
  moderateThreshold: 'moderate',
};

// Colores para consola
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.warn(`${colors[color]}${message}${colors.reset}`);
}

function createOutputDir() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    log(`📁 Directorio de reportes creado: ${CONFIG.outputDir}`, 'blue');
  }
}

function runAudit() {
  log('🔍 Ejecutando auditoría de dependencias...', 'blue');

  try {
    const auditOutput = execSync('pnpm audit --json', {
      encoding: 'utf8',
      cwd: process.cwd(),
    });

    const auditData = JSON.parse(auditOutput);
    return auditData;
  } catch (error) {
    // pnpm audit --json devuelve código de salida 1 si hay vulnerabilidades
    // pero el output JSON sigue siendo válido
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch (parseError) {
        log('❌ Error parseando output de auditoría', 'red');
        return null;
      }
    }
    log('❌ Error ejecutando auditoría', 'red');
    return null;
  }
}

function analyzeVulnerabilities(auditData) {
  if (!auditData || !auditData.vulnerabilities) {
    log('✅ No se encontraron vulnerabilidades', 'green');
    return {
      total: 0,
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      vulnerabilities: [],
    };
  }

  const vulnerabilities = Object.values(auditData.vulnerabilities);
  const analysis = {
    total: vulnerabilities.length,
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    vulnerabilities: [],
  };

  vulnerabilities.forEach(vuln => {
    const severity = vuln.severity?.toLowerCase() || 'unknown';

    switch (severity) {
      case 'critical':
        analysis.critical++;
        break;
      case 'high':
        analysis.high++;
        break;
      case 'moderate':
        analysis.moderate++;
        break;
      case 'low':
        analysis.low++;
        break;
    }

    analysis.vulnerabilities.push({
      package: vuln.name,
      severity: vuln.severity,
      title: vuln.title,
      description: vuln.description,
      recommendation: vuln.recommendation,
      paths: vuln.paths,
      cwe: vuln.cwe,
      cvss: vuln.cvss,
    });
  });

  return analysis;
}

function generateReport(analysis) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: analysis.total,
      critical: analysis.critical,
      high: analysis.high,
      moderate: analysis.moderate,
      low: analysis.low,
    },
    vulnerabilities: analysis.vulnerabilities,
    recommendations: generateRecommendations(analysis),
  };

  const reportPath = path.join(CONFIG.outputDir, CONFIG.reportFile);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  log(`📊 Reporte generado: ${reportPath}`, 'green');
  return report;
}

function generateRecommendations(analysis) {
  const recommendations = [];

  if (analysis.critical > 0) {
    recommendations.push({
      priority: 'CRITICAL',
      action: 'Actualizar inmediatamente las dependencias críticas',
      packages: analysis.vulnerabilities
        .filter(v => v.severity?.toLowerCase() === 'critical')
        .map(v => v.package),
    });
  }

  if (analysis.high > 0) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Actualizar dependencias de alta prioridad en las próximas 24 horas',
      packages: analysis.vulnerabilities
        .filter(v => v.severity?.toLowerCase() === 'high')
        .map(v => v.package),
    });
  }

  if (analysis.moderate > 0) {
    recommendations.push({
      priority: 'MODERATE',
      action: 'Planificar actualización de dependencias moderadas',
      packages: analysis.vulnerabilities
        .filter(v => v.severity?.toLowerCase() === 'moderate')
        .map(v => v.package),
    });
  }

  if (analysis.total === 0) {
    recommendations.push({
      priority: 'INFO',
      action: 'Mantener auditorías regulares',
      packages: [],
    });
  }

  return recommendations;
}

function printSummary(report) {
  log('\n📋 RESUMEN DE AUDITORÍA', 'bold');
  log('═'.repeat(50), 'blue');

  log(`📅 Fecha: ${new Date(report.timestamp).toLocaleString()}`, 'blue');
  log(
    `📦 Total de vulnerabilidades: ${report.summary.total}`,
    report.summary.total > 0 ? 'red' : 'green'
  );

  if (report.summary.total > 0) {
    log(`🔴 Críticas: ${report.summary.critical}`, 'red');
    log(`🟠 Altas: ${report.summary.high}`, 'yellow');
    log(`🟡 Moderadas: ${report.summary.moderate}`, 'yellow');
    log(`🟢 Bajas: ${report.summary.low}`, 'green');
  }

  log('\n🎯 RECOMENDACIONES:', 'bold');
  report.recommendations.forEach(rec => {
    const color = rec.priority === 'CRITICAL' ? 'red' : rec.priority === 'HIGH' ? 'yellow' : 'blue';
    log(`• ${rec.priority}: ${rec.action}`, color);
    if (rec.packages.length > 0) {
      log(`  Paquetes: ${rec.packages.join(', ')}`, 'blue');
    }
  });

  log(`\n${'═'.repeat(50)}`, 'blue');
}

function main() {
  log('🛡️ AUDITORÍA DE SEGURIDAD DE DEPENDENCIAS', 'bold');
  log('═'.repeat(50), 'blue');

  createOutputDir();

  const auditData = runAudit();
  const analysis = analyzeVulnerabilities(auditData);
  const report = generateReport(analysis);

  printSummary(report);

  // Código de salida basado en severidad
  if (analysis.critical > 0) {
    log('\n❌ Se encontraron vulnerabilidades críticas', 'red');
    process.exit(1);
  } else if (analysis.high > 0) {
    log('\n⚠️ Se encontraron vulnerabilidades de alta prioridad', 'yellow');
    process.exit(1);
  } else {
    log('\n✅ Auditoría completada sin vulnerabilidades críticas', 'green');
    process.exit(0);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main, runAudit, analyzeVulnerabilities };
