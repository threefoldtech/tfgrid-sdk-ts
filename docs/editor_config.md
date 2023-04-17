# Configure the editor/IDE

We recommend [Visual Studio Code](https://code.visualstudio.com/) as it has many extensions that will help, there are some of them:

- [Vue Language Features](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- [Svelte 3 Snippets](https://marketplace.visualstudio.com/items?itemName=fivethree.vscode-svelte-snippets)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

  Configuration files:

  - `.prettierrc`

    ```json
    {
      "printWidth": 120,
      "tabWidth": 2,
      "useTabs": false,
      "semi": true,
      "singleQuote": false,
      "quoteProps": "as-needed",
      "jsxSingleQuote": false,
      "trailingComma": "all",
      "bracketSpacing": true,
      "arrowParens": "avoid",
      "endOfLine": "auto"
    }
    ```

  - `.prettierignore`

    ```txt
    # Ignore artifacts:
    build
    coverage
    weblets-chart
    dist
    charts
    index.yaml
    hub
    api
    ```

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

  Configuration files:

  - `.eslintrc.json`

    ```json
    {
      "root": true,
      "env": {
        "browser": true,
        "es2021": true,
        "node": true
      },
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:cypress/recommended",
        "prettier",
        "plugin:vue/essential",
        "eslint:recommended",
        "@vue/typescript/recommended"
      ],
      "parserOptions": {
        "parser": "@typescript-eslint/parser",
        "ecmaVersion": "latest",
        "sourceType": "module"
      },
      "plugins": ["@typescript-eslint", "prettier", "simple-import-sort", "svelte3"],
      "overrides": [
        {
          "files": ["*.svelte", "**/__tests__/*.{j,t}s?(x)", "**/tests/unit/**/*.spec.{j,t}s?(x)"],
          "processor": "svelte3/svelte3",
          "env": {
            "jest": true
          }
        }
      ],
      "rules": {
        "no-console": "off",
        "no-async-promise-executor": "off",
        "prettier/prettier": "warn",
        "@typescript-eslint/no-var-requires": "off",
        "simple-import-sort/imports": "error",
        "prefer-spread": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "vue/multi-word-component-names": "off",
        "vue/no-v-text-v-html-on-component": "off"
      },
      "settings": {
        "svelte3/typescript": true // load TypeScript as peer dependency
      },
      "ignorePatterns": [
        "**/node_modules/**",
        "**/dist/**",
        "**/docs/**",
        "/packages/rmb_direct_client/lib/types/lib/**",
        "packages/weblets/playground/public/build/elements/*",
        "*.config.*",
        "*global.css"
      ]
    }
    ```
