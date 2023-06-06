import { Nodes } from "@threefold/tfchain_client";

interface NodeOptions {
  id: number;
}

class TFNodes extends Nodes {
  async get(options: NodeOptions) {
    return super.get({ id: options.id });
  }
}

export { TFNodes };
