interface periodInterface {
  start: number;
  end: number;
}

interface cloudUnitsInterface {
  cu: number;
  su: number;
  nu: number;
}

interface rewardInterface {
  tft: number;
  musd: number;
}

interface recourcesUnitesInterface {
  cru: number;
  mru: number;
  hru: number;
  sru: number;
}
export interface receiptInterface {
  farm_id: number;
  node_id: number;
  period: periodInterface;
  stellar_payout_address: string;
}

interface Minting extends receiptInterface {
  cloud_units: cloudUnitsInterface;
  farm_name: string;
  measured_uptime: number;
  node_type: string;
  resource_units: recourcesUnitesInterface;
  reward: rewardInterface;
  tft_connection_price: number;
}

interface Fixup extends receiptInterface {
  correct_cloud_units: cloudUnitsInterface;
  correct_reward: rewardInterface;
  fixup_cloud_units: cloudUnitsInterface;
  fixup_reward: rewardInterface;
  minted_cloud_units: cloudUnitsInterface;
  minted_reward: rewardInterface;
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
