import { architecture } from './scripts/lib/eslint-architecture.mjs';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
export default ts.config(
  { ignores: ['node_modules/**', 'android/**', 'ios/**', 'coverage/**', 'modules/**'] },
  {
    files: ['src/app/App.tsx', 'src/app/store/store.ts', 'src/generated/bootstrap.ts'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ['src/app/App.tsx', 'src/app/store/store.ts', 'src/generated/bootstrap.ts'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
        AbortSignal: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        __DEV__: 'readonly',
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': hooks, architecture },
    rules: {
      ...hooks.configs.recommended.rules,
      'architecture/boundaries': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/*/screens/*', '**/features/*/api/*', '**/features/*/model/*'],
              message: 'Use the feature public API.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/{core,shared}/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: ['**/features/**', '**/app/**'] }] },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: ['**/app/**'] }] },
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
);
