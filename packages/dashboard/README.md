# TFGrid Dashboard

![GitHub release (latest by date)](https://img.shields.io/github/v/release/threefoldtech/tfgrid_dashboard)
[![Build](https://github.com/threefoldtech/tfgrid_dashboard/actions/workflows/build.yml/badge.svg)](https://github.com/threefoldtech/tfgrid_dashboard/actions/workflows/build.yml)
[![Lint](https://github.com/threefoldtech/tfgrid_dashboard/actions/workflows/lint.yaml/badge.svg)](https://github.com/threefoldtech/tfgrid_dashboard/actions/workflows/lint.yaml)
[![Selenium _Tests](https://github.com/threefoldtech/tfgrid_dashboard/actions/workflows/Selenium.yaml/badge.svg)](https://github.com/threefoldtech/tfgrid_dashboard/actions/workflows/Selenium.yaml)
[![Cypress Tests](https://github.com/threefoldtech/tfgrid_dashboard/actions/workflows/Cypress.yaml/badge.svg)](https://github.com/threefoldtech/tfgrid_dashboard/actions/workflows/Cypress.yaml)

## Introduction

The Dashboard is a unified admin interface for everything related to Threefold Grid such as Portal, Explorer, Calculators, Zero-OS Bootstrap & Playground. For more details, check [Dashboard Manual](https://library.threefold.me/info/manual/#/manual__dashboard_readme)

## Getting Started

> For detailed information you can read the [Getting Started](./docs/getting_started.md) documentation.

- **Run Dashboard in Development mode**

```bash
yarn serve
```

- **Run Dashboard in Production mode**

```bash
yarn build
```

This will generate the production build in the `dist` directory, which can be served using [Caddy](https://caddyserver.com/) or [NGINX](https://www.nginx.com/)

## Testing

- The main testing tools used in Dashboard are

  - [Selenium](https://www.selenium.dev/) which is responsible for testing the functionality of the portal pages.
  - [Cypress](https://www.cypress.io/) which is responsible for testing the functionality of the explorer pages.

- How to run tests
  - [Selenium](./docs/selenium.md)
  - [Cypress](./docs/Cypress.md)
- How to write new tests

  Since all necessary files, such as configuration, base and utils files have already been created, creating additional tests is simple. All you need to do is create a new file with the same naming convention as the others and follow the instructions listed below, depending on the tool you plan to use.

  - [Selenium](https://www.selenium.dev/documentation/webdriver/getting_started/first_script/)
  - [Cypress](https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test)

## Related Documentations

- [Configure the editor/IDE](./docs/editor_config.md)
- [Contribution Guide](./docs/Contribution.md)
- [Dashboard documentation](https://library.threefold.me/info/manual/#/manual__dashboard_readme)
- [Pipelines documentation](./docs/workflows.md)
- [Release process](./docs/release.md)
