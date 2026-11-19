import { readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import flavors from '../config/flavors.json' with { type: 'json' };
const config = JSON.parse(await readFile(new URL('../starter.config.json', import.meta.url)));
let failures = 0;
const check = (label, ok, detail = '') => {
  console.log((ok ? 'PASS ' : 'FAIL ') + label + (detail ? ' — ' + detail : ''));
  if (!ok) failures++;
};
for (const [binary, args] of [
  ['node', ['--version']],
  ['pnpm', ['--version']],
  ['java', ['-version']],
  ...(process.platform === 'darwin'
    ? [
        ['xcodebuild', ['-version']],
        ['pod', ['--version']],
      ]
    : []),
]) {
  const result = spawnSync(binary, args, { encoding: 'utf8' });
  check(
    binary,
    result.status === 0,
    result.status === 0
      ? (result.stdout || result.stderr).split('\n')[0]
      : 'Install/configure this tool',
  );
}
for (const file of ['node_modules', 'android/gradle/wrapper/gradle-wrapper.jar']) {
  try {
    await access(new URL('../' + file, import.meta.url));
    check(file, true);
  } catch {
    check(file, false);
  }
}
if (config.services.apiBaseUrl.includes('.invalid'))
  console.log('SETUP API base URL is a placeholder; the form demo still works.');
if (config.modules.includes('firebase'))
  for (const file of Object.keys(flavors).flatMap((name) => [
    'android/app/src/' + name + '/google-services.json',
    ...(process.platform === 'darwin'
      ? ['ios/Firebase/' + name + '/GoogleService-Info.plist']
      : []),
  ])) {
    try {
      await access(new URL('../' + file, import.meta.url));
      check(file, true);
    } catch {
      check(file, false, 'Add app-specific Firebase registration file');
    }
  }
if (config.modules.includes('google'))
  check('Google client ID', Boolean(config.services.googleWebClientId));
if (config.modules.includes('location'))
  check('Maps keys', Boolean(config.services.mapsAndroidKey && config.services.mapsIosKey));
console.log(
  'Device-only checks: camera, biometrics, push, keyboard, TalkBack/VoiceOver and 16 KB native libraries.',
);
process.exitCode = failures ? 1 : 0;
