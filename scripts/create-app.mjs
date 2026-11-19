import { parseArgs } from 'node:util';
import { readFile, writeFile, mkdir, stat, rm, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { copyTree } from './lib/files.mjs';
import { describeModules, selectModules, states } from './lib/starter-options.mjs';
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
  'dry-run': { type: 'boolean' },
  'skip-install': { type: 'boolean' },
  git: { type: 'boolean' },
  help: { type: 'boolean', short: 'h' },
  'list-modules': { type: 'boolean' },
  'list-states': { type: 'boolean' },
};
const help = `Create a React Native app with production, dev, and QA flavors.

Usage:
  pnpm create-app --name AcmeApp --android-id com.example.acme --target ../acme-app [options]

Required:
  --name <PascalCase>      React Native name and Xcode target name
  --android-id <id>        Production application ID, e.g. com.example.acme
  --target <folder>        Path to a new folder outside the template

Options:
  --slug <kebab-case>      Package name and base URL scheme. Defaults to a slug derived from --name
  --display-name <text>    Launcher name. Defaults to --name
  --ios-id <id>            Production bundle ID. Defaults to --android-id
  --modules <a,b|all>      Select modules. Core is always included and is the default
  --state <redux|zustand>  Select a state manager. Defaults to redux
  --git                   Initialize a Git repository in the new app
  --dry-run               Show the plan without writing files
  --skip-install          Skip dependency installation in the new app
  --list-modules          List available modules
  --list-states           List state manager options
  -h, --help              Show this help

Dev and QA add .dev and .qa to the production IDs.
See also: pnpm list:modules, pnpm list:states.`;
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
  const target = path.resolve(input.target);
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
  const modules = selectModules(catalog, input.modules ?? 'core', state);
  const plan = {
    ...input,
    source,
    target,
    modules,
    state,
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
  const { configureModules } = await import('./configure-modules.mjs');
  const staging = target + '.creating-' + process.pid;
  await mkdir(staging, { recursive: false });
  try {
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
    await copyTree(source, staging, transformPath, transformText);
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
      flavorServices: { dev: {}, qa: {} },
      services: {
        ...original.services,
        apiBaseUrl: 'https://example.invalid',
        firebase: false,
        sentryDsn: '',
        googleWebClientId: '',
        googleIosClientId: '',
        mapsAndroidKey: '',
        mapsIosKey: '',
      },
    };
    await writeFile(
      path.join(staging, 'starter.config.json'),
      JSON.stringify(next, null, 2) + '\n',
    );
    await writeFile(
      path.join(staging, 'app.json'),
      JSON.stringify({ name: input.name, displayName: input.displayName }, null, 2) + '\n',
    );
    // Artifact budgets belong to the new app's chosen ABI/module profile.
    const budgetPath = path.join(staging, 'config/size-budget.json');
    try {
      const budget = JSON.parse(await readFile(budgetPath, 'utf8'));
      budget.artifacts = {};
      await writeFile(budgetPath, JSON.stringify(budget, null, 2) + '\n');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const pkgPath = path.join(staging, 'package.json');
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
    pkg.name = input.slug;
    pkg.version = '0.1.0';
    delete pkg.repository;
    const chosen = new Set(modules.flatMap((name) => catalog.groups[name]));
    for (const dependency of Object.values(catalog.groups).flat())
      if (!chosen.has(dependency)) delete pkg.dependencies[dependency];
    await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    for (const name of Object.keys(catalog.groups))
      if (name !== 'core' && !modules.includes(name))
        await rm(path.join(staging, 'src/modules', name), { recursive: true, force: true });
    if (input.state === 'zustand') {
      delete pkg.dependencies['@reduxjs/toolkit'];
      delete pkg.dependencies['react-redux'];
      await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      await rm(path.join(staging, 'src/app/store/store.ts'), { force: true });
      await writeFile(
        path.join(staging, 'src/app/store/StateProvider.tsx'),
        await readFile(path.join(staging, 'config/presets/zustand-StateProvider.tsx'), 'utf8'),
      );
    }
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
    } else if (values['list-states']) {
      for (const [name, description] of Object.entries(states))
        console.log(`${name}: ${description}`);
    } else {
      if (!values.name || !values.target || !values['android-id'])
        throw new Error('Required: --name AppName --target ../app --android-id com.company.app');
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
