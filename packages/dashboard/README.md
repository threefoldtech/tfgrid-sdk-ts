# TFGrid Dashboard

![Version](https://img.shields.io/github/package-json/v/threefoldtech/tfgrid-sdk-ts?color=blue&filename=packages%2Fdashboard%2Fpackage.json)
[![Build](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/dashboard_build.yaml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/dashboard_build.yaml)
[![Selenium](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/dashboard_selenium.yaml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/dashboard_selenium.yaml)
[![Cypress](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/dashboard_cypress.yaml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/dashboard_cypress.yaml)
[![Docker](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/dashboard_docker.yaml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/dashboard_docker.yaml)

## Introduction

The Dashboard is a unified admin interface for everything related to Threefold Grid such as Portal, Explorer, Calculators, Zero-OS Bootstrap & Playground. For more details, check [Dashboard Manual](https://manual.grid.tf/getstarted/TF_Dashboard/TF_Dashboard.html)

## Getting Started

> For detailed information you can read the [Getting Started](./docs/getting_started.md) documentation.

- **Run Dashboard in Development mode**

```bash
yarn workspace @threefold/dashboard serve
```

- **Run Dashboard in Production mode**

```bash
yarn workspace @threefold/dashboard build
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

- [Contribution Guide](./docs/Contribution.md)
- [Dashboard Documentation](https://manual.grid.tf/getstarted/TF_Dashboard/TF_Dashboard.html)
