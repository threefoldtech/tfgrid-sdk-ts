export interface receiptInterface {
  type: string;
  node_type?: string;
  node_id?: number;
  farm_name?: string;
  farm_id?: number;
  measured_uptime?: number;
  period?: object;
  cru?: number;
  mru?: number;
  hru?: number;
  sru?: number;
  cu: number;
  su: number;
  nu: number;
  stellar_payout_address?: string;
  tft_connection_price?: number;
  correct_cloud_units?: object;
  fixup_cloud_units?: object;
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
        cu: receipt.Minting.cloud_units.cu,
        su: receipt.Minting.cloud_units.su,
        nu: receipt.Minting.cloud_units.nu,
        cru: receipt.Minting.resource_units.cru,
        mru: receipt.Minting.resource_units.mru,
        hru: receipt.Minting.resource_units.hru,
        sru: receipt.Minting.resource_units.sru,
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
        cu: receipt.Fixup.minted_cloud_units.cu,
        su: receipt.Fixup.minted_cloud_units.su,
        nu: receipt.Fixup.minted_cloud_units.nu,
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
