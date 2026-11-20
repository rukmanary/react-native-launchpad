import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';
import { parse, stringify } from 'yaml';

const projectRoots = new Set([
  '.gitignore',
  '.maestro',
  '.prettierignore',
  '.prettierrc.json',
  '.watchmanconfig',
  'android',
  'app.json',
  'App.tsx',
  'babel.config.js',
  'config',
  'docs',
  'eslint.config.mjs',
  'fastlane',
  'firebase.json',
  'Gemfile',
  'index.js',
  'ios',
  'jest.config.js',
  'licenses',
  'metro.config.js',
  'package.json',
  'patches',
  'pnpm-lock.yaml',
  'react-native.config.js',
  'scripts',
  'src',
  'tests',
  'tsconfig.json',
]);

const projectScripts = new Set([
  'scripts/brand.mjs',
  'scripts/check-native-alignment.mjs',
  'scripts/check-size.mjs',
  'scripts/configure-modules.mjs',
  'scripts/doctor.mjs',
  'scripts/e2e.mjs',
  'scripts/lib',
  'scripts/lib/eslint-architecture.mjs',
  'scripts/lib/module-selection.mjs',
  'scripts/optimize-assets.mjs',
  'scripts/run-flavor.mjs',
  'scripts/setup-maestro.mjs',
]);

const projectDocs = new Set(['docs/app-scripts.md', 'docs/app-firebase.md']);

const moduleFiles = {
  graphics: ['android/app/src/graphics'],
  notifications: ['android/app/src/main/res/drawable/ic_notification.xml'],
  firebase: [
    'firebase.json',
    'docs/app-firebase.md',
    'ios/Firebase',
    'ios/configure-firebase.sh',
    'scripts/setup-ios-services.rb',
  ],
};

export function projectFileFilter({ source, modules, state, patches, skipInstall }) {
  const adapters = new Set(modules.filter((name) => name !== 'core'));
  if (state === 'zustand') adapters.add('zustand');

  const excluded = new Set([
    'config/dependency-audit.json',
    'tests/scripts',
    ...(skipInstall ? ['pnpm-lock.yaml'] : []),
    ...Object.entries(moduleFiles).flatMap(([name, files]) =>
      modules.includes(name) ? [] : files,
    ),
  ]);
  if (!modules.some((name) => name === 'graphics' || name === 'notifications'))
    excluded.add('react-native.config.js');

  const patchFiles = new Set(Object.values(patches));
  return (file) => {
    const relative = path.relative(source, file).split(path.sep).join('/');
    const [directory, section, module] = relative.split('/');
    if (excluded.has(relative)) return false;
    if (!projectRoots.has(directory)) return false;
    if (directory === 'docs' && section) return projectDocs.has(relative);
    if (directory === 'scripts' && section)
      return projectScripts.has(relative) || relative === 'scripts/setup-ios-services.rb';
    if (directory === 'patches')
      return patchFiles.size > 0 && (!section || patchFiles.has(relative));
    if (directory === 'src' && section === 'modules')
      return module ? adapters.has(module) : adapters.size > 0;
    return true;
  };
}

export function configureProjectScripts(pkg, modules) {
  pkg.scripts ??= {};
  for (const name of [
    'create-app',
    'list:modules',
    'list:states',
    'list:apis',
    'dependencies:audit',
    'test:scripts',
  ])
    delete pkg.scripts[name];
  if (!modules.includes('firebase')) delete pkg.scripts['ios:services'];
  pkg.scripts.verify = 'pnpm typecheck && pnpm lint && pnpm test';
  for (const [name, flag] of [
    ['format', '--write'],
    ['format:check', '--check'],
  ])
    pkg.scripts[name] =
      `prettier ${flag} src scripts tests config docs README.md .maestro .prettierrc.json '*.{json,js,mjs,tsx,yaml}'`;
}

async function readOptional(root, file) {
  try {
    return await readFile(path.join(root, file), 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return '';
  }
}

export async function readProjectWorkspace(source, dependencies, modules) {
  const workspace = parse(await readOptional(source, 'pnpm-workspace.yaml')) ?? {};
  const patches = Object.fromEntries(
    Object.entries(workspace.patchedDependencies ?? {}).filter(([specifier]) =>
      Object.hasOwn(dependencies, specifier.slice(0, specifier.lastIndexOf('@'))),
    ),
  );
  delete workspace.allowUnusedPatches;
  if (Object.keys(patches).length) workspace.patchedDependencies = patches;
  else delete workspace.patchedDependencies;

  for (const [module, packages] of Object.entries({
    firebase: ['@firebase/util', 'protobufjs'],
    sentry: ['@sentry/cli'],
    chat: ['react-native-gifted-chat'],
  })) {
    if (!modules.includes(module))
      for (const name of packages) delete workspace.allowBuilds?.[name];
  }
  return { workspace, patches };
}

export async function writeProjectWorkspace(root, workspace) {
  await writeFormatted(path.join(root, 'pnpm-workspace.yaml'), stringify(workspace));
}

export async function writeProjectJson(root, relative, data) {
  await writeFormatted(path.join(root, relative), JSON.stringify(data));
}

async function writeFormatted(file, contents) {
  const formatted = await format(contents, { ...(await resolveConfig(file)), filepath: file });
  await writeFile(file, formatted);
}

export async function writeProjectNotices(source, root, patches) {
  const license = await readOptional(source, 'LICENSE');
  const notices = await readOptional(source, 'THIRD_PARTY_NOTICES.txt');
  const sections = notices.trim().split(/\n\n(?=[^\n]+\n-+\n)/);
  const selected = sections.filter((section) => {
    const match = /^([^\s]+) \(upstream excerpts in patches\/\)\n/.exec(section);
    return !match || Object.hasOwn(patches, match[1]);
  });

  if (license)
    selected.splice(1, 0, 'Starter template source\n-----------------------\n\n' + license.trim());
  if (license || notices)
    await writeFile(
      path.join(root, 'THIRD_PARTY_NOTICES.txt'),
      selected.join('\n\n').trim() + '\n',
    );
}
