const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");
const vue = require("eslint-plugin-vue");
const prettierPlugin = require("eslint-plugin-prettier");
const simpleImportSort = require("eslint-plugin-simple-import-sort");
const cypressPlugin = require("eslint-plugin-cypress");
const globals = require("globals");

module.exports = [
  {
    files: ["**/*.{js,ts,tsx,vue}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parser: tsparser,
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettierPlugin,
      "simple-import-sort": simpleImportSort,
      cypress: cypressPlugin,
      vue,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...vue.configs.essential.rules,

      "no-console": "off",
      "prettier/prettier": "warn",
      "simple-import-sort/imports": "warn",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-restricted-types": [
        "error",
        {
          types: {
            "{}": "Use `unknown` instead.",
            Function: "Use specific function types instead.",
            Object: "Use `Record<string, unknown>` or specific object types instead.",
            String: "Use `string` instead.",
            Number: "Use `number` instead.",
            Boolean: "Use `boolean` instead.",
          },
        },
      ],
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/no-wrapper-object-types": "warn",
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/docs/**",
      "/packages/rmb_direct_client/lib/types/lib/**",
      "packages/stats/public/build/*",
      "*.config.*",
      "*global.css",
    ],
  },
];
