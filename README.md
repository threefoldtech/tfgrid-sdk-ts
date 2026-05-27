# ZOS SDK TypeScript

![Version](https://img.shields.io/github/lerna-json/v/threefoldtech/tfgrid-sdk-ts/development?color=blue&label=version)
[![Lint](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/lint.yml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/lint.yml)
[![Build](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/build.yml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/build.yml)
[![Code Coverage](https://codecov.io/gh/threefoldtech/tfgrid-sdk-ts/branch/development/graph/badge.svg)](https://codecov.io/gh/threefoldtech/tfgrid-sdk-ts)

TypeScript client libraries and utilities for interacting with the ThreeFold Grid from Node.js and browser environments. This SDK supports deployment management, wallet operations, peer-to-peer messaging, and grid querying through modern TypeScript APIs.

## What this is

This repository contains the official TypeScript SDK for the ThreeFold Grid. It provides a collection of packages that allow JavaScript and TypeScript applications running in Node.js or the browser to interact with grid services. The SDK covers everything from low-level chain and message-bus clients to high-level grid deployment helpers and user-interface components.

## What this repository contains

- [stats](./packages/stats/README.md) — Grid statistics collection and reporting.
- [grid_client](./packages/grid_client/README.md) — Core client library for grid deployments and workload management.
- [grid_http_server](./packages/grid_http_server/README.md) — HTTP server exposing grid client operations over a REST-like interface.
- [grid_rmb_server](./packages/grid_rmb_server/README.md) — Server for handling Reliable Message Bus (RMB) communication.
- [rmb_direct_client](./packages/rmb_direct_client/README.md) — Direct client for the RMB peer-to-peer message layer.
- [rmb_peer_client](./packages/rmb_peer_client/README.md) — Peer client for RMB communication.
- [rmb_peer_server](./packages/rmb_peer_server/README.md) — Peer server for RMB communication.
- [Playground](./packages/playground/README.md) — Interactive web application for exploring and deploying grid workloads.
- [graphql_client](./packages/graphql_client/README.md) — Client for the grid GraphQL API.
- [gridproxy_client](./packages/gridproxy_client/README.md) — Client for the grid proxy API.
- [UI](./packages/UI/README.md) — Reusable UI components for grid dashboards.

## Role in the stack

The SDK serves as the primary application-layer interface for JavaScript and TypeScript projects targeting the ThreeFold Grid. It wraps Ledger Chain for on-chain operations, the grid proxy for node and contract queries, GraphQL for indexed data, and RMB for direct node communication. The packages in this repository power web-based dashboards, automation scripts, and backend Node.js services that need to provision or manage grid resources.

## Relation to ThreeFold

This technology is used within the ThreeFold ecosystem and was first deployed on the ThreeFold Grid. The component itself is designed as reusable infrastructure technology and should be understood by its technical function first, independent of any specific deployment.

## Ownership

This repository is owned and maintained by TF-Tech NV, a Belgian company responsible for the development and maintenance of this technology.

## Requirements

The main requirements are:

- [Node.js](https://nodejs.org/en) ^22.15.1
- [Lerna](https://lerna.js.org/) ^8.2.2

## Install

```bash
yarn install
```

> **Note:** If the used Python version is 3.12 or later, you need to install setuptools.

```bash
python3 -m pip install setuptools
```

## Build

```bash
yarn lerna run build
```

> If the build fails due to a memory issue, please use the following command

```bash
export NODE_OPTIONS="--max-old-space-size=8192"
```

## Related Documentations

- [Configure the editor/IDE](./docs/editor_config.md)
- [Pipelines documentation](./docs/workflows.md)
- [Release process](./docs/release.md)

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
Copyright (c) TF-Tech NV.
