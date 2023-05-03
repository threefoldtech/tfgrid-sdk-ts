import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { ISubmittableResult } from "@polkadot/types/types";

import { Client } from "./client";

class Nodes {
  constructor(public client: Client) {
    this.client = client;
  }

  async setPowerExtrinsic(
    nodeId: number,
    power: boolean,
  ): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    let powerTarget;
    if (power) {
      powerTarget = {
        up: power,
      };
    } else {
      powerTarget = {
        down: !power,
      };
    }
    return this.client.checkConnectionAndApply(this.client.api.tx.tfgridModule.changePowerTarget, [
      nodeId,
      powerTarget,
    ]);
  }

  async setPower(nodeId: number, power: boolean): Promise<void> {
    const extrinsic = await this.setPowerExtrinsic(nodeId, power);
    await this.client.applyExtrinsic(extrinsic);
  }
}

export { Nodes };
