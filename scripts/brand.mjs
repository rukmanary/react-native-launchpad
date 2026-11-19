import sharp from 'sharp';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const input = process.argv[2];
if (!input || !/\.(svg|png|jpe?g)$/i.test(input))
  throw new Error('Usage: pnpm brand path/to/logo.svg');
const config = JSON.parse(await readFile(new URL('../starter.config.json', import.meta.url)));
for (const [density, size] of Object.entries({
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
})) {
  const dir = 'android/app/src/main/res/mipmap-' + density;
  await mkdir(dir, { recursive: true });
  for (const name of ['ic_launcher', 'ic_launcher_round'])
    await sharp(input)
      .resize(size, size, { fit: 'contain', background: '#2358C5' })
      .flatten({ background: '#2358C5' })
      .png()
      .toFile(path.join(dir, name + '.png'));
}
const iconset = 'ios/' + config.name + '/Images.xcassets/AppIcon.appiconset';
await mkdir(iconset, { recursive: true });
await sharp(input)
  .resize(1024, 1024, { fit: 'contain', background: '#2358C5' })
  .flatten({ background: '#2358C5' })
  .png()
  .toFile(path.join(iconset, 'AppIcon.png'));
await writeFile(
  path.join(iconset, 'Contents.json'),
  JSON.stringify(
    {
      images: [{ filename: 'AppIcon.png', idiom: 'universal', platform: 'ios', size: '1024x1024' }],
      info: { author: 'xcode', version: 1 },
    },
    null,
    2,
  ),
);
// Splash registration is already installed in this template. Preserve XML comments
// that mark module-owned permission/URL blocks; the upstream generator strips them.
const manifests = [
  'android/app/src/main/AndroidManifest.xml',
  'ios/' + config.name + '/Info.plist',
];
const originals = await Promise.all(manifests.map((file) => readFile(file)));
const result = spawnSync(
  'pnpm',
  [
    'exec',
    'react-native-bootsplash',
    'generate',
    input,
    '--platforms',
    'android,ios',
    '--background',
    'F5F7FB',
    '--logo-width',
    '96',
    '--assets-output',
    'src/assets/bootsplash',
  ],
  { stdio: 'inherit' },
);
await Promise.all(manifests.map((file, index) => writeFile(file, originals[index])));
process.exitCode = result.status ?? 1;
