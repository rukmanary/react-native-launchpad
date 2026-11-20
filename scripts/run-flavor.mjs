import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import config from '../starter.config.json' with { type: 'json' };
import flavors from '../config/flavors.json' with { type: 'json' };

const [platform, action, ...args] = process.argv.slice(2);
const isRun = action === 'run';
const name = args[0] && !args[0].startsWith('-') ? args.shift() : isRun ? 'dev' : 'production';

if (!Object.hasOwn(flavors, name)) throw new Error('Choose production, dev, or qa.');

const flavor = flavors[name];
const root = fileURLToPath(new URL('..', import.meta.url));
const extra = args[0] === '--' ? args.slice(1) : args;

let command;
let parameters;
let cwd = root;

if (platform === 'android' && isRun) {
  command = 'pnpm';
  parameters = [
    'exec',
    'react-native',
    'run-android',
    '--mode',
    name + 'Debug',
    '--appId',
    config.androidId + flavor.suffix,
    ...extra,
  ];
} else if (platform === 'ios' && isRun) {
  command = 'pnpm';
  parameters = [
    'exec',
    'react-native',
    'run-ios',
    '--scheme',
    config.name + flavor.iosSuffix,
    ...extra,
  ];
} else if (platform === 'android' && ['release', 'apk', 'arm64', 'bundle'].includes(action)) {
  command = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  cwd = fileURLToPath(new URL('../android/', import.meta.url));

  const task =
    (action === 'bundle' ? 'bundle' : 'assemble') +
    name[0].toUpperCase() +
    name.slice(1) +
    'Release';
  parameters = [
    task,
    ...(action === 'apk' ? ['-PsplitApk'] : []),
    ...(action === 'arm64' ? ['-PreactNativeArchitectures=arm64-v8a'] : []),
    ...extra,
  ];
} else {
  throw new Error('Unknown platform or action');
}

const result = spawnSync(command, parameters, { cwd, stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
