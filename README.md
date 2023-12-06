# tfgrid-sdk-ts

![Version](https://img.shields.io/github/lerna-json/v/threefoldtech/tfgrid-sdk-ts/development?color=blue&label=version)
[![Lint](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/lint.yml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/lint.yml)
[![Build](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/build.yml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/build.yml)
[![Code Coverage](https://codecov.io/gh/threefoldtech/tfgrid-sdk-ts/branch/development/graph/badge.svg)](https://codecov.io/gh/threefoldtech/tfgrid-sdk-ts)

This repo contains the typescript clients and projects for Threefold grid.

## Packages

- [dashboard](./packages/dashboard/README.md)
- [weblets](./packages/weblets/README.md)
- [stats](./packages/stats/README.md)
- [grid client](./packages/grid_client/README.md)
- [grid http server](./packages/grid_http_server/README.md)
- [grid rmb server](./packages/grid_rmb_server/README.md)
- [rmb direct client](./packages/rmb_direct_client/README.md)
- [rmb peer client](./packages/rmb_peer_client/README.md)
- [rmb peer server](./packages/rmb_peer_server/README.md)
- [Playground](./packages/playground/README.md)
- [graphql_client](./packages/graphql_client/README.md)
- [gridproxy_client](./packages/gridproxy_client/README.md)
- [UI](./packages/UI/README.md)

## Requirements

The main requirements are:

- [Node.js](https://nodejs.org/en) ^18
- [Lerna](https://lerna.js.org/) 7.1.1

## Install

```bash
yarn install
```

## Build

```bash
yarn lerna run build
```

## Related Documentations

- [Configure the editor/IDE](./docs/editor_config.md)
- [Pipelines documentation](./docs/workflows.md)
- [Release process](./docs/release.md)
