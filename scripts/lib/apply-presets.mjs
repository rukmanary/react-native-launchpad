import { rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function applyPresets(root, state, api, catalog) {
  const write = (file, contents) => writeFile(path.join(root, file), contents);
  const remove = (file) => rm(path.join(root, file), { recursive: true, force: true });

  if (catalog.states) {
    await write(
      'src/app/store/StateProvider.tsx',
      `export { StateProvider, useAppLanguage } from './presets/${state}';\n`,
    );
    for (const name of Object.keys(catalog.states)) {
      if (name !== state) await remove(`src/app/store/presets/${name}.tsx`);
    }
    if (state !== 'redux') await remove('src/app/store/store.ts');
    if (state !== 'zustand') await remove('src/modules/zustand');
    if (state !== 'recoil') await remove('tests/ui/recoil.test.tsx');
  }

  if (catalog.apis) {
    await write(
      'src/app/providers/ApiProvider.tsx',
      `export { ApiProvider, clearApiCache } from './presets/${api}';\n`,
    );
    await write(
      'src/features/catalog/api/products.ts',
      `export { useProducts } from './${api}';\n`,
    );
    for (const name of Object.keys(catalog.apis)) {
      if (name === api) continue;
      await remove(`src/app/providers/presets/${name}.tsx`);
      await remove(`src/features/catalog/api/${name}.ts`);
    }
    if (api !== 'graphql') {
      await remove('src/core/graphql');
      await remove('tests/core/graphql.test.ts');
    } else {
      await remove('src/app/providers/query.ts');
      await write('src/app/devtools/useApiDevTools.ts', 'export function useApiDevTools() {}\n');
    }
  }
}
