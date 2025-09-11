/**
 * Script para probar las animaciones del navbar en diferentes entornos
 * Ejecutar con: tsx src/scripts/test-animations.ts
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧪 Iniciando pruebas de animaciones del navbar...\n');

// Función para verificar si el build se completa correctamente
function testBuild() {
  console.log('📦 Probando build de producción...');
  try {
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Build de producción completado exitosamente\n');
    return true;
  } catch (error) {
    console.error('❌ Error en el build de producción:');
    console.error(error);
    return false;
  }
}

// Función para verificar archivos críticos
function checkCriticalFiles() {
  console.log('📁 Verificando archivos críticos...');
  
  const criticalFiles = [
    'src/components/ClientNavbar.tsx',
    'src/components/ClientOnly.tsx',
    'src/components/FramerMotionProvider.tsx',
    'next.config.ts'
  ];
  
  let allFilesExist = true;
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} existe`);
    } else {
      console.log(`❌ ${file} no encontrado`);
      allFilesExist = false;
    }
  });
  
  console.log('');
  return allFilesExist;
}

// Función para verificar dependencias
function checkDependencies() {
  console.log('📋 Verificando dependencias...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const framerMotionVersion = packageJson.dependencies['framer-motion'];
    
    if (framerMotionVersion) {
      console.log(`✅ Framer Motion ${framerMotionVersion} instalado`);
    } else {
      console.log('❌ Framer Motion no encontrado en dependencias');
      return false;
    }
    
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Error leyendo package.json:', error);
    return false;
  }
}

// Función para generar reporte de configuración
function generateConfigReport() {
  console.log('⚙️ Generando reporte de configuración...');
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    framerMotionVersion: null as string | null,
    nextConfig: null as string | null
  };
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    report.framerMotionVersion = packageJson.dependencies['framer-motion'];
  } catch (error) {
    console.log('⚠️ No se pudo leer package.json');
  }
  
  try {
    const nextConfig = fs.readFileSync('next.config.ts', 'utf8');
    report.nextConfig = nextConfig.includes('optimizePackageImports') ? 'Optimizado' : 'No optimizado';
  } catch (error) {
    console.log('⚠️ No se pudo leer next.config.ts');
  }
  
  // Guardar reporte
  const reportPath = path.join(process.cwd(), 'animation-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📊 Reporte guardado en: ${reportPath}\n`);
  
  return report;
}

// Función principal
function main() {
  console.log('🚀 Iniciando pruebas de animaciones del navbar\n');
  
  const results = {
    files: checkCriticalFiles(),
    dependencies: checkDependencies(),
    build: false,
    config: null as any
  };
  
  if (results.files && results.dependencies) {
    results.build = testBuild();
  }
  
  results.config = generateConfigReport();
  
  // Resumen final
  console.log('📋 RESUMEN DE PRUEBAS:');
  console.log('====================');
  console.log(`Archivos críticos: ${results.files ? '✅' : '❌'}`);
  console.log(`Dependencias: ${results.dependencies ? '✅' : '❌'}`);
  console.log(`Build de producción: ${results.build ? '✅' : '❌'}`);
  console.log(`Configuración: ${results.config ? '✅' : '❌'}`);
  
  if (results.files && results.dependencies && results.build) {
    console.log('\n🎉 ¡Todas las pruebas pasaron! Las animaciones deberían funcionar correctamente.');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Ejecutar: npm run start');
    console.log('2. Abrir la aplicación en el navegador');
    console.log('3. Navegar a /cliente y probar las animaciones del navbar');
    console.log('4. Verificar que el círculo, línea y SVG se muevan sincronizados');
  } else {
    console.log('\n⚠️ Algunas pruebas fallaron. Revisar los errores anteriores.');
  }
  
  console.log('\n🔧 Para debugging adicional:');
  console.log('- Revisar la consola del navegador para errores de hidratación');
  console.log('- Verificar que Framer Motion se cargue correctamente');
  console.log('- Comprobar que no hay errores de CSP (Content Security Policy)');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

export { main as testAnimations };
