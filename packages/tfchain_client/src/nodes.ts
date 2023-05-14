import { Client } from "./client";

export interface SetPowerOptions {
  nodeId: number;
  power: boolean;
}

class Nodes {
  constructor(public client: Client) {
    this.client = client;
  }

  async setPower(options: SetPowerOptions) {
    let powerTarget: { up?: boolean; down?: boolean };
    if (options.power) {
      powerTarget = {
        up: options.power,
      };
    } else {
      powerTarget = {
        down: !options.power,
      };
    }

    const extrinsic = await this.client.checkConnectionAndApply(this.client.api.tx.tfgridModule.changePowerTarget, [
      options.nodeId,
      powerTarget,
    ]);
    return this.client.patchExtrinsic<void>(extrinsic);
  }
}

export { Nodes };
