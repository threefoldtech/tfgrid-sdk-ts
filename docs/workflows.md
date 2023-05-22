# Workflows

There are some pipelines to make sure everything works fine, here is an idea about them:

## Grid Clients

### [Build](/.github/workflows/build.yml)

On **Pull Request**, and **Push** to development branch: It will do a clean install of node dependencies, cache/restore them to make the process faster, and build the source code using `lerna run build --no-private`.

### [Publish](/.github/workflows/publish.yml)

On **Release**: It will do a clean install of node dependencies, cache/restore them to make the process faster, and build the source code using `lerna run build --no-private` then publish the latest version to npm. Also it build a docker image for grid client from the released version.

### [Lint](/.github/workflows/lint.yml)

On **Pull Request**, and **Push** to development branch: It will check if the code formatted well using Eslint and Prettier.

### [Grid Client Tests](/.github/workflows/grid_client_tests.yml)

Runs daily for the last code and installs dependencies, runs tests and checks if tests passes or not.

### [Grid Client Nightly](/.github/workflows/grid_client_nightly.yml)

Runs daily on all networks for the relevant release and it will check if the latest version runs without errors.

## Dashboard

### [Build](/.github/workflows/dashboard_build.yaml)

On **Pull Request**, and **Push** to development branch that has changes in the dashboard package: It will do a clean install of node dependencies, cache/restore them to make the process faster, and build the source code using `yarn workspace @threefold/dashboard build`.

### [Docker](/.github/workflows/dashboard_docker.yaml)

On **Release** published: It will build and push a new docker image based on project release tag.

The current VERSION (Which is passed by the Operations team) and GQL_URL environment variables will be propagated into the builds [build-env.sh](../packages/dashboard/scripts/build-env.sh), The values of those arguments could be as follows:

```bash
TFCHAIN_NETWORK = "dev | qa | test | main | custom";
VERSION = "release tag";
```

### [Cypress](/.github/workflows/dashboard_cypress.yaml)

Runs daily for the last code and it will check if the code in Explorer passed the test cases using Cypress.

### [Selenium](/.github/workflows/dashboard_selenium.yaml)

Runs daily for the last code and it will check if the code in Portal passed the test cases using Selenium.

## Weblets

### [Build](/.github/workflows/weblets_build.yaml)

On **Pull Request**, and **Push** to development branch that has changes in the weblets package: It will do a clean install of node dependencies, cache/restore them to make the process faster, and build the source code using `yarn build:app`.

### [Docker](/.github/workflows/weblets_docker.yml)

On **Release** published: It will build and push a new docker image based on project release tag.

We are using _VERSION_, and _NETWORK_ arguments in this workflow that will be propagated into the builds [config](/packages/weblets/scripts/build-env.sh), The values of those arguments could be as follows:

```js
NETWORK = "dev" | "qa" | "test" | "main" (default: dev)
VERSION = "release tag or the first 7 chars of commit hash"
```

### [CD](/.github/workflows/weblets_cd.yml)

On **Push** to development branch: It will do a clean install of node dependencies, cache/restore them, build the source code and deploy to staging server by Copying the artifacts using ssh to `play.dev.grid.tf`.

### [Cypress](/.github/workflows/weblets_cypress.yaml)

Runs daily for the last code and it will check if the code passed the test cases using Cypress.

## Playground

### [Build](/.github/workflows/playground_build.yml)

On **Pull Request**, and **Push** to development branch that has changes in the playground package: It will do a clean install of node dependencies, cache/restore them to make the process faster, and build the source code using `yarn build`.

### [Docker](/.github/workflows/playground_docker.yml)

On **Release** published: It will build and push a new docker image based on project release tag.

We are using _VERSION_, and _NETWORK_ arguments in this workflow that will be propagated into the builds [config](/packages/playground/scripts/build-env.sh), The values of those arguments could be as follows:

```js
NETWORK = "dev" | "qa" | "test" | "main" (default: dev)
VERSION = "release tag or the first 7 chars of commit hash"
```

### [CD](/.github/workflows/playground_cd.yml)

On **Push** to development branch: It will do a clean install of node dependencies, cache/restore them, build the source code and deploy to staging server by Copying the artifacts using ssh to `play.dev.grid.tf`.

## Stats

### [Build](/.github/workflows/stats_build.yaml)

On **Pull Request**, and **Push** to development branch that has changes in the stats package: It will do a clean install of node dependencies, cache/restore them to make the process faster, and build the source code using `yarn workspace @threefold/stats build`.

### [Docker](/.github/workflows/stats_docker.yaml)

On **Release** published: It will build and push a new docker image based on project release tag.
