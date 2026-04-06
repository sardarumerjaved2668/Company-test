#!/usr/bin/env node
/**
 * Removes Next.js build output and tool caches (fixes "Cannot find module './NNN.js'" in dev).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const targets = [
  path.join(root, '.next'),
  path.join(root, 'node_modules', '.cache'),
];

for (const dir of targets) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log('Removed:', path.relative(root, dir) || '.');
  } catch (e) {
    console.warn('Skip:', path.relative(root, dir), e.message);
  }
}
console.log('Clean complete. Run: npm run dev');
