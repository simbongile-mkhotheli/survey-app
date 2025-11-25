// Backend-specific ESLint overrides for Node.js server
import rootConfig from '../eslint.config.js';
import globals from 'globals';

export default [
  ...rootConfig,
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      // =========== Type Safety (Stricter for backend) ===========
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'warn',

      // =========== Code Quality ===========
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      'no-debugger': 'error',
      'arrow-body-style': ['warn', 'as-needed'],

      // =========== Backend-Specific ===========
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];
