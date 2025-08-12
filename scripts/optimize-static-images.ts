/*
  Optimize all images under public/images and create .webp versions alongside.
  Usage: bun scripts/optimize-static-images.ts
*/
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const IMAGES_DIR = path.join(ROOT, 'public', 'images');

const SUPPORTED_INPUTS = new Set(['.jpg', '.jpeg', '.png']);
const MAX_DIMENSION = 700; // px (fit inside a 700x700 box)
const QUALITY = 80; // ~0.8 quality

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

async function optimizeFile(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (!SUPPORTED_INPUTS.has(ext)) return;

  const rel = path.relative(IMAGES_DIR, filePath);
  const outWebp = path.join(
    path.dirname(filePath),
    path.parse(filePath).name + '.webp'
  );

  const quality = QUALITY;

  await sharp(filePath)
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toFile(outWebp);

  console.log(`Generated WebP: ${rel.replace(ext, '.webp')}`);
}

async function main() {
  try {
    await fs.access(IMAGES_DIR);
  } catch {
    console.error('Directory not found:', IMAGES_DIR);
    process.exit(1);
  }

  let count = 0;
  for await (const file of walk(IMAGES_DIR)) {
    try {
      await optimizeFile(file);
      count += 1;
    } catch (e) {
      console.error('Failed optimizing', file, e);
    }
  }
  console.log(`Done. Processed ${count} files.`);
}

main();
