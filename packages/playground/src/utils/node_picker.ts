import { events, type NodeInfo } from "@threefold/grid_client";

export class NodePicker {
  private nodes = new Map<number, number>();

  public async pick(nodes: NodeInfo[]): Promise<number> {
    let bestNode = [-1, Number.MAX_SAFE_INTEGER] as [id: number, times: number];

    for (const node of nodes) {
      const id = +node.nodeId;
      if (this.nodes.has(id)) {
        const times = this.nodes.get(id)!;
        if (times < bestNode[1]) {
          bestNode = [id, times];
        }
      } else {
        this.nodes.set(id, 1);
        events.emit("logs", `Picked nodeId: ${id} for 1 time.`);
        console.log("%c picked nodeId: " + id, "color: steelblue");
        return id;
      }
    }

    this.nodes.set(bestNode[0], bestNode[1] + 1);
    events.emit("logs", `Picked nodeId: ${bestNode[0]} for ${bestNode[1] + 1} times.`);
    console.log("%c picked nodeId: " + bestNode[0], "color: steelblue");
    return bestNode[0];
  }
}
