import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { eslintGlobalRules } from '@sokal_ai_generate/configs/eslint'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      ...eslintGlobalRules,
      'react-hooks/exhaustive-deps': 'off',
      'react/function-component-definition': 'off'
    },
  },
];

export default eslintConfig;
