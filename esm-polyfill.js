// ES Module polyfill for __dirname and process.env
import { fileURLToPath } from 'url';
import path from 'path';

// Create ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set global __dirname for compatibility
globalThis.__dirname = __dirname;

// Ensure process is available
if (typeof globalThis.process === 'undefined') {
  globalThis.process = process;
}

// Export for use in other modules
export { __dirname, __filename };