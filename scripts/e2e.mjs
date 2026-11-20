import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import config from '#project/starter.config.json' with { type: 'json' };
import flavors from '#project/config/flavors.json' with { type: 'json' };

const args = process.argv.slice(2);
const flavor = args[0] && !args[0].startsWith('-') ? args.shift() : 'dev';
const platform = args[0] && !args[0].startsWith('-') ? args.shift() : 'android';

if (!Object.hasOwn(flavors, flavor) || !['android', 'ios'].includes(platform))
  throw new Error('Usage: pnpm e2e [production|dev|qa] [android|ios] [Maestro options]');

const appId = (platform === 'ios' ? config.iosId : config.androidId) + flavors[flavor].suffix;
const local = fileURLToPath(new URL('../.tools/maestro/bin/maestro', import.meta.url));
const command = existsSync(local) ? local : 'maestro';
const result = spawnSync(command, ['test', '.maestro', '-e', 'APP_ID=' + appId, ...args], {
  stdio: 'inherit',
});

if (result.error) throw new Error('Maestro unavailable: run pnpm setup:maestro first.');
process.exitCode = result.status ?? 1;
