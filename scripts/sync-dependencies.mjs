import { readFile, writeFile, mkdir } from 'node:fs/promises';

const catalog = JSON.parse(await readFile(new URL('../config/dependencies.json', import.meta.url)));
const pkgUrl = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(await readFile(pkgUrl));
const runtime = [catalog.groups, catalog.states, catalog.apis].flatMap((group) =>
  Object.values(group ?? {}).flat(),
);
const names = [...new Set(['react', ...runtime, ...catalog.dev])];
const records = {};
let cursor = 0;

await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (cursor < names.length) {
      const name = names[cursor++];
      const response = await fetch(
        'https://registry.npmjs.org/' + encodeURIComponent(name) + '/latest',
        { signal: AbortSignal.timeout(30000) },
      );
      if (!response.ok) throw new Error(name + ': HTTP ' + response.status);
      const data = await response.json();
      records[name] = {
        version: data.version,
        peerDependencies: data.peerDependencies ?? {},
        engines: data.engines ?? {},
      };
      console.log(name + '@' + data.version);
    }
  }),
);
pkg.name = 'starter-pack';
pkg.packageManager = 'pnpm@12.15.0';
pkg.engines = { node: '>=24.3.0', pnpm: '>=12' };
delete pkg.dependencies['@react-native/new-app-screen'];
for (const name of runtime) pkg.dependencies[name] = records[name].version;
pkg.dependencies.react = records.react.version;
for (const name of catalog.dev) pkg.devDependencies[name] = records[name].version;
delete pkg.devDependencies['@react-native/eslint-config'];
delete pkg.devDependencies['@types/react-test-renderer'];
delete pkg.devDependencies['react-test-renderer'];

// Renderer must follow the selected RNTL peer contract.
const renderer = records['@testing-library/react-native'].peerDependencies;
for (const name of ['test-renderer', 'react-test-renderer']) {
  if (renderer[name]) {
    const response = await fetch('https://registry.npmjs.org/' + name + '/latest');
    if (!response.ok) throw new Error('Cannot resolve renderer ' + name);
    const metadata = await response.json();
    pkg.devDependencies[name] =
      name === 'react-test-renderer' ? pkg.dependencies.react : metadata.version;
  }
}

pkg.scripts = {
  start: 'react-native start',
  android: 'react-native run-android',
  ios: 'react-native run-ios',
  typecheck: 'tsc --noEmit',
  lint: 'eslint src scripts tests',
  format: 'prettier --write src scripts tests config *.json *.js *.mjs *.yaml README.md docs',
  'format:check': 'prettier --check src scripts tests config',
  test: 'jest --runInBand',
  'test:scripts': 'node --test tests/scripts/*.test.mjs',
  verify: 'pnpm typecheck && pnpm lint && pnpm test && pnpm test:scripts',
  'create-app': 'node scripts/create-app.mjs',
  doctor: 'node scripts/doctor.mjs',
  modules: 'node scripts/configure-modules.mjs',
  'dependencies:audit': 'node scripts/audit-dependencies.mjs',
  'android:release': 'cd android && ./gradlew assembleRelease',
  'android:bundle': 'cd android && ./gradlew bundleRelease',
  'size:check': 'node scripts/check-size.mjs',
  'assets:optimize': 'node scripts/optimize-assets.mjs',
  'ios:pods': 'cd ios && bundle exec pod install',
  e2e: 'maestro test .maestro',
};
await writeFile(pkgUrl, JSON.stringify(pkg, null, 2) + '\n');
await mkdir(new URL('../config/', import.meta.url), { recursive: true });
await writeFile(
  new URL('../config/dependency-audit.json', import.meta.url),
  JSON.stringify({ checkedAt: new Date().toISOString(), records }, null, 2) + '\n',
);
