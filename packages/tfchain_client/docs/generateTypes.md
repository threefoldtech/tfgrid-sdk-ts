# Generating Chain Types

This guide covers the steps to generate chain types using `@polkadot/typegen` and how to use these generated types in this project.

## Process:

Inside tfchain_client directory run:

```bash
yarn generate-types -e <<CHAIN_URL>>
```

> replace `<<CHAIN_URL>>` with URL of the desired chain stack, e.g. `https://tfchain.dev.grid.tf/`
> This will update the metadata file `chainMeta.json`, generate types inside `interfaces/chain` and adjust the created types to be compatible with TypeScript compiler.

## Details:

- Generate a chain types requires `@polkadot/typegen` package of the same version as `@polkadot/api`.

### Generating

First we need to have chain metadata, to generate types based on it, this is done by running the following command:

```bash
curl -H "Content-Type: application/json" -d '{"id":"1", "jsonrpc":"2.0", "method": "state_getMetadata", "params":[]}' -o chainMeta.json <<CHAIN_URL>>
```

The result of this command will be `chainMeta.json` with a content like

```json
{ "jsonrpc": "2.0", "result": "0x6d6574610b6c185379737....", "id": 29 }
```

This file will be used in the following two commands:

- Generate defined chain types and lookup files using `polkadot-types-from-defs `
  ```bash
  ts-node --skip-project node_modules/.bin/polkadot-types-from-defs --package @threefold/tfchain_client  --input ./src/interfaces/chain --endpoint ./chainMeta.json
  ```
  > Currently we don't have defined types but this command needed to crate the lookup files, for more details see the [documentation](https://polkadot.js.org/docs/api/start/typescript.user/#definitions)
- Generate types from the chain using `polkadot-types-from-chain`
  ```bash
   ts-node --skip-project node_modules/.bin/polkadot-types-from-chain --endpoint ./chainMeta.json --output ./src/interfaces/chain
  ```

Now types are generated, but we need to let the compiler aware of the generated types, we can do that by add the following paths to `tsconfig-*.json` inside compilerOptions.paths add those lines:

```json
 "@polkadot/types/lookup": ["src/interfaces/chain/types-lookup.ts"],
 "@polkadot/api-augment*": ["src/interfaces/chain/augment-api.ts"]
```

Finally we need to export the generated types
in `src/interfaces/index.ts`

```ts
export * from "./chain/augment-api";
export * from "./chain/types-lookup";
export * from "./chain/lookup";
```

### Usage

We need to import the augmented definitions "somewhere" as documentation says, in our case we will import them in `src/client`.

```ts
import "./interfaces";
import "@polkadot/api-augment";
```

Now we can import any type anywhere in the client as follows:

```ts
// e.g SpRuntimeModuleError
import { SpRuntimeModuleError } from "@polkadot/types/lookup";
```

There are two blockers now from building the project:

1. As we din't have any defined types `src/interfaces/chain/types` is empty and will gives an error while build, for now we just need to export an empty object on it so we add `export {}` to the file.
2. Types with reserved names:
   In `src/interfaces/chain/augment-api-tx.ts` we have `createFarmingPolicy` and `updateFarmingPolicy` functions in tfgridmodule each of them contains parameter named `default` this is not acceptable on Typescript as it is a reserved word, so we could replace it with `_default`.

> All the previous steps are collected into `scripts/generateTypes.bash`

Now everything is ready to go
