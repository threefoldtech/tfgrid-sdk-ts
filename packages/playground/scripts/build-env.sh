#!/bin/bash

# Env vars with default values
MODE="${MODE:=dev}"
STELLAR_NETWORK="${STELLAR_NETWORK:=test}"
TIMEOUT="${TIMEOUT:=10000}"
PAGE_SIZE="${PAGE_SIZE:=20}"
MINTING_URL="https://alpha.minting.tfchain.grid.tf"
MANUAL_URL="${MANUAL_URL:-https://www.manual.grid.tf}"
ENABLE_TELEMETRY=false
STELLAR_ENV_Vars=(
    STELLAR_HORIZON_URL
    TFT_ASSET_ISSUER
)

case $MODE in
    "dev")
        GRAPHQL_URL="${GRAPHQL_URL:-https://graphql.dev.grid.tf/graphql}"
        GRIDPROXY_URL="${GRIDPROXY_URL:-https://gridproxy.dev.grid.tf}"
        SUBSTRATE_URL="${SUBSTRATE_URL:-wss://tfchain.dev.grid.tf/ws}"
        ACTIVATION_SERVICE_URL="${ACTIVATION_SERVICE_URL:-https://activation.dev.grid.tf/activation/activate}"
        RELAY_DOMAIN="${RELAY_DOMAIN:-wss://relay.dev.grid.tf}"
        BRIDGE_TFT_ADDRESS="${BRIDGE_TFT_ADDRESS:-GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG}"
        STATS_URL="${STATS_URL:-https://stats.dev.grid.tf}"
        STELLAR_NETWORK="${STELLAR_NETWORK:-test}"
        SENTRY_DSN="https://b9af6796f176d1f02837a06f0da3caee@dev.sentry.grid.tf/2"
    ;;
    "qa")
        GRAPHQL_URL="${GRAPHQL_URL:-https://graphql.qa.grid.tf/graphql}"
        GRIDPROXY_URL="${GRIDPROXY_URL:-https://gridproxy.qa.grid.tf}"
        SUBSTRATE_URL="${SUBSTRATE_URL:-wss://tfchain.qa.grid.tf/ws}"
        ACTIVATION_SERVICE_URL="${ACTIVATION_SERVICE_URL:-https://activation.qa.grid.tf/activation/activate}"
        RELAY_DOMAIN="${RELAY_DOMAIN:-wss://relay.qa.grid.tf}"
        BRIDGE_TFT_ADDRESS="${BRIDGE_TFT_ADDRESS:-GAQH7XXFBRWXT2SBK6AHPOLXDCLXVFAKFSOJIRMRNCDINWKHGI6UYVKM}"
        STATS_URL="${STATS_URL:-https://stats.qa.grid.tf}"
        STELLAR_NETWORK="${STELLAR_NETWORK:-test}"
        SENTRY_DSN="https://b9af6796f176d1f02837a06f0da3caee@dev.sentry.grid.tf/2"
    ;;
    "test")
        GRAPHQL_URL="${GRAPHQL_URL:-https://graphql.test.grid.tf/graphql}"
        GRIDPROXY_URL="${GRIDPROXY_URL:-https://gridproxy.test.grid.tf}"
        SUBSTRATE_URL="${SUBSTRATE_URL:-wss://tfchain.test.grid.tf/ws}"
        ACTIVATION_SERVICE_URL="${ACTIVATION_SERVICE_URL:-https://activation.test.grid.tf/activation/activate}"
        RELAY_DOMAIN="${RELAY_DOMAIN:-wss://relay.test.grid.tf}"
        BRIDGE_TFT_ADDRESS="${BRIDGE_TFT_ADDRESS:-GA2CWNBUHX7NZ3B5GR4I23FMU7VY5RPA77IUJTIXTTTGKYSKDSV6LUA4}"
        STATS_URL="${STATS_URL:-https://stats.test.grid.tf}"
        STELLAR_NETWORK="${STELLAR_NETWORK:-main}"
        SENTRY_DSN="https://b9af6796f176d1f02837a06f0da3caee@dev.sentry.grid.tf/2"
    ;;
    "main")
        GRAPHQL_URL="${GRAPHQL_URL:-https://graphql.grid.tf/graphql}"
        GRIDPROXY_URL="${GRIDPROXY_URL:-https://gridproxy.grid.tf}"
        SUBSTRATE_URL="${SUBSTRATE_URL:-wss://tfchain.grid.tf/ws}"
        ACTIVATION_SERVICE_URL="${ACTIVATION_SERVICE_URL:-https://activation.grid.tf/activation/activate}"
        RELAY_DOMAIN="${RELAY_DOMAIN:-wss://relay.grid.tf}"
        BRIDGE_TFT_ADDRESS="${BRIDGE_TFT_ADDRESS:-GBNOTAYUMXVO5QDYWYO2SOCOYIJ3XFIP65GKOQN7H65ZZSO6BK4SLWSC}"
        STATS_URL="${STATS_URL:-https://stats.grid.tf}"
        STELLAR_NETWORK="${STELLAR_NETWORK:-main}"
        SENTRY_DSN="https://598bcc658bd99042ab429166035f8278@sentry.grid.tf/2"
    ;;
    *)
        echo "Unknown 'MODE' selected! Acceptable modes are [dev | qa | test | main ]"
        return
    ;;
esac



case $STELLAR_NETWORK in
  "test")
    STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
    TFT_ASSET_ISSUER="GA47YZA3PKFUZMPLQ3B5F2E3CJIB57TGGU7SPCQT2WAEYKN766PWIMB3"
  ;;
  "main")    
    STELLAR_HORIZON_URL="https://horizon.stellar.org"
    TFT_ASSET_ISSUER="GBOVQKJYHXRR3DX6NOX2RRYFRCUMSADGDESTDNBDS6CDVLGVESRTAC47"
  ;;
  *)
    echo "Unknown 'STELLAR_NETWORK' selected!, Acceptable networks are [test | main]\n"
    return
  ;;
esac

configs="
window.env = {
  NETWORK: '$MODE',
  GRAPHQL_URL: '$GRAPHQL_URL',
  GRIDPROXY_URL: '$GRIDPROXY_URL',
  SUBSTRATE_URL: '$SUBSTRATE_URL',
  ACTIVATION_SERVICE_URL: '$ACTIVATION_SERVICE_URL',
  RELAY_DOMAIN: '$RELAY_DOMAIN',
  BRIDGE_TFT_ADDRESS: '$BRIDGE_TFT_ADDRESS',
  STELLAR_NETWORK: '$STELLAR_NETWORK',
  STELLAR_HORIZON_URL: '$STELLAR_HORIZON_URL',
  TFT_ASSET_ISSUER: '$TFT_ASSET_ISSUER',
  MINTING_URL: '$MINTING_URL',
  STATS_URL: '$STATS_URL',
  TIMEOUT: +'$TIMEOUT',
  PAGE_SIZE: +'$PAGE_SIZE',
  MANUAL_URL: '$MANUAL_URL',
  SENTRY_DSN: '$SENTRY_DSN',
  ENABLE_TELEMETRY: '$ENABLE_TELEMETRY'
};
"

# decide the config file path
[ -d dist ] && file="dist/config.js" || file="config.js"

# override the content of the config file & echo the result
echo $configs > $file
echo -e "\e[1;32m$configs"
