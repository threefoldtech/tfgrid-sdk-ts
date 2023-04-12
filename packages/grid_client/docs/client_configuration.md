# Client Configuration

- Network environment: should select dev environment, qa, test or main.

    ```ts
    import { NetworkEnv } from "@threefold/grid_client";

    const network = NetworkEnv.dev
    ```

- Mnemonic: 12 words for your account. [create one](https://library.threefold.me/info/manual/#/getstarted/manual__dashboard_portal_polkadot_create_account)

- Store secret: it's any word that will be used for encrypting/decrypting the keys on threefold key-value store.

- project name: it's a name to isolate the deployments into a namespace.

    **Note:** only network can't be isolated, all project can see the same network.

- Backend storage: can select `fs`,`localstorage`, `auto`, or `tfkvstore`. (**default:** auto)

    **Note:** selecting `auto` will auto detect the process if it's node it will use `fs` and if it's browser it will use `localstorage`.

```ts
import { BackendStorageType } from "@threefold/grid_client";

const backendStorageType = BackendStorageType.auto
```

- keypair type: the keypair types supported are `sr25519` or `ed25519`. (**default:** `sr25519`)

```ts
import { KeypairType } from "@threefold/grid_client";

const keypairType = KeypairType.sr25519
```

## Create client instance

By gathering all the previous configuration in one script.

```ts
import { GridClient } from "@threefold/grid_client";


const gridClient = new GridClient({ mnemonic: "<please insert your mnemonics here>", network: "dev, qa, test, main, or custom" });

await gridClient.connect();
```

**Important Note**: grid client should be disconnected after finishing its usage.

```ts
gridClient.disconnect();
```
