#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const home = homedir();
const candidatePaths = [
  join(home, '.npm/_npx/15c61037b1978c83/node_modules/chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js'),
  join(home, '.npm/_npx/bdd39d12a2040511/node_modules/chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js'),
  join(home, '.npm/_npx/dc11ecfbc19ed485/node_modules/chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js')
];

const target = candidatePaths.find(p => existsSync(p));

let child;
if (target) {
  child = spawn(process.execPath, [target, ...process.argv.slice(2)], {
    stdio: 'inherit'
  });
} else {
  child = spawn('npx', ['-y', 'chrome-devtools-mcp@latest', ...process.argv.slice(2)], {
    stdio: 'inherit'
  });
}

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
child.on('error', (err) => {
  console.error('Failed to start Chrome DevTools MCP:', err);
  process.exit(1);
});
