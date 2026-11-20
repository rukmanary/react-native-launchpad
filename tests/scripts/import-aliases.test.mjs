import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';

test('app aliases preserve feature boundaries and replace relative imports', async () => {
  const eslint = new ESLint();
  const lint = async (filePath, specifier) => {
    const [result] = await eslint.lintText(`export { ProductListScreen } from '${specifier}';`, {
      filePath,
    });

    return result.messages.map(({ ruleId }) => ruleId);
  };

  assert.deepEqual(await lint('src/app/sample.ts', '@/features/catalog'), []);
  assert.deepEqual(
    await lint('src/features/catalog/index.ts', '@/features/catalog/screens/ProductListScreen'),
    [],
  );
  assert.deepEqual(
    await lint('src/app/sample.ts', '@/features/catalog/screens/ProductListScreen'),
    ['architecture/boundaries'],
  );
  assert.deepEqual(await lint('src/core/sample.ts', '@/features/catalog'), [
    'architecture/boundaries',
  ]);
  assert.deepEqual(await lint('src/app/sample.ts', '../features/catalog'), [
    'no-restricted-imports',
  ]);
});
