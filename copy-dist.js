#!/usr/bin/env node
/**
 * Copie frontend/dist vers backend/public (sans rebuild)
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const frontendDist = path.join(root, 'frontend', 'dist');
const backendPublic = path.join(root, 'backend', 'public');

if (!fs.existsSync(frontendDist)) {
  console.error('❌ frontend/dist introuvable. Exécutez d\'abord: cd frontend && npm run build');
  process.exit(1);
}

console.log('📁 Copie frontend/dist → backend/public...');
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
console.log('✅ Terminé. Lancer: cd backend && npm start');
