# Dashboard workflows

There are some pipliens to make sure everything work fine, here is an idea about them:

## [Build](/.github/workflows/build.yml)

On **Pull Request**, and **Push** to development branch: It will do a clean install of node dependencies, cache/restore them to make the process faster, and build the source code using `yarn build`.

## [Docker](/.github/workflows/Docker.yaml)

On **Push** to development branch, and on **Release** published: It will build and push a new docker image based on project release tag.<br>
The current VERSION (Which is passed by the Operations team) and GQL_URL environment variables will be propagated into the builds [build-env.sh](../scripts/build-env.sh), The values of those arguments could be as follows:

```js
GQL_URL =
  "https://graphql.dev.grid.tf/graphql" | "https://graphql.test.grid.tf/graphql" | "https://graphql.qa.grid.tf/graphql";
VERSION = "release tag or the first 7 chars of commit hash";
```

> NOTE: In case of release, the network used in GQL value follows the tag type by default, e.g. if the release tag contains qa so the network will be `"qa"` as well, also`"dev"` only works with **PUSH** to the development branch. Check [Releasing](./releasing.md#tags-type-based-on-network) section for more details about tag types

## [Lint](/.github/workflows/lint.yaml)

On **Pull Request**, and **Push** to development branch: It will check if the code formatted well using Eslint and Prettier.

## [Cypress](/.github/workflows/Cypress.yaml)

On **Workflow Dispath** to development branch: Runs daily for the last release and it will check if the code in Explorer passed the test cases using Cypress.

## [Selenium](/.github/workflows/Selenium.yaml)

On **Workflow Dispath** to development branch: Runs daily for the last release and it will check if the code in Portal passed the test cases using Selenium.
