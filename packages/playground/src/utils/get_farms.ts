import type { FilterOptions, GridClient, NodeInfo } from '@threefold/grid_client'

import { gqlClient } from '../clients'

export async function getFarms(grid: GridClient, filters: FilterOptions) {
  const nodes: NodeInfo[][] = []

  let page = 1
  while (page) {
    const _nodes = await grid.capacity.filterNodes({ ...filters, page }).catch(() => [])
    nodes.push(_nodes)
    page = nodes[page - 1].length ? ++page : 0
  }

  const farmIds = Array.from(new Set(nodes.flat(1).map((node) => node.farmId)))

  return gqlClient.farms(
    { farmID: true, name: true },
    { orderBy: ['farmID_ASC'], where: { farmID_in: farmIds }, limit: farmIds.length }
  )
}
