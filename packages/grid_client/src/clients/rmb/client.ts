import { Client as RMBClient } from "@threefold/rmb_direct_client";
import * as Errors from "@threefold/types";
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
      if (e instanceof Errors.BaseError) {
        const error = e as Errors.BaseError;
        throw new Errors[error.name](error.message);
      }
      throw new Errors.RMBError(
        `Failed to send request to twinId ${destTwinIds} with command: ${cmd}, payload: ${payload} due to ${e}`,
      );
    }
    return result;
  }
}

export { RMB };
