/**
 * @type {import("eslint").Linter.RulesRecord}
 */
export const eslintGlobalRules = {
  'prefer-const': 'error',
  'no-var': 'error',
  'eqeqeq': ['error', 'always'],
  "@typescript-eslint/no-unused-vars": [
    "warn", {
      "ignoreRestSiblings": true,
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
      "caughtErrorsIgnorePattern": "^_"
    }
  ],
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
  'consistent-return': 'off',
  'no-async-promise-executor': 'error',
  'curly': 'error'
}