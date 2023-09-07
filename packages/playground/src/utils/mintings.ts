export interface receiptInterface {
  type: string;
  node_type?: string;
  node_id?: number;
  farm_name?: string;
  farm_id?: number;
  measured_uptime?: number;
  period?: {
    start: number;
    end: number;
  };
  cloud_units?: {
    cu: number;
    su: number;
    nu: number;
  };
  resource_units?: {
    cru: number;
    mru: number;
    hru: number;
    sru: number;
  };
  stellar_payout_address?: string;
  tft_connection_price?: number;
  minted_cloud_units?: {
    cu: number;
    su: number;
    nu: number;
  };
  correct_cloud_units?: {
    cu: number;
    su: number;
    nu: number;
  };
  fixup_cloud_units?: {
    cu: number;
    su: number;
    nu: number;
  };
  correct_tft?: number;
  minted_tft?: number;
  fixup_tft?: number;
  tft?: number;
  musd?: number;
  fixupReward?: number;
}

let hashReceipts: receiptInterface;
export async function getMintingData(hash: number) {
  await fetch(`${window.env.MINTING_URL}/api/v1/receipt/${hash}`).then(async res => {
    const receipt = await res.json();
    if (receipt.Minting) {
      const data = {
        type: "MINTING",
        node_type: receipt.Minting.node_type,
        node_id: receipt.Minting.node_id,
        farm_name: receipt.Minting.farm_name,
        farm_id: receipt.Minting.farm_id,
        measured_uptime: receipt.Minting.measured_uptime,
        period: receipt.Minting.period,
        cloud_units: receipt.Minting.cloud_units,
        resource_units: receipt.Minting.resource_units,
        reward: receipt.Minting.reward,
        tft_connection_price: receipt.Minting.tft_connection_price / 1e3,
        stellar_payout_address: receipt.Minting.stellar_payout_address,
        tft: receipt.Minting.reward.tft / 1e7,
        musd: receipt.Minting.reward.musd / 1e3,
      };
      hashReceipts = Object.assign({}, data);
    } else {
      const data = {
        type: "FIXUP",
        node_id: receipt.Fixup.node_id,
        farm_id: receipt.Fixup.farm_id,
        cloud_units: receipt.Fixup.minted_cloud_units,
        correct_cloud_units: receipt.Fixup.correct_cloud_units,
        fixup_cloud_units: receipt.Fixup.fixup_cloud_units,
        minted_tft: receipt.Fixup.minted_reward.tft / 1e7,
        correct_tft: receipt.Fixup.correct_reward.tft / 1e7,
        fixup_tft: receipt.Fixup.fixup_reward.tft / 1e7,
        stellar_payout_address: receipt.Fixup.stellar_payout_address,
      };
      hashReceipts = Object.assign({}, data);
    }
  });
  return hashReceipts;
}
