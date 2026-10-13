import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const nodeFiles = [
  'services/api/**/*.mjs',
  'scripts/**/*.mjs',
  'tests/**/*.mjs',
  'apps/*/vite.config.mjs',
  'eslint.config.mjs',
];
const browserFiles = [
  'apps/commandmaps/src/**/*.{ts,tsx}',
  'apps/civicmaps-platform/src/**/*.{ts,tsx}',
];
export default [
  { ignores: ['**/node_modules/**', '**/dist/**', '_ds/**'] },
  {
    ...js.configs.recommended,
    files: nodeFiles,
    languageOptions: { globals: globals.node },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  ...tseslint.configs.recommended.map((config) => ({ ...config, files: browserFiles })),
  {
    files: browserFiles,
    languageOptions: { globals: globals.browser },
    // Enforce runtime Hooks contracts; React Compiler adoption is outside this Vite baseline.
    plugins: { 'react-hooks': hooks },
    rules: { 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'error' },
  },
];
