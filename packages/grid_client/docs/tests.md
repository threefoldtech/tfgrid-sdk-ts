## Tests

### Prerequisites

- You can find the **gird3_client_ts** prerequisites [here](https://github.com/threefoldtech/grid3_client_ts#prerequisites).
- Follow the [installation](https://github.com/threefoldtech/grid3_client_ts#installation) steps for grid3_client_ts.
- Some of these test do ssh operation and the used [node-ssh](https://www.npmjs.com/package/node-ssh/v/13.0.0) package is a wrapper for [ssh2](https://www.npmjs.com/package/ssh2) which currently only supports `ssh Ed25519` keys with the latest Ubuntu version so you will need an `Ed25519` key to run these tests.
- You can follow the steps [here](https://render.com/docs/ssh-generating-keys) to generate an `Ed25519` ssh key pair.
- If your ssh key is not generated in the default location you will need to update the Public Key location in `tests/client_loader.ts` and the Private Key location in `tests/utils.ts`

### Test Configuration

- You can use any of the following methods for adding your configuration.
  
  - First Method (Environment Variables):
    - Export your configuration as environment variables
    - `export MNEMONIC="<mnemonics>"`
    - `export NETWORK="<network>"` # dev, qa, test or main.
    - `export RMB_PROXY=true`
    - `export STORE_SECRET="<secret>"`
    - Your ssh key will be automatically retrieved from the default location `~/user/.ssh/id_ed25519.pub`

  - Second Method (config.json)
    - Navigate to `tests/config.json`
    - Add all of your credentials there.

### Running the tests

- Running a single test file:
  
  - `yarn test tests/modules/<test_file.test.ts>`
  
- Running all of the tests:
  
  - `yarn test --runInBand`
