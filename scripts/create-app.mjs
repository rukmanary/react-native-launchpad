import { parseArgs } from 'node:util';
import { readFile, writeFile, mkdir, stat, rm, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { copyTree } from './lib/files.mjs';
import { applyPresets } from './lib/apply-presets.mjs';
import { selectModules } from './lib/module-selection.mjs';
import { apis, describeModules, states } from './lib/starter-options.mjs';
import flavors from '../config/flavors.json' with { type: 'json' };

const root = fileURLToPath(new URL('..', import.meta.url));
const options = {
  name: { type: 'string' },
  slug: { type: 'string' },
  'display-name': { type: 'string' },
  'android-id': { type: 'string' },
  'ios-id': { type: 'string' },
  target: { type: 'string' },
  modules: { type: 'string' },
  state: { type: 'string' },
  api: { type: 'string' },
  'dry-run': { type: 'boolean' },
  'skip-install': { type: 'boolean' },
  git: { type: 'boolean' },
  help: { type: 'boolean', short: 'h' },
  'list-modules': { type: 'boolean' },
  'list-states': { type: 'boolean' },
  'list-apis': { type: 'boolean' },
};
const help = `Create a React Native app with production, dev, and QA flavors.

Usage:
  pnpm create-app --name AcmeApp --android-id com.example.acme [options]

Required:
  --name <PascalCase>      React Native name and Xcode target name
  --android-id <id>        Production application ID, e.g. com.example.acme

Options:
  --target <folder>        Path to a new folder. Defaults to a sibling of the template named after the slug
  --slug <kebab-case>      Package name and base URL scheme. Defaults to a slug derived from --name
  --display-name <text>    Launcher name. Defaults to --name
  --ios-id <id>            Production bundle ID. Defaults to --android-id
  --modules <a,b|all>      Select modules. Core is always included and is the default
  --state <name>          Select redux, zustand, mobx, or recoil. Defaults to redux
  --api <rest|graphql>    Select the API technology. Defaults to rest
  --git                   Initialize a Git repository in the new app
  --dry-run               Show the plan without writing files
  --skip-install          Leave dependency installation and lockfile creation for later
  --list-modules          List available modules
  --list-states           List state manager options
  --list-apis             List API options
  -h, --help              Show this help

Dev and QA add .dev and .qa to the production IDs.
See also: pnpm list:modules, pnpm list:states, pnpm list:apis.`;
export function validateIdentity(input) {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(input.name))
    throw new Error('name must start uppercase and contain only letters/numbers');
  if (!/^[a-z][a-z0-9-]*$/.test(input.slug)) throw new Error('slug must be lowercase kebab-case');
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$/.test(input.androidId))
    throw new Error('androidId must contain at least three lowercase identifier segments');
  if (!/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*){2,}$/.test(input.iosId))
    throw new Error(
      'iosId must contain at least three lowercase bundle identifier segments without underscores',
    );
  if (!input.displayName.trim() || /[<>&"\\\n\r]/.test(input.displayName))
    throw new Error('displayName contains unsupported XML characters');
  return input;
}
export async function createApp(input) {
  validateIdentity(input);
  const source = path.resolve(input.source ?? root);
  const target = path.resolve(input.target ?? path.join(path.dirname(source), input.slug));
  if (
    target === source ||
    target.startsWith(source + path.sep) ||
    source.startsWith(target + path.sep)
  )
    throw new Error('Target must be outside the template directory');
  try {
    await stat(target);
    throw new Error('Target already exists');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const original = JSON.parse(await readFile(path.join(source, 'starter.config.json'), 'utf8'));
  const catalog = JSON.parse(await readFile(path.join(source, 'config/dependencies.json'), 'utf8'));
  const state = input.state ?? 'redux';
  const api = input.api ?? 'rest';
  if (!Object.hasOwn(states, state)) throw new Error('Unknown state preset. Run pnpm list:states.');
  if (!Object.hasOwn(apis, api)) throw new Error('Unknown API preset. Run pnpm list:apis.');
  const modules = selectModules(catalog, input.modules ?? 'core');
  const plan = {
    ...input,
    source,
    target,
    modules,
    state,
    api,
    variants: Object.fromEntries(
      Object.entries(flavors).map(([name, flavor]) => [
        name,
        {
          androidId: input.androidId + flavor.suffix,
          iosId: input.iosId + flavor.suffix,
          displayName: input.displayName + flavor.label,
          scheme: input.slug + flavor.suffix,
        },
      ]),
    ),
    gitHistory: 'excluded',
    credentials: 'excluded',
  };
  if (input.dryRun) return plan;
  const [
    { configureModules },
    { pruneNativeModules },
    {
      configureProjectScripts,
      projectFileFilter,
      readProjectWorkspace,
      writeProjectJson,
      writeProjectNotices,
      writeProjectWorkspace,
    },
  ] = await Promise.all([
    import('./configure-modules.mjs'),
    import('./lib/prune-native-modules.mjs'),
    import('./lib/project-files.mjs'),
  ]);
  const staging = target + '.creating-' + process.pid;
  await mkdir(staging, { recursive: false });
  try {
    const pkg = JSON.parse(await readFile(path.join(source, 'package.json'), 'utf8'));
    const selectedPackages = new Set([
      ...modules.flatMap((name) => catalog.groups[name]),
      ...(catalog.states?.[state] ?? []),
      ...(catalog.apis?.[api] ?? []),
    ]);
    for (const dependency of [catalog.groups, catalog.states, catalog.apis].flatMap((group) =>
      Object.values(group ?? {}).flat(),
    )) {
      if (!selectedPackages.has(dependency)) delete pkg.dependencies[dependency];
    }
    if (state !== 'redux') delete pkg.devDependencies?.['@rozenite/redux-devtools-plugin'];
    if (api !== 'rest') delete pkg.devDependencies?.['@rozenite/tanstack-query-plugin'];
    if (!modules.includes('offline')) {
      delete pkg.devDependencies?.['@babel/plugin-proposal-decorators'];
      delete pkg.devDependencies?.['@babel/plugin-transform-class-properties'];
    }
    delete pkg.devDependencies?.yaml;
    pkg.name = input.slug;
    pkg.version = '0.1.0';
    delete pkg.repository;
    configureProjectScripts(pkg, modules);
    const { workspace, patches } = await readProjectWorkspace(source, pkg.dependencies, modules);
    const shouldCopy = projectFileFilter({
      source,
      modules,
      state,
      patches,
      skipInstall: input.skipInstall,
    });
    const transformPath = (value) =>
      staging +
      path.sep +
      value
        .slice(staging.length + 1)
        .replaceAll(original.name, input.name)
        .replaceAll(
          path.join(...original.androidId.split('.')),
          path.join(...input.androidId.split('.')),
        );
    const transformText = (text, file) => {
      if (file === path.join(staging, 'pnpm-lock.yaml')) return text;
      const values = new Map([
        ['org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)', input.iosId],
        [
          original.androidId,
          file.includes(path.sep + 'ios' + path.sep) ? input.iosId : input.androidId,
        ],
        [original.name, input.name],
        [original.slug, input.slug],
        [original.scheme, input.slug],
      ]);
      if (original.displayName) values.set(original.displayName, input.displayName);
      if (original.iosId !== original.androidId) values.set(original.iosId, input.iosId);
      // Replace original tokens in one pass; never replace text inserted by a previous replacement.
      const tokens = [...values.keys()].sort((a, b) => b.length - a.length);
      let result = '';
      let cursor = 0;
      while (cursor < text.length) {
        const token = tokens.find((value) => text.startsWith(value, cursor));
        if (token) {
          result += values.get(token);
          cursor += token.length;
        } else {
          result += text[cursor];
          cursor++;
        }
      }
      return result;
    };
    await copyTree(source, staging, { shouldCopy, transformPath, transformText });
    await writeFile(path.join(staging, 'README.md'), '');
    await writeProjectWorkspace(staging, workspace);
    await writeProjectNotices(source, staging, patches);
    const next = {
      ...original,
      name: input.name,
      slug: input.slug,
      displayName: input.displayName,
      androidId: input.androidId,
      iosId: input.iosId,
      scheme: input.slug,
      modules,
      state,
      api,
      flavorServices: { dev: {}, qa: {} },
      services: {
        apiBaseUrl: 'https://example.invalid',
        ...(api === 'graphql' ? { graphqlUrl: 'https://example.invalid/graphql' } : {}),
        ...(modules.includes('firebase') ? { firebase: false } : {}),
        ...(modules.includes('sentry') ? { sentryDsn: '' } : {}),
        ...(modules.includes('google') ? { googleWebClientId: '', googleIosClientId: '' } : {}),
        ...(modules.includes('location') ? { mapsAndroidKey: '', mapsIosKey: '' } : {}),
      },
    };
    await writeProjectJson(staging, 'starter.config.json', next);
    await writeProjectJson(staging, 'app.json', {
      name: input.name,
      displayName: input.displayName,
    });
    // Artifact budgets belong to the new app's chosen ABI/module profile.
    const budgetPath = path.join(staging, 'config/size-budget.json');
    try {
      const budget = JSON.parse(await readFile(budgetPath, 'utf8'));
      budget.artifacts = {};
      await writeProjectJson(staging, 'config/size-budget.json', budget);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    await writeProjectJson(staging, 'package.json', pkg);
    const groups = Object.fromEntries(modules.map((name) => [name, catalog.groups[name]]));
    await writeProjectJson(staging, 'config/dependencies.json', { groups });
    await applyPresets(staging, state, api, catalog);
    await pruneNativeModules(staging, next.name, modules);
    await configureModules(staging, modules, { writeConfig: false });
    await rename(staging, target);
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }
  if (!input.skipInstall) {
    const result = spawnSync('pnpm', ['install', '--no-frozen-lockfile'], {
      cwd: target,
      stdio: 'inherit',
    });
    if (result.status !== 0)
      throw new Error(
        'Project created; dependency installation failed. Retry pnpm install inside target.',
      );
  }
  if (input.git) {
    const result = spawnSync('git', ['init'], { cwd: target, stdio: 'inherit' });
    if (result.status !== 0) throw new Error('Project created; git init failed.');
  }
  return plan;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options });
    if (values.help) {
      console.log(help);
    } else if (values['list-modules']) {
      const catalog = JSON.parse(
        await readFile(path.join(root, 'config/dependencies.json'), 'utf8'),
      );
      const { dependencies } = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
      console.log(describeModules(catalog, dependencies));
      console.log('\nUse --modules core,ui,media or --modules all.');
    } else if (values['list-states'] || values['list-apis']) {
      for (const [name, description] of Object.entries(values['list-states'] ? states : apis))
        console.log(`${name}: ${description}`);
    } else {
      if (!values.name || !values['android-id'])
        throw new Error('Required: --name AppName --android-id com.company.app');
      const slug = values.slug ?? values.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      const plan = await createApp({
        name: values.name,
        slug,
        displayName: values['display-name'] ?? values.name,
        androidId: values['android-id'],
        iosId: values['ios-id'] ?? values['android-id'],
        target: values.target,
        modules: values.modules,
        state: values.state,
        api: values.api,
        dryRun: values['dry-run'],
        skipInstall: values['skip-install'],
        git: values.git,
      });
      console.log(JSON.stringify(plan, null, 2));
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
