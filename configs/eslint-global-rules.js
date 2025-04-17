/**
 * @type {import("eslint").Linter.RulesRecord}
 */
export const eslintGlobalRules = {
  'prefer-const': 'error',
  'no-var': 'error',
  'eqeqeq': ['error', 'always'],
  'curly': ['error', 'multi-line', 'consistent'],
  '@typescript-eslint/explicit-function-return-type': 'off',
  "@typescript-eslint/no-unused-vars": [
    "warn", {
      "ignoreRestSiblings": true,
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
      "caughtErrorsIgnorePattern": "^_"
    }
  ],
  '@typescript-eslint/no-explicit-any': 'off',
  'consistent-return': 'off',
  'no-async-promise-executor': 'error',
}