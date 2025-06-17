// ESM loader to handle __dirname compatibility
import { fileURLToPath } from 'url';
import path from 'path';

// Set up global __dirname before any modules are imported
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make __dirname available globally
globalThis.__dirname = path.resolve(__dirname, '..');

// Also ensure process.env is available for browser compatibility
globalThis.process = globalThis.process || process;