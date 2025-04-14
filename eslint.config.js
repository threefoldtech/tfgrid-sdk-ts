const eslint = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");
const prettierPlugin = require("eslint-plugin-prettier");
const simpleImportSort = require("eslint-plugin-simple-import-sort");
const cypressPlugin = require("eslint-plugin-cypress");
const vuePlugin = require("eslint-plugin-vue");
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
      vue: vuePlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...vuePlugin.configs.essential.rules,
      "no-console": "off",
      "no-async-promise-executor": "off",
      "prettier/prettier": "warn",
      "@typescript-eslint/no-var-requires": "off",
      "simple-import-sort/imports": "error",
      "prefer-spread": "off",

      "@typescript-eslint/no-explicit-any": "off",
      "vue/multi-word-component-names": "off",
      "vue/no-v-text-v-html-on-component": "off",
      "@typescript-eslint/no-empty-function": "off",
      "vue/no-v-for-template-key": "off",
      "vue/no-multiple-template-root": "off",
      "vue/no-v-model-argument": "off",
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
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-unsafe-function-type": "error",
      "@typescript-eslint/no-wrapper-object-types": "error",
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
