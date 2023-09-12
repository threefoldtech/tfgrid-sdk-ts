export interface receiptInterface {
  farm_id: number;
  node_id: number;
  period: object;
  stellar_payout_address: string;
}
interface Minting extends receiptInterface {
  cloud_units: object;
  farm_name: string;
  measured_uptime: number;
  node_type: string;
  resource_units: object;
  reward: object;
  tft_connection_price: number;
}

interface Fixup extends receiptInterface {
  correct_cloud_units: object;
  correct_reward: object;
  fixup_cloud_units: object;
  fixup_reward: object;
  minted_cloud_units: object;
  minted_reward: object;
}

export async function getMintingData(hash: number) {
  const hashReceipts = await fetch(`${window.env.MINTING_URL}/api/v1/receipt/${hash}`).then(async res => {
    const receipt = await res.json();
    if (receipt.Minting) {
      return receipt as object as Minting;
    } else {
      return receipt as object as Fixup;
    }
  });

  return hashReceipts;
}
