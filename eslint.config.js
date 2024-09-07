import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import jsdoc from 'eslint-plugin-jsdoc'
import n from 'eslint-plugin-n'

/** @type {import('typescript-eslint').ConfigWithExtends} */
const tseslintConfig = {
  languageOptions: {
    parser: tseslint.parser,
    sourceType: 'module',
    parserOptions: {
      project: './tsconfig.json',
    },
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.es2021,
    },
  },
  files: ['**/*.ts'],
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    import: importPlugin,
    jsdoc: jsdoc,
    n: n,
  },
  extends: [eslint.configs.recommended, ...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked, jsdoc.configs['flat/recommended']],
  rules: {
    'jsdoc/no-undefined-types': 'off',
    'jsdoc/valid-types': 'off',
    '@typescript-eslint/non-nullable-type-assertion-style': 'warn',
    '@typescript-eslint/no-dynamic-delete': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
}

export default tseslint.config(tseslintConfig)
