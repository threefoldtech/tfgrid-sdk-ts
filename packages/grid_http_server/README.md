# Http server

Http server is an express http server that exposes the functionality of the grid3 client over http requests.

## Installation

```bash
yarn install @threefold/grid_http_server
```

## Configuration

Add network and account's mnemonics in `config.json` in [server directory](./src/config.json) before running the server.

```json
{
    "network": "<network environment dev, qa or test>",
    "mnemonic": "<your account mnemonics>",
    "storeSecret": "", // secret used for encrypting/decrypting the values in tfkvStore
    "keypairType": "sr25519" // keypair type for the account created on substrate
}
```

You can also use another configuration file by using `--config` or `-c` option.

````bash
 yarn grid_http_server -c pathToConfigFile.json
 # or 
 yarn grid_http_server --config pathToConfigFile.json
````

## Life cycle

- User from the outside sends an http post request(with payload) to the HTTP server.
- Http server checks if there is a post request that its endpoint is registered on the express http server.
- If this endpoint is registered, the http server will pick up this post request.
- Http server starts to execute it using the Grid3 client.
- After finishing the execution, the Http server puts the result back to the user once it's ready.

## Running

```bash
yarn run grid_http_server
```

## Usage

This is an example of getting a twin.
Put the following content in a file `test_twin.ts`

```ts
import axios from "axios";

async function main() {
    const payload = { 'id': 1 }
    axios
      .post("http://localhost:3000/twins/get", payload)
      .then(function (response: any) {
          console.log(response);
      })
      .catch(function (error: any) {
          console.log(error.response.data);
    });
}
main()
```

And then run this file by `yarn run ts-node test_twin.ts`

see more examples in [modules](../grid_client/docs/module.md)
