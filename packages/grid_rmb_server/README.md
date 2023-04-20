# Twin server

[![Version](https://img.shields.io/npm/v/@threefold/grid_rmb_server?color=blue)](https://www.npmjs.com/package/@threefold/grid_rmb_server)
[![Lint](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/lint.yml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/lint.yml)
[![Build](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/build.yml/badge.svg)](https://github.com/threefoldtech/tfgrid-sdk-ts/actions/workflows/build.yml)

Twin server is an [RMB](https://github.com/threefoldtech/rmb-rs) server that exposes the functionality of the [grid client](../grid_client/README.md) over RMB.

## Prerequisites

- [Redis server](https://redis.io)
- [rmb-peer](https://github.com/threefoldtech/rmb-rs) should be installed and running

## Installation

### External Package

```bash
yarn add @threefold/grid_rmb_server
```

### Local Usage

- Clone the repository

```bash
git clone https://github.com/threefoldtech/tfgrid-sdk-ts.git
```

- Install it

```bash
yarn install
```

## Configuration

Add network and account's mnemonics in `config.json` in [server directory](./src/config.json) before running the server.

```json
{
  "network": "<network environment dev, qa or test>",
  "mnemonic": "<your account mnemonics>",
  "storeSecret": "secret", // secret used for encrypting/decrypting the values in tfkvStore
  "keypairType": "sr25519" // keypair type for the account created on substrate
}
```

## Life cycle

- User from the outside sends an execution request(command with payload) to the RMB server.
- RMB server puts this request in Redis.
- Twin server checks if there is an execution request that its command is registered on the Twin server.
- If this command is registered, the Twin server will pick up this request.
- Twin server starts to execute it using the Grid3 client.
- After finishing the execution, the Twin server puts the result back to Redis.
- RMB keeps checking for the result is ready, and sends it back to the user once it's ready.

## Running

### Locally

```bash
yarn start
```

### In External Package

```bash
yarn grid_rmb_server
```

You can also use another configuration file by using `--config` or `-c` option.

```bash
 yarn grid_rmb_server -c pathToConfigFile.json
 # or
 yarn grid_rmb_server --config pathToConfigFile.json
```

## Usage

This is an example of getting user's contracts.
Put the following content in a file `test_contracts.ts`

```ts
import { MessageBusClient } from "@threefold/rmb_peer_client";

async function main() {
  const myTwinId = 26;
  const cmd = "twinserver.contracts.listContractsByTwinId";
  const payload = JSON.stringify({ twinId: 26 });
  const rmb = new MessageBusClient();
  const requestId = await rmb.send(cmd, payload, myTwinId, 1);
  const result = await rmb.read(requestId, 1);
  console.log(result);
  rmb.disconnect();
}
main();
```

And then run this file by `yarn run ts-node test_contracts.ts`

see more examples in [modules](../grid_client/docs/module.md)
