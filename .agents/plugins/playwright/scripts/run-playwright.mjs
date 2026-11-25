#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const home = homedir();
const candidatePaths = [
  join(home, '.npm/_npx/86170c4cd1c5da32/node_modules/@playwright/mcp/cli.js'),
  join(home, '.npm/_npx/2bf7f25197c22677/node_modules/@playwright/mcp/cli.js'),
  join(home, '.npm/_npx/9833c18b2d85bc59/node_modules/@playwright/mcp/cli.js')
];

const target = candidatePaths.find(p => existsSync(p));

let child;
if (target) {
  child = spawn(process.execPath, [target, ...process.argv.slice(2)], {
    stdio: 'inherit'
  });
} else {
  child = spawn('npx', ['-y', '@playwright/mcp@latest', ...process.argv.slice(2)], {
    stdio: 'inherit'
  });
}

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
child.on('error', (err) => {
  console.error('Failed to start Playwright MCP:', err);
  process.exit(1);
});
