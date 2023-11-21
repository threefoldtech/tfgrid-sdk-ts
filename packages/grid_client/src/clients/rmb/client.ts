import { Client as RMBClient } from "@threefold/rmb_direct_client";
import { BaseError, GridClientErrors, RMBError, WrappedError } from "@threefold/types";
class RMB {
  client: RMBClient;
  constructor(rmbClient: RMBClient) {
    this.client = rmbClient;
  }

  async request(destTwinIds: number[], cmd: string, payload: string, expiration = 10, retires = 1) {
    let result;
    try {
      const requestId = await this.client.send(cmd, payload, destTwinIds[0], expiration / 60);
      result = await this.client.read(requestId);
    } catch (e) {
      if (e instanceof BaseError) {
        throw new WrappedError(
          `Failed to send request to twinId ${destTwinIds} with command: ${cmd}, payload: ${payload}`,
          e,
        );
      }
      throw new RMBError(
        `Failed to send request to twinId ${destTwinIds} with command: ${cmd}, payload: ${payload} due to ${e}`,
      );
    }
    return result;
  }
}

export { RMB };
