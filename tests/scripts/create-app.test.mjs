import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp, validateIdentity } from '../../scripts/create-app.mjs';
import { selectModules } from '../../scripts/lib/starter-options.mjs';
const identity = {
  name: 'ExampleApp',
  slug: 'example-app',
  displayName: 'Example App',
  androidId: 'com.example.app',
  iosId: 'com.example.ios',
};
test('invalid IDs fail before any mutation', () => {
  assert.throws(() => validateIdentity({ ...identity, androidId: '../../outside' }));
  assert.throws(() => validateIdentity({ ...identity, name: '../Bad' }));
  assert.throws(() => validateIdentity({ ...identity, iosId: 'com.example.invalid_id' }));
});
test('all includes every capability and preserves the selected state preset', () => {
  const catalog = { groups: { core: [], ui: [], media: [], zustand: [] } };
  assert.deepEqual(selectModules(catalog, 'all', 'redux'), ['core', 'ui', 'media']);
  assert.deepEqual(selectModules(catalog, 'all', 'zustand'), ['core', 'ui', 'media', 'zustand']);
  assert.deepEqual(selectModules(catalog, 'ui, media, ui', 'redux'), ['core', 'ui', 'media']);
  assert.throws(() => selectModules(catalog, 'all,ui', 'redux'), /Unknown module/);
  assert.throws(() => selectModules(catalog, 'zustand', 'redux'), /--state zustand/);
});
test('generation isolates source, resets IDs, omits history and handles dry-run', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'rn-template-test-'));
  const source = path.join(root, 'source');
  const target = path.join(root, 'StarterPack-output');
  try {
    const fixture = {
      'starter.config.json': JSON.stringify({
        ...identity,
        name: 'StarterPack',
        displayName: 'Starter Pack',
        slug: 'starter-pack',
        androidId: 'com.starterpack',
        iosId: 'com.starterpack.ios',
        scheme: 'starterpack',
        modules: ['core'],
        services: {},
      }),
      'config/dependencies.json': JSON.stringify({
        groups: { core: ['react'], media: ['fake-media'] },
      }),
      'config/size-budget.json': JSON.stringify({
        maxGrowthPercent: 10,
        artifacts: { 'app-release.apk': 123 },
      }),
      'package.json': JSON.stringify({
        name: 'starter-pack',
        dependencies: { react: '1.0.0', 'fake-media': '1.0.0' },
      }),
      'android/app/src/main/AndroidManifest.xml':
        '<manifest><application><activity></activity></application></manifest>',
      'android/app/src/main/java/com/starterpack/Main.kt': 'package com.starterpack',
      'ios/StarterPack/Info.plist': '<plist><dict></dict></plist>',
      'ios/StarterPack.xcodeproj/project.pbxproj':
        'PRODUCT_BUNDLE_IDENTIFIER = com.starterpack.ios;',
      '.git/HEAD': 'private history',
      '.bundle/config': 'local Bundler settings',
      'vendor/bundle/cache.txt': 'installed Ruby dependency',
      '.maestro/tests/report.txt': 'local test output',
      'app-release.apk': 'local build artifact',
      'AuthKey_TEST.p8': 'placeholder signing key',
      'src/modules/media/index.ts': 'export {}',
      '.maestro/smoke.yaml': 'appId: com.starterpack\n---\n- assertVisible: "Starter Pack"',
    };
    for (const [name, content] of Object.entries(fixture)) {
      await mkdir(path.dirname(path.join(source, name)), { recursive: true });
      await writeFile(path.join(source, name), content);
    }
    const args = { ...identity, source, target, skipInstall: true };
    const dryRun = await createApp({ ...args, dryRun: true });
    assert.deepEqual(dryRun.variants.qa, {
      androidId: 'com.example.app.qa',
      iosId: 'com.example.ios.qa',
      displayName: 'Example App QA',
      scheme: 'example-app.qa',
    });
    await assert.rejects(access(target));
    await createApp(args);
    const config = JSON.parse(await readFile(path.join(target, 'starter.config.json'), 'utf8'));
    assert.equal(config.name, 'ExampleApp');
    assert.equal(config.iosId, 'com.example.ios');
    assert.deepEqual(config.flavorServices, { dev: {}, qa: {} });
    assert.match(
      await readFile(path.join(target, 'ios/Config/qa.xcconfig'), 'utf8'),
      /STARTER_URL_SCHEME = example-app\.qa/,
    );
    assert.match(
      await readFile(path.join(target, 'ios/ExampleApp.xcodeproj/project.pbxproj'), 'utf8'),
      /PRODUCT_BUNDLE_IDENTIFIER = com\.example\.ios;/,
    );
    assert.deepEqual(
      JSON.parse(await readFile(path.join(target, 'config/size-budget.json'), 'utf8')).artifacts,
      {},
    );
    assert.match(await readFile(path.join(target, '.maestro/smoke.yaml'), 'utf8'), /Example App/);
    assert.equal(
      await readFile(
        path.join(target, 'android/app/src/main/java/com/example/app/Main.kt'),
        'utf8',
      ),
      'package com.example.app',
    );
    for (const localFile of [
      '.git',
      '.bundle',
      'vendor/bundle',
      '.maestro/tests',
      'app-release.apk',
      'AuthKey_TEST.p8',
    ]) {
      await assert.rejects(access(path.join(target, localFile)));
    }
    await assert.rejects(access(path.join(target, 'src/modules/media')));
    assert.equal(
      JSON.parse(await readFile(path.join(target, 'package.json'), 'utf8')).dependencies[
        'fake-media'
      ],
      undefined,
    );
    assert.equal(
      JSON.parse(await readFile(path.join(source, 'starter.config.json'), 'utf8')).name,
      'StarterPack',
    );
    await assert.rejects(createApp(args), /already exists/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
