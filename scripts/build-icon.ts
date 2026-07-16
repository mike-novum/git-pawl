import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { BICUBIC, createICNS } from 'png2icons';

const root = process.cwd();

const sourceSvgPath = join(root, 'assets', 'icon.svg');
const buildDir = join(root, 'build');
const masterPngPath = join(buildDir, 'icon-master.png');
const standardPngPath = join(buildDir, 'icon.png');
const icnsPath = join(buildDir, 'icon.icns');

const masterSize = 1024;
const standardSize = 512;

const ensureDir = (path: string): void => {
  mkdirSync(path, { recursive: true });
};

const sourceNewerThanOutputs = (): boolean => {
  if (!existsSync(sourceSvgPath)) {
    throw new Error(`Source SVG not found: ${sourceSvgPath}`);
  }
  const sourceMtime = statSync(sourceSvgPath).mtimeMs;
  const targets = [masterPngPath, standardPngPath, icnsPath];
  return targets.some((target) => !existsSync(target) || statSync(target).mtimeMs < sourceMtime);
};

const buildAll = async (): Promise<void> => {
  ensureDir(dirname(masterPngPath));

  const svgBuffer = readFileSync(sourceSvgPath);

  await sharp(svgBuffer)
    .resize(masterSize, masterSize, { fit: 'contain', background: { r: 255, g: 251, b: 245, alpha: 1 } })
    .png()
    .toFile(masterPngPath);

  await sharp(svgBuffer)
    .resize(standardSize, standardSize, { fit: 'contain', background: { r: 255, g: 251, b: 245, alpha: 1 } })
    .png()
    .toFile(standardPngPath);

  const masterPngBuffer = readFileSync(masterPngPath);
  const icnsBuffer = createICNS(masterPngBuffer, BICUBIC, 0);
  if (!icnsBuffer) {
    throw new Error('Failed to create ICNS file from master PNG');
  }
  writeFileSync(icnsPath, icnsBuffer);
};

const main = async (): Promise<void> => {
  ensureDir(buildDir);

  if (!sourceNewerThanOutputs()) {
    console.warn(`Icons are up to date, skipping rebuild.`);
    return;
  }

  await buildAll();
  console.warn(`Icons written to ${buildDir}`);
};

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});