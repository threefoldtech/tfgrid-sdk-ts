# Configure the editor/IDE

We recommend [Visual Studio Code](https://code.visualstudio.com/) as it has many extensions that will help, there are some of them:

- [Vue Language Features](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

- `tfgrid_dashboard/.prettierrc`

  ```js
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
    "endOfLine": "auto",
    "svelteSortOrder": "options-scripts-markup-styles",
    "plugins": ["prettier-plugin-svelte"]
  }

  ```

- `tfgrid_dashboard/.prettierignore`

  ```txt
  # Ignore artifacts:
    charts
    index.yaml
    dist
    hub
  ```

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

Configuration files:

`tfgrid_dashboard/.eslintrc.js`

```js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["plugin:vue/essential", "eslint:recommended", "@vue/typescript/recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
  overrides: [
    {
      files: ["**/__tests__/*.{j,t}s?(x)", "**/tests/unit/**/*.spec.{j,t}s?(x)"],
      env: {
        jest: true,
      },
    },
  ],
};
```
