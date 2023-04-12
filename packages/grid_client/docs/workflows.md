# Grid Client workflows

There are some pipelines to make sure everything works fine, here is an idea about them:

## [Build](/.github/workflows/build.yml)

On **Pull Request**, and **Push** to development branch: It will do a clean install of node dependencies, cache/restore them to make the process faster, and build the source code using `yarn build`.

## [Publish](/.github/workflows/publish.yml)

On **Release**: It will do a clean install of node dependencies, cache/restore them to make the process faster, and build the source code using `yarn build` then publish the latest version to npm.

## [Lint](/.github/workflows/lint.yml)

On **Pull Request**, and **Push** to development branch: It will check if the code formatted well using Eslint.

## [Tests](/.github/workflows/tests.yml)

Runs daily for the last release and installs dependencies, runs tests and checks if tests passes or not.

## [Grid Nightly](/.github/workflows/grid3-nightly.yml)

Runs daily on all networks for the relevant release and it will check if the latest version runs without errors.
