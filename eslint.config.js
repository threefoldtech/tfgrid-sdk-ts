const tseslint = require("typescript-eslint");
const pluginVue = require("eslint-plugin-vue");
const prettierPlugin = require("eslint-plugin-prettier");
const simpleImportSort = require("eslint-plugin-simple-import-sort");
const globals = require("globals");

const { defineConfigWithVueTs, vueTsConfigs } = require("@vue/eslint-config-typescript");

// This returns an ARRAY of config objects optimized for Vue+TS
const vueTsGeneratedConfigs = defineConfigWithVueTs(pluginVue.configs["flat/recommended"], vueTsConfigs.recommended);

module.exports = [
  {
    ignores: [
      ".yarn/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/docs/**",
      "/packages/rmb_direct_client/lib/types/lib/**",
      "packages/stats/public/build/*",
      "*.config.*",
      "*global.css",
    ],
  },
  {
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parser: tseslint.parser,
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      prettier: prettierPlugin,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      ...tseslint.configs.eslintRecommended.rules,

      "no-console": "off",
      "prettier/prettier": "warn",
      "simple-import-sort/imports": "warn",

      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "prefer-spread": "warn",
      "@typescript-eslint/no-restricted-types": [
        "warn",
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
  ...vueTsGeneratedConfigs,
];
