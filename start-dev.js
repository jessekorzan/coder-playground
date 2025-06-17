#!/usr/bin/env node

// Development startup script with ES module compatibility
import { fileURLToPath } from 'url';
import path from 'path';
import { spawn } from 'child_process';

// Set up __dirname globally before running tsx
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make __dirname available globally
globalThis.__dirname = __dirname;

// Set environment
process.env.NODE_ENV = 'development';

// Run tsx with the server
const tsx = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--loader ./esm-polyfill.js'
  }
});

tsx.on('close', (code) => {
  process.exit(code);
});

tsx.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});