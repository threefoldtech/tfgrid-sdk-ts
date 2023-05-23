# Client Configuration

## Query Client

it only requires the websocket url.

```ts
import { QueryClient } from "./src/client";

const cl = new QueryClient("wss://tfchain.dev.grid.tf");
await cl.connect();
const c = await cl.contracts.get(19530);
console.log(c);
cl.disconnect();
```

## Full Client

it requires:

- `url`: the tfchain websocket url
- `mnemonicOrSecret`: 12 words for your account or the hex secret seed.
- `keypairType`: the keypair types supported are sr25519 or ed25519. (default: sr25519)
- `extSigner`: signer object coming from the polkadot extension.

> **Note:** mnemonic or the extSigner can be used to sign transactions.

```ts
import { Client } from "./src/client";

const cl = new Client({ url: "wss://tfchain.dev.grid.tf", mnemonicOrSecret: "<your mnemonic>" });
await cl.connect();
const contract = await (await cl.contracts.createName("hamada")).apply();
console.log(contract);
await cl.disconnect();
```
