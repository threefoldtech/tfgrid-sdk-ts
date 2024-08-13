# Build playground environment

## Run the script

- you can run the script anywhere but make sure the generated config file are placed in [config.js](../public/config.js)

```bash
cd packages/playground/public
bash ../scripts/build-env.sh
```

### Required env vars

- By default, it runs on dev mode. the values already sat on the config file. if you want to change the mode

  ```bash
  export MODE=dev | qa | test | main
  ```

- The user is now restricted to using only the following four networks main, dev, qa and test. If not set the network's default urls will be used.

  - GRAPHQL_URL
  - GRIDPROXY_URL
  - SUBSTRATE_URL
  - ACTIVATION_SERVICE_URL
  - RELAY_DOMAIN
  - BRIDGE_TFT_ADDRESS
  - STATS_URL
  - STELLAR_NETWORK
  - SENTRY_DSN
  - ENABLE_TELEMETRY

- The backend payments are done with stellar so you need to decide which network of stellar you want to connect to

  ```bash
  export STELLAR_NETWORK=test | main
  ```
