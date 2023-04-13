async function ensureChain(chain_id: string, address_prefix: string, rpc: string, rest: string) {
  try {
    const offlineSigner = window.keplr.getOfflineSigner("threefold-hub-testnet");
    (await offlineSigner.getAccounts())[0];
  } catch (e: any) {
    await window.keplr.experimentalSuggestChain({
      features: ["ibc-transfer", "ibc-go"],
      chainId: chain_id,
      chainName: chain_id,
      rpc: rpc,
      rest: rest,
      bip44: {
        coinType: 118,
      },
      bech32Config: {
        bech32PrefixAccAddr: address_prefix,
        bech32PrefixAccPub: address_prefix + "pub",
        bech32PrefixValAddr: address_prefix + "valoper",
        bech32PrefixValPub: address_prefix + "valoperpub",
        bech32PrefixConsAddr: address_prefix + "valcons",
        bech32PrefixConsPub: address_prefix + "valconspub",
      },
      currencies: [
        {
          coinDenom: "TFT",
          coinMinimalDenom: "TFT",
          coinDecimals: 0,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "TFT",
          coinMinimalDenom: "TFT",
          coinDecimals: 0,
        },
      ],
      stakeCurrency: {
        coinDenom: "TFT",
        coinMinimalDenom: "TFT",
        coinDecimals: 0,
      },
      coinType: 118,
      gasPriceStep: {
        // proportioned as the keplr example
        // the min low should always work as long as it's more than min-gas-price in the validators
        // does it affect how fast the tx goes through?
        low: 80,
        average: 80,
        high: 80,
      },
    });
  }
}

export { ensureChain };
