#!/bin/bash

REQUIRED_ENV_VARS=( GRAPHQL_URL BRIDGE_TFT_ADDRESS GRIDPROXY_URL VERSION SUBSTRATE_URL ACTIVATION_SERVICE_URL PLAYGROUND_URL RELAY_DOMAIN )
STELLAR_NETWORK="${STELLAR_NETWORK:=test}"
TFCHAIN_NETWORK="${TFCHAIN_NETWORK:=dev}"

echo -e "\nHINT:\e[1;10m The default selected STELLAR_NETWORK is\e[0m \e[1;32m$STELLAR_NETWORK\e[0m\e[1;38m and default selected TFCHAIN_NETWORK is\e[0m \e[1;32m$TFCHAIN_NETWORK\e[0m\e[1;38m."

# Check the current selected tf-chain network, there are 5 modes dev, qa, test, main and custom
# the user should select one of them, otherwise will be devnet.

if [ -d dist ]
then
    file="dist/config.js"
else
    file="config.js"
fi

if [ -z ${VERSION+x} ]
then
    echo -e "\n\e[1;50m \e[1;31mVERSION is required!\e[0m\n \e[1;3mPlease set it by executing the following command."
    echo -e "\e[1;31m export\e[0m \e[1;32mVERSION\e[0m=\e[1;38m'Your Value Here'\n"
    return
fi

case $TFCHAIN_NETWORK in
  "dev")
    GRAPHQL_URL='https://graphql.dev.grid.tf/graphql'
    GRIDPROXY_URL='https://gridproxy.dev.grid.tf'
    SUBSTRATE_URL='wss://tfchain.dev.grid.tf/ws'
    ACTIVATION_SERVICE_URL='https://activation.dev.grid.tf'
    PLAYGROUND_URL='https://play.dev.grid.tf'
    RELAY_DOMAIN='relay.dev.grid.tf'
    BRIDGE_TFT_ADDRESS=GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG
    STELLAR_NETWORK=test
  ;;
  *"qa"*)
    GRAPHQL_URL='https://graphql.qa.grid.tf/graphql'
    GRIDPROXY_URL='https://gridproxy.qa.grid.tf'
    SUBSTRATE_URL='wss://tfchain.qa.grid.tf/ws'
    ACTIVATION_SERVICE_URL='https://activation.qa.grid.tf'
    PLAYGROUND_URL='https://play.qa.grid.tf'
    RELAY_DOMAIN='relay.qa.grid.tf'
    BRIDGE_TFT_ADDRESS=GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG
    STELLAR_NETWORK=test
  ;;
  "test")
    GRAPHQL_URL='https://graphql.test.grid.tf/graphql'
    GRIDPROXY_URL='https://gridproxy.test.grid.tf'
    SUBSTRATE_URL='wss://tfchain.test.grid.tf/ws'
    ACTIVATION_SERVICE_URL='https://activation.test.grid.tf'
    PLAYGROUND_URL='https://play.test.grid.tf'
    RELAY_DOMAIN='relay.test.grid.tf'
    BRIDGE_TFT_ADDRESS=GA2CWNBUHX7NZ3B5GR4I23FMU7VY5RPA77IUJTIXTTTGKYSKDSV6LUA4
    STELLAR_NETWORK=main
  ;;
  *"main"*)
    GRAPHQL_URL='https://graphql.grid.tf/graphql'
    GRIDPROXY_URL='https://gridproxy.grid.tf'
    SUBSTRATE_URL='wss://tfchain.grid.tf/ws'
    ACTIVATION_SERVICE_URL='https://activation.grid.tf'
    PLAYGROUND_URL='https://play.grid.tf'
    RELAY_DOMAIN='relay.grid.tf'
    BRIDGE_TFT_ADDRESS=GBNOTAYUMXVO5QDYWYO2SOCOYIJ3XFIP65GKOQN7H65ZZSO6BK4SLWSC
    STELLAR_NETWORK=main
  ;;
  *"custom"*)
    for i in "${REQUIRED_ENV_VARS[@]}"
    do
      if ! [[ -v $i ]]; then
        echo -e "\n\e[1;50m \e[1;31m$i is required!\e[0m\n \e[1;3mPlease set it by executing the following command."
        echo -e "\e[1;31m export\e[0m \e[1;32m$i\e[0m=\e[1;38m'Your Value Here'\n"
        return
      fi
    done
    echo -e "\e[1;33mEnvironment variables were exported before, if you want to change any of them maybe you have to re-export them or close the terminal window and start from scratch."
  ;;
  *)
    echo "Unknown 'TFCHAIN_NETWORK' selected!, Acceptable networks are [dev | qa | test | main | custom]\n"
    return
  ;;
