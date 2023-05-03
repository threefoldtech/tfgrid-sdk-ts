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
const cl = new QueryClient("wss://tfchain.dev.grid.tf");
await cl.connect();
const c = await cl.contracts.get(19530);
console.log(c);
cl.disconnect();
```

### Full Client

```ts
const cl = new Client("wss://tfchain.dev.grid.tf", "<your mnemonic>", "sr25519");
await cl.connect();
const contract = await cl.contracts.createName("hamada");
console.log(contract);
await cl.disconnect();
```

### Supported URLs

- [devnet](wss://tfchain.dev.grid.tf)
- [qanet](wss://tfchain.qa.grid.tf)
- [testnet](wss://tfchain.test.grid.tf)
- [mainnet](wss://tfchain.grid.tf)
