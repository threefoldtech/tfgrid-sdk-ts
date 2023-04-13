# THREEFOLD GRID DASHBOARD

![GitHub release (latest by date)](https://img.shields.io/github/v/release/threefoldtech/tfgrid_dashboard)
[![Selenium _Tests](https://github.com/threefoldtech/tfgrid_dashboard/actions/workflows/Selenium.yaml/badge.svg)](https://github.com/threefoldtech/tfgrid_dashboard/actions/workflows/Selenium.yaml)
[![Cypress Tests](https://github.com/threefoldtech/tfgrid_dashboard/actions/workflows/Cypress.yaml/badge.svg)](https://github.com/threefoldtech/tfgrid_dashboard/actions/workflows/Cypress.yaml)

A unified application where users can do the following and so much more !

- View and search their connected polkadot.js accounts
- Connect/Disconnect from polkadot.js
- View balances on the TF Chain
- Buy TFT
- Transfer TFT within the TFChain
- Swap TFT to and from Cosmos and Stellar
- Create/delete/edit/view/search twins, farms, farm public IPs, farm nodes and farm nodes public configuration.
- Add Stellar payout to farms
- Reserve/Unreserve dedicated nodes.
- Explore the grid capacity (i.e view the TF Grid statistics, nodes and farms across the world).

If you don't know where to start, you can also review the TF Chain manual before even connecting to polkadot.js.

## Built With

- Vue 2
- Typescript
- Veutify
- GraphQl

### Getting Started

To get a local copy up and running follow these simple example steps:

- Open Terminal.
- Change the current working directory to the location you want the cloned directory.
- Enter the following:

  ```bash
  git clone https://github.com/threefoldtech/tfgrid_dashboard.git
  ```

- Press Enter to create your local clone.

- Navigate to the cloned repository by running:

  ```bash
  cd tfgrid_dashboard
  ```

- Adjust your config.js file as per your environment:

  ```bash
  export VERSION="v1.3.0-rc4"
  cd public
  source ../scripts/build-env.sh
  # these commands will generate a config file for you against `devnet`
  ```

- available `nets/modes` supported are
  - `dev`, `qa`, `test`, `main`, `custom`
- in case you selected a `custom` mode

  ```bash
  export VERSION="v1.3.0-rc4"
  export TFCHAIN_NETWORK="custom"
  cd public
  source ../scripts/build-env.sh

  # The terminal will ask you about the required env vars, see below.
  ```

  This is an example of the output you'll see in case you missed setting a required environment variable.

  ![image](https://user-images.githubusercontent.com/57001890/219054454-f5d74a79-0083-4442-a95e-4bd4fd3bcf73.png)

- The default value of `stellar network` is `testnet`, in case you want to work against `mainnet` you have to change its value.

```bash
  export STELLAR_NETWORK="main"
```

- all required env vars when using `custom` mode are.
  - GRAPHQL_URL
  - BRIDGE_TFT_ADDRESS
  - GRIDPROXY_URL
  - VERSION
  - SUBSTRATE_URL
  - ACTIVATION_SERVICE_URL
  - PLAYGROUND_URL
  - RELAY_DOMAIN

To try the project locally you can easy clone the repo and run the following commands:

```bash
yarn install
yarn serve
```

### Prerequisites

- GitHub
- Git
- Node.js
- Yarn
- Vue CLI

### Contributors

Contributions, issues, and feature requests are welcome!

Feel free to check the [issues page](https://github.com/threefoldtech/tfgrid_dashboard/issues).
