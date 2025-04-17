/**
 * @see https://prettier.io/docs/configuration
 */
export const prettierGlobalConfig = {
  semi: false,
  singleQuote: true,
  trailingComma: "all",
  printWidth: 70,
  tabWidth: 2,
  useTabs: false,
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "^@/components/(.*)$",
    "^@/hooks/(.*)$",
    "^@/assets/(.*)$",
    "^@/utils/(.*)$",
    "^@/types/(.*)$",
    "^../(.*)$",
    "^./(.*)$",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ["typescript", "decorators-legacy", "jsx"],
  overrides: [
    {
      files: ["*.json", "*.yaml", "*.yml"],
      options: {
        tabWidth: 2,
        useTabs: false,
      },
    },
  ],
};
