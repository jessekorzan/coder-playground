#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Building client...');
try {
  execSync('vite build', { stdio: 'inherit' });
} catch (error) {
  console.error('Client build failed:', error.message);
  process.exit(1);
}

console.log('Building server...');
try {
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --define:global.__dirname=\\"\\"', { stdio: 'inherit' });
} catch (error) {
  console.error('Server build failed:', error.message);
  process.exit(1);
}

// Create a wrapper script for the production server
const productionWrapper = `
// Production server wrapper with ES module compatibility
import { fileURLToPath } from 'url';
import path from 'path';

// Set up ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make __dirname available globally
globalThis.__dirname = __dirname;

// Now import and run the main server
import('./index.js');
`;

fs.writeFileSync(path.join(__dirname, 'dist', 'server.js'), productionWrapper);

console.log('Production build complete!');
console.log('Run: NODE_ENV=production node dist/server.js');