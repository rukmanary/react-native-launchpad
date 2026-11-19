import { mkdir, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import toolchain from '../config/toolchain.json' with { type: 'json' };
const root = fileURLToPath(new URL('..', import.meta.url));
const directory = path.join(root, '.tools');
await mkdir(directory, { recursive: true });
const url =
  'https://github.com/mobile-dev-inc/Maestro/releases/download/cli-' +
  toolchain.maestro +
  '/maestro.zip';
const response = await fetch(url, { signal: AbortSignal.timeout(300000) });
if (!response.ok) throw new Error('Maestro download failed: ' + response.status);
const archive = path.join(directory, 'maestro.zip');
await writeFile(archive, Buffer.from(await response.arrayBuffer()));
const result = spawnSync('unzip', ['-q', '-o', archive, '-d', directory], { stdio: 'inherit' });
if (result.status !== 0) throw new Error('Maestro extraction failed');
await rm(archive);
console.log(
  'Installed project-local Maestro ' +
    toolchain.maestro +
    '. Run pnpm e2e with an emulator/device available.',
);
