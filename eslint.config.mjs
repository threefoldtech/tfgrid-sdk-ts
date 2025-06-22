import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import prettierPlugin from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";

// This returns an ARRAY of config objects optimized for Vue+TS
const vueTsGeneratedConfigs = defineConfigWithVueTs(pluginVue.configs["flat/recommended"], vueTsConfigs.recommended, {
  rules: {
    // --- OFF rules ---
    // TODO: enable this rule after https://github.com/threefoldtech/tfgrid-sdk-ts/issues/4075
    "@typescript-eslint/no-explicit-any": "off",
    "vue/no-v-text-v-html-on-component": "off",
    "vue/max-attributes-per-line": "off",
    "vue/no-v-html": "off",
    "vue/singleline-html-element-content-newline": "off",
    "vue/html-self-closing": "off",
    "vue/html-indent": "off",
    "vue/require-explicit-emits": "off",
    "vue/require-default-prop": "off",
    "@typescript-eslint/no-unused-expressions": "off",
    
    // --- WARN rules ---
    "@typescript-eslint/no-duplicate-enum-values": "warn",
    
    // --- ERROR rules ---
    "vue/multi-word-component-names": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "vue/no-template-shadow": "error",
    "vue/multiline-html-element-content-newline": "error",
    "vue/component-definition-name-casing": "error",
    "vue/no-dupe-keys": "error",
  },
});

// Ensure Vue config is applied last and only to .vue files
const vueConfig = vueTsGeneratedConfigs.map(config => ({
  ...config,
  files: ["**/*.vue"],
}));

export default [
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
        // Use a clean copy of globals to avoid any with whitespace
        ...Object.fromEntries(
          Object.entries({
            ...globals.browser,
            ...globals.es2021,
            ...globals.node,
          }).map(([key, value]) => [key.trim(), value]),
        ),
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      prettier: prettierPlugin,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      ...tseslint.configs.eslintRecommended.rules,

      // --- OFF rules ---
      "no-console": "off",
      "@typescript-eslint/no-var-requires": "off",
      // TODO: enable this rule after https://github.com/threefoldtech/tfgrid-sdk-ts/issues/4075
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-object-type": "off",

      // --- WARN rules ---
      "prettier/prettier": "warn",
      "prefer-spread": "warn",
      "@typescript-eslint/no-restricted-types": [
        "warn",
        {
          types: {
            "Function": "Use specific function types instead.",
            "Object": "Use `Record<string, unknown>` or specific object types instead.",
            "String": "Use `string` instead.",
            "Number": "Use `number` instead.",
            "Boolean": "Use `boolean` instead.",
          },
        },
      ],
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/no-wrapper-object-types": "warn",

      // --- ERROR rules ---
      "@typescript-eslint/no-unused-vars": "error",
      "simple-import-sort/imports": "error",
    },
  },
  ...vueConfig,
];
