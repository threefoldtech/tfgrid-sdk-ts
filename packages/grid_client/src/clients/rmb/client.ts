import { Client as RMBClient } from "@threefold/rmb_direct_client";
import { BaseError, RMBError } from "@threefold/types";

import { formatErrorMessage } from "../../helpers";
class RMB {
  client: RMBClient;
  constructor(rmbClient: RMBClient) {
    this.client = rmbClient;
  }

  async request(destTwinIds: number[], cmd: string, payload: string, expiration = 20, retries = 1) {
    let result;
    try {
      const requestId = await this.client.send(cmd, payload, destTwinIds[0], expiration / 60, retries);
      result = await this.client.read(requestId);
    } catch (e) {
      if (e instanceof BaseError) {
        e.message = formatErrorMessage(
          `Failed to send request to twinId ${destTwinIds} with command: ${cmd}, payload: ${payload}`,
          e,
        );
        throw e;
      }
      throw new RMBError(
        `Failed to send request to twinId ${destTwinIds} with command: ${cmd}, payload: ${payload} due to ${e}`,
      );
    }
    return result;
  }
}

export { RMB };
