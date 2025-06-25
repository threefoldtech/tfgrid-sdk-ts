import { getNodeInfo } from "@/utils/contracts";

export async function getNodeInfoWithCache(nodeIds: number[]) {
  const nodeInfoCache = new Map();
  const uncachedIds = nodeIds.filter(id => !nodeInfoCache.has(id));
  if (uncachedIds.length > 0) {
    const newInfo = await getNodeInfo(uncachedIds, []);
    for (const [id, info] of Object.entries(newInfo)) {
      nodeInfoCache.set(Number(id), info);
    }
  }
  return nodeIds.map(id => nodeInfoCache.get(id));
}
