# Playground

![Version](https://img.shields.io/github/package-json/v/threefoldtech/tfgrid-sdk-ts?color=blue&filename=packages%2Fplayground%2Fpackage.json)
[![Build](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/playground_build.yml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/playground_build.yml)
[![CD](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/playground_cd.yml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/playground_cd.yml)
[![Docker](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/playground_docker.yml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/playground_docker.yml)

## Introduction

Playground is a front-end application that helps with deploying solutions on TF Grid v3. A weblet is a compiled javascript web component which can be embedded in HTML page of a web app. The backend for the playground is introduced with [grid client](https://manual.grid.tf/javascript/grid3_javascript_readme.html) which communicate to TF Chain and TF Grid over RMB.

Playground is a svelte project for creating web components - which are reusable custom elements with their functionality encapsulated away from the rest of the code — that interact with TF Grid 3 and could be utilized from other web apps.
It solves such problem where you had to write complex HTML (and associated style and script) to render custom UI controls (eg, to deploy some workload on the TF Grid 3), and how using them multiple times in different projects can be a miss if you are not careful.

## Installation

- **Prerequisite**

  - Nodejs 16^
  - yarn

  > For troubleshooting please checkout this file [troubleshooting](./docs/config.md)

- **Clone the repository**

  ```bash
  git clone https://github.com/threefoldtech/tfgrid-sdk-ts.git
  ```

## Getting Started

> For detailed information you can read the [Getting Started](./docs/getting_started.md) documentation.

- **Run playground in Development mode**

```bash
yarn workspace @threefold/playground dev
```

- **Run playground in Production mode**

```bash
yarn workspace @threefold/playground build
```

This will generate the production build in the `dist` directory, which can be served using [Caddy](https://caddyserver.com/) or [NGINX](https://www.nginx.com/)

You can run the playground in different modes. by editing the config file in `playground/src/config.js`
For an automated generation of the config file you can use the script `build-env` in `scripts/` it will generate the config file based on your env-vars.

```bash
cd packages/playground/public
bash ../../scripts/build-env.sh
```

More illustration on the build-env script [here](docs/build.md)

## Related Documentations

- [Contributing Guide](./docs/contributing.md)
- [playground Documentation](https://manual.grid.tf/weblets/weblets_home.html)
- [Troubleshooting](./docs/config.md)
