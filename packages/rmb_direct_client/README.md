# RMB Direct Client

[![Version](https://img.shields.io/npm/v/@threefold/rmb_direct_client?color=blue)](https://www.npmjs.com/package/@threefold/rmb_direct_client)
[![Lint](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/lint.yml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/lint.yml)
[![Build](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/build.yml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/build.yml)

This is a `Typescript` client that can be used to build both **services**, and **clients**
that can talk over the `rmb`.

[RMB](https://github.com/threefoldtech/rmb-rs) is a message bus that enable secure
and reliable `RPC` calls across the globe.

This client can do the following:

- send requests over the distributed `rmb-relay`.
- receive and verify responses to sent requests.

An example of this client usage is defined under
[examples](examples/direct/node.ts).

## Built with

- Typescript

## Getting Started

To get a local copy up and running following these simple steps:

- Open Terminal
- Change the current working directory to the location you want the cloned directory.
- Enter the following:

```bash
git clone https://github.com/threefoldtech/tfgrid-sdk-ts.git
```

- Press Enter to create your local clone.

- Navigate to the cloned repository by running:

```bash
cd tfgrid-sdk-ts/packages/rmb_direct_client
```

- Then run the following to start the client:

```bash
yarn install
yarn workspace @threefold/rmb_direct_client start
```

## Prerequisites

- Node.js
- Git
- Yarn

## Contributors

Contributions, issues, and feature requests are welcome!

Feel free to check the [issues page](https://github.com/threefoldtech/tfgrid-sdk-ts/issues).
