interface Period {
  start: number;
  end: number;
}

interface CloudUnits {
  cu: number;
  su: number;
  nu: number;
}

interface Reward {
  tft: number;
  musd: number;
}

interface ResourcesUnits {
  cru: number;
  mru: number;
  hru: number;
  sru: number;
}
export interface Receipt {
  farm_id: number;
  node_id: number;
  period: Period;
  stellar_payout_address: string;
}

interface Minting extends Receipt {
  cloud_units: CloudUnits;
  farm_name: string;
  measured_uptime: number;
  node_type: string;
  resource_units: ResourcesUnits;
  reward: Reward;
  tft_connection_price: number;
}

interface Fixup extends Receipt {
  correct_cloud_units: CloudUnits;
  correct_reward: Reward;
  fixup_cloud_units: CloudUnits;
  fixup_reward: Reward;
  minted_cloud_units: CloudUnits;
  minted_reward: Reward;
}

export async function getMintingData(hash: number) {
  const hashReceipts = await fetch(`${window.env.MINTING_URL}/api/v1/receipt/${hash}`).then(async res => {
    if (res.ok) {
      const receipt = await res.json();
      if (receipt.Minting) {
        return receipt as unknown as Minting;
      } else {
        return receipt as unknown as Fixup;
      }
    } else throw new Error(`Receipt with hash ${hash} not found`);
  });

  return hashReceipts;
}
