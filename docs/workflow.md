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
