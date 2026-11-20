import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, access, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp, validateIdentity } from '#project/scripts/create-app.mjs';
import { selectModules } from '#project/scripts/lib/module-selection.mjs';

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

test('all includes every capability and keeps state presets separate', () => {
  const catalog = { groups: { core: [], ui: [], media: [], zustand: [] } };

  assert.deepEqual(selectModules(catalog, 'all'), ['core', 'ui', 'media']);
  assert.deepEqual(selectModules(catalog, 'ui, media, ui'), ['core', 'ui', 'media']);
  assert.throws(() => selectModules(catalog, 'all,ui'), /Unknown module/);
  assert.throws(() => selectModules(catalog, 'zustand'), /--state zustand/);
});

test('generation isolates source, resets IDs, omits history and handles dry-run', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'rn-template-test-'));
  const source = path.join(root, 'source');
  // Keep fixture identities independent of the template that copies these tests.
  const fixtureName = ['Fixture', 'Template'].join('');
  const fixtureLabel = ['Fixture', 'Template'].join(' ');
  const fixtureSlug = ['fixture', 'template'].join('-');
  const androidParts = ['com', 'fixture', 'template'];
  const fixtureAndroidId = androidParts.join('.');
  const fixtureIosId = [...androidParts, 'ios'].join('.');
  const target = path.join(root, identity.slug);

  try {
    const fixture = {
      'starter.config.json': JSON.stringify({
        ...identity,
        name: fixtureName,
        displayName: fixtureLabel,
        slug: fixtureSlug,
        androidId: fixtureAndroidId,
        iosId: fixtureIosId,
        scheme: fixtureSlug,
        modules: ['core'],
        services: {},
      }),
      'config/dependencies.json': JSON.stringify({
        groups: { core: ['react'], media: ['fake-media'], firebase: [] },
      }),
      'config/size-budget.json': JSON.stringify({
        maxGrowthPercent: 10,
        artifacts: { 'app-release.apk': 123 },
      }),
      'package.json': JSON.stringify({
        name: fixtureSlug,
        dependencies: { react: '1.0.0', 'fake-media': '1.0.0' },
        scripts: {
          'create-app': 'node scripts/create-app.mjs',
          'ios:services': 'bundle exec ruby scripts/setup-ios-services.rb',
        },
      }),
      'pnpm-lock.yaml': 'lockfileVersion: 9',
      'pnpm-workspace.yaml':
        'allowUnusedPatches: true\npatchedDependencies:\n  fake-media@1.0.0: patches/fake-media.patch\n',
      'patches/fake-media.patch': 'example patch',
      'android/build.gradle':
        '// starter:module media\nmedia config\n// starter:end-module\nbase config\n',
      'android/app/src/main/AndroidManifest.xml':
        '<manifest><application><activity></activity></application></manifest>',
      ['android/app/src/main/java/' + androidParts.join('/') + '/Main.kt']:
        'package ' + fixtureAndroidId,
      ['ios/' + fixtureName + '/Info.plist']: '<plist><dict></dict></plist>',
      ['ios/' + fixtureName + '.xcodeproj/project.pbxproj']:
        'PRODUCT_BUNDLE_IDENTIFIER = ' + fixtureIosId + ';',
      '.git/HEAD': 'private history',
      '.bundle/config': 'local Bundler settings',
      'vendor/bundle/cache.txt': 'installed Ruby dependency',
      '.maestro/tests/report.txt': 'local test output',
      'app-release.apk': 'local build artifact',
      'AuthKey_TEST.p8': 'placeholder signing key',
      'src/modules/media/index.ts': 'export {}',
      'docs/template.md': 'starter documentation',
      'docs/app-scripts.md': '# Application scripts\n',
      'docs/app-firebase.md': '# Firebase registration by flavor\n',
      'README.md': 'starter README',
      'AGENTS.md': 'starter instructions',
      LICENSE: 'original license notice',
      'licenses/Apache-2.0.txt': 'third-party license notice',
      'scripts/create-app.mjs': 'starter generator',
      'scripts/run-flavor.mjs': 'app tooling',
      'tests/scripts/create-app.test.mjs': 'starter test',
      '.github/workflows/quality.yml': 'starter CI',
      'config/dependency-audit.json': '{}',
      'firebase.json': '{}',
      '.maestro/smoke.yaml':
        'appId: ' + fixtureAndroidId + '\n---\n- assertVisible: "' + fixtureLabel + '"',
    };

    for (const [name, content] of Object.entries(fixture)) {
      await mkdir(path.dirname(path.join(source, name)), { recursive: true });
      await writeFile(path.join(source, name), content);
    }

    const args = { ...identity, source, skipInstall: true };
    const dryRun = await createApp({ ...args, dryRun: true });

    assert.equal(dryRun.target, target);

    const customTarget = path.join(root, 'custom-output');
    const customPlan = await createApp({ ...args, target: customTarget, dryRun: true });

    assert.equal(customPlan.target, customTarget);
    await assert.rejects(access(customTarget));
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
    assert.deepEqual(config.services, { apiBaseUrl: 'https://example.invalid' });
    assert.equal(await readFile(path.join(target, 'README.md'), 'utf8'), '');
    assert.deepEqual(await readdir(path.join(target, 'docs')), ['app-scripts.md']);
    assert.equal(
      await readFile(path.join(target, 'licenses/Apache-2.0.txt'), 'utf8'),
      'third-party license notice',
    );
    assert.match(
      await readFile(path.join(target, 'THIRD_PARTY_NOTICES.txt'), 'utf8'),
      /original license notice/,
    );
    assert.equal(
      await readFile(path.join(target, 'android/build.gradle'), 'utf8'),
      'base config\n',
    );
    assert.doesNotMatch(
      await readFile(path.join(target, 'pnpm-workspace.yaml'), 'utf8'),
      /patchedDependencies|allowUnusedPatches/,
    );
    assert.deepEqual(
      JSON.parse(await readFile(path.join(target, 'config/dependencies.json'), 'utf8')),
      { groups: { core: ['react'] } },
    );
    assert.deepEqual(await readdir(path.join(target, 'scripts')), ['run-flavor.mjs']);
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
      'AGENTS.md',
      'LICENSE',
      '.github',
      'tests/scripts',
      'config/dependency-audit.json',
      'firebase.json',
      'patches',
      'pnpm-lock.yaml',
    ]) {
      await assert.rejects(access(path.join(target, localFile)));
    }
    await assert.rejects(access(path.join(target, 'src/modules/media')));

    const pkg = JSON.parse(await readFile(path.join(target, 'package.json'), 'utf8'));

    assert.deepEqual(pkg.dependencies, { react: '1.0.0' });
    assert.equal(pkg.scripts['create-app'], undefined);
    assert.equal(pkg.scripts['ios:services'], undefined);
    assert.equal(pkg.scripts.verify, 'pnpm typecheck && pnpm lint && pnpm test');
    assert.equal(
      JSON.parse(await readFile(path.join(source, 'starter.config.json'), 'utf8')).name,
      fixtureName,
    );
    await assert.rejects(createApp(args), /already exists/);
    await createApp({ ...args, target: customTarget, modules: 'media,firebase' });
    assert.deepEqual((await readdir(path.join(customTarget, 'docs'))).sort(), [
      'app-firebase.md',
      'app-scripts.md',
    ]);
    assert.match(
      await readFile(path.join(customTarget, 'src/generated/bootstrap.ts'), 'utf8'),
      /require\(['"]@\/modules\/firebase\/background['"]\)/,
    );
    assert.match(
      await readFile(path.join(customTarget, 'src/generated/modules.ts'), 'utf8'),
      /from ['"]@\/modules\/media['"]/,
    );
    assert.equal(
      await readFile(path.join(customTarget, 'patches/fake-media.patch'), 'utf8'),
      'example patch',
    );
    assert.match(
      await readFile(path.join(customTarget, 'pnpm-workspace.yaml'), 'utf8'),
      /fake-media@1\.0\.0: patches\/fake-media\.patch/,
    );
    assert.match(
      await readFile(path.join(customTarget, 'android/build.gradle'), 'utf8'),
      /^media config\nbase config\n$/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
