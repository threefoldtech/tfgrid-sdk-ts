# Tests

## Configure

- Set your grid3 client configuration in `config.json`

```json
{
  "network": "dev", // dev, qa, test, or main
  "mnemonic": "",
  "storeSecret": "secret",
  "ssh_key": "" // ed25519 SSH Key
}
```

> Please note you can leave its content empty and export everything as environment variables

```bash
export NETWORK="dev"
export MNEMONIC=""
export STORE_SECRET="secret"
export SSH_KEY=""
```

## Run

```bash
npm run test --runInBand
```

or

```bash
yarn test --runInBand
```

> **Note:** `--coverage`: can be added to the running command to generate test coverage.
> `--runInBand`: Run tests serially.
> `--ci`: Indicate CI environment.
> `--coverage`: Collect and report coverage.
> `--colors`: Force colorful output.
> `--forceExit`: Force the process to exit after tests complete.
