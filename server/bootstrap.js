// Bootstrap file to set up ES module compatibility
import { fileURLToPath } from 'url';
import path from 'path';

// Set up global __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make __dirname available globally for the entire application
globalThis.__dirname = path.resolve(__dirname, '..');

// Also set up process.env if needed
if (!globalThis.process) {
  globalThis.process = process;
}

// Now import and run the main server
import('./index.js');