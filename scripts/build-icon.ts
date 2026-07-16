import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const buildDir = join(root, 'build');

mkdirSync(buildDir, { recursive: true });

const svgPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <circle cx="256" cy="256" r="240" fill="#f4a460"/>
  <text x="256" y="290" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="120" fill="#1a1a1a">git</text>
</svg>
`;

const out = join(buildDir, 'icon.svg');
writeFileSync(out, svgPlaceholder, 'utf8');

console.warn(`Icon placeholder written to ${out}`);