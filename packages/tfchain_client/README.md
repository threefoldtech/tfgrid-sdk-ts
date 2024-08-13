# tfchain_client

This a Typescript client to communicate with TFChain.

## Installation

```bash
yarn install
```

## Building

```bash
yarn build
```

## Usage

there are 2 types of client. one for just query the chain and the other one for query and do transaction on the chain.

### Query Client

```ts
import { QueryClient } from "./src/client";

const cl = new QueryClient("wss://tfchain.dev.grid.tf");
await cl.connect();
const c = await cl.contracts.get(19530);
console.log(c);
cl.disconnect();
```

### Full Client

```ts
import { Client } from "./src/client";

const cl = new Client({ url: "wss://tfchain.dev.grid.tf", mnemonicOrSecret: "<your mnemonic>" });
await cl.connect();
const contract = await (await cl.contracts.createName("hamada")).apply();
console.log(contract);
await cl.disconnect();
```

### Supported URLs

- [devnet](wss://tfchain.dev.grid.tf)
- [qanet](wss://tfchain.qa.grid.tf)
- [testnet](wss://tfchain.test.grid.tf)
- [mainnet](wss://tfchain.grid.tf)

### TFChain Errors

The `TFChainError` class encapsulates error information specific to TFChain operations. This class, along with the `TFChainErrorWrapper`, facilitates detailed and user-friendly error handling and messaging.

#### TFChainError

The `TFChainError` class is designed to capture and throw detailed error information.
This class includes fields for the error `message`, `key`, `section`, `method`, `arguments`, and `documentation`.
The TFChainError class extends the native JavaScript Error class, providing a structured way to handle errors in the TFChain context.

#### TFChainErrorWrapper

The `TFChainErrorWrapper` class processes `DispatchError` and other errors, throwing `TFChainError` with relevant details. This wrapper class ensures that all types of errors encountered during `TFChain` operations are appropriately captured and detailed error messages are thrown

#### How to use it

When you encounter an error during `TFChain` operations, you can use the `TFChainError` to process and throw detailed errors:

```ts
try {
  // Perform some TFChain operation
} catch (error) {
  throw new TFChainError({
    message: `Error message.`,
  });
}
```
