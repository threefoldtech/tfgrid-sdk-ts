# Workflows

There are some pipelines to make sure everything works fine, here is an idea about them:

## [Build](/.github/workflows/build.yml)

On **Pull Request**, and **Push** to development branch: It will do a clean install of node dependencies, cache/restore them to make the process faster, and build the source code using `lerna run build`.

## [Publish](/.github/workflows/publish.yml)

On **Release**: It will do a clean install of node dependencies, cache/restore them to make the process faster, and build the source code using `lerna run build` then publish the latest version to npm. Also it build a docker image for grid client from the released version.

## [Lint](/.github/workflows/lint.yml)

On **Pull Request**, and **Push** to development branch: It will check if the code formatted well using Eslint and Prettier.

## [Grid Client Tests](/.github/workflows/grid_client_tests.yml)

Runs daily for the last code and installs dependencies, runs tests and checks if tests passes or not.

## [Grid Client Nightly](/.github/workflows/grid_client_nightly.yml)

Runs daily on all networks for the relevant release and it will check if the latest version runs without errors.

## [Dashboard Docker](/.github/workflows/dashboard_docker.yaml)

On **Release** published: It will build and push a new docker image based on project release tag.

The current VERSION (Which is passed by the Operations team) and GQL_URL environment variables will be propagated into the builds [build-env.sh](../packages/dashboard/scripts/build-env.sh), The values of those arguments could be as follows:

```bash
TFCHAIN_NETWORK = "dev | qa | test | main | custom";
VERSION = "release tag";
```

## [Dashboard Cypress](/.github/workflows/dashboard_cypress.yaml)

Runs daily for the last code and it will check if the code in Explorer passed the test cases using Cypress.

## [Selenium](/.github/workflows/dashboard_selenium.yaml)

Runs daily for the last code and it will check if the code in Portal passed the test cases using Selenium.
