#!/usr/bin/env node
/**
 * Script de build production :
 * 1. Build du frontend React (Vite)
 * 2. Copie frontend/dist vers backend/public
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const frontendDist = path.join(root, 'frontend', 'dist');
const backendPublic = path.join(root, 'backend', 'public');

console.log('🔨 Build frontend...');
execSync('npm run build', { cwd: path.join(root, 'frontend'), stdio: 'inherit' });

if (!fs.existsSync(frontendDist)) {
  console.error('❌ frontend/dist introuvable après le build');
  process.exit(1);
}

console.log('📁 Copie vers backend/public...');
if (fs.existsSync(backendPublic)) {
  fs.rmSync(backendPublic, { recursive: true });
}
fs.mkdirSync(backendPublic, { recursive: true });

function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyRecursive(frontendDist, backendPublic);
console.log('✅ Build terminé : backend/public prêt');
console.log('   Lancer avec: cd backend && npm start');