esac


GRAVITY_CONTRACT_ADDRESS="0xBF8C35Ad93366E159C0F0B75F1a4f4ad6Ff80811"
TFT_TOKEN_CONTRACT_ADDRESS="0xDC5a9199e2604A6BF4A99A583034506AE53F4B34"
BRIDGE_FEES="3"
TFT_DECIMALS=7
TFT_DENOM="TFT"
COSMOS_REST="https://tfhub.test.grid.tf:1317/"
TENDERMINT_RPC="https://tfhub.test.grid.tf:26657/"
GAS_PRICE="80TFT"
CHAIN_ID="threefold-hub-testnet"

case $STELLAR_NETWORK in
  "test")
    STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
    TFT_ASSET_ISSUER="GA47YZA3PKFUZMPLQ3B5F2E3CJIB57TGGU7SPCQT2WAEYKN766PWIMB3"
  ;;
  *"main"*)    
    STELLAR_HORIZON_URL="https://horizon.stellar.org"
    TFT_ASSET_ISSUER="GBOVQKJYHXRR3DX6NOX2RRYFRCUMSADGDESTDNBDS6CDVLGVESRTAC47"
  ;;
  *)
    echo "Unknown 'STELLAR_NETWORK' selected!, Acceptable networks are [test | main]\n"
    return
  ;;
esac

configs="
window.configs = {
  APP_API_URL: '$SUBSTRATE_URL',
  APP_STELLAR_HORIZON_URL: '$STELLAR_HORIZON_URL',
  APP_TFT_ASSET_ISSUER: '$TFT_ASSET_ISSUER',
  APP_BRIDGE_TFT_ADDRESS: '$BRIDGE_TFT_ADDRESS',
  APP_ACTIVATION_SERVICE_URL: '$ACTIVATION_SERVICE_URL',
  APP_GRAPHQL_URL: '$GRAPHQL_URL',
  APP_GRIDPROXY_URL: '$GRIDPROXY_URL',
  STELLAR_NETWORK: '$STELLAR_NETWORK',
  APP_NETWORK: '$TFCHAIN_NETWORK',
  APP_VERSION: '$VERSION',
  APP_GRAVITY_CONTRACT_ADDRESS: '$GRAVITY_CONTRACT_ADDRESS',
  APP_TFT_TOKEN_CONTRACT_ADDRESS: '$TFT_TOKEN_CONTRACT_ADDRESS',
  APP_BRIDGE_FEES: '$BRIDGE_FEES',
  APP_TFT_DECIMALS: $TFT_DECIMALS,
  APP_TFT_DENOM: '$TFT_DENOM',
  APP_PROPOSAL_DENOM: '$TFT_DENOM',
  APP_COSMOS_REST: '$COSMOS_REST',
  APP_TENDERMINT_RPC: '$TENDERMINT_RPC',
  APP_GAS_PRICE: '$GAS_PRICE',
  APP_CHAIN_ID: '$CHAIN_ID',
  PLAYGROUND_URL: '$PLAYGROUND_URL',
  RELAY: '$RELAY_DOMAIN',
};
"

if [ -e $file ]
then
    rm $file
fi

echo $configs > $file
echo -e "\e[1;32m$configs"
