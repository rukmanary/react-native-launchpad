import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const source = process.argv[2],
  target = process.argv[3];
if (!source || !target || path.resolve(source) === path.resolve(target))
  throw new Error('Usage: pnpm assets:optimize input-directory separate-output-directory');
await mkdir(target, { recursive: true });
for (const entry of await readdir(source, { withFileTypes: true })) {
  if (!entry.isFile() || !/\.(png|jpe?g|webp)$/i.test(entry.name)) continue;
  const output = path.join(target, entry.name.replace(/\.[^.]+$/, '.webp'));
  await sharp(path.join(source, entry.name))
    .rotate()
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(output);
  console.log(path.basename(output));
}
