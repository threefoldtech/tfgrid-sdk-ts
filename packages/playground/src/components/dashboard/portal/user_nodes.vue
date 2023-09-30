<template>
  <div class="my-6">
    <v-card color="primary rounded-b-0">
      <v-card-title class="py-1 text-subtitle-1 font-weight-bold">Your Nodes</v-card-title>
    </v-card>
    <v-data-table
      v-if="nodes"
      :headers="headers"
      :items="nodes"
      single-expand="true"
      show-expand
      :expanded.sync="expanded"
      item-value="name"
    >
      <template v-slot:expanded-item="{ item }">
        <tr>
          <td>
            {{ item.name }}
            nenenenenenene
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import type { NodeInfo } from "@threefold/grid_client";
import { onMounted, ref } from "vue";

import { useGrid, useProfileManager } from "../../../stores";

export default {
  name: "UserNodes",
  setup() {
    const gridStore = useGrid();
    const profileManager = useProfileManager();
    const nodes = ref<NodeInfo[]>();
    const headers = [
      {
        title: "Node ID",
        align: "center",
        key: "nodeId",
      },
      {
        title: "Farm ID",
        align: "center",
        key: "farmId",
      },
      {
        title: "Country",
        align: "center",
        key: "country",
      },
      {
        title: "Serial Number",
        align: "center",
        key: "serialNumber",
      },
      {
        title: "Status",
        align: "center",
        key: "status",
      },
    ] as any[];
    const expanded = ref<any[]>();
    onMounted(async () => {
      await getUserNodes();
    });
    async function getUserNodes() {
      try {
        const twinId = profileManager.profile!.twinId;
        const userNodes = await gridStore.grid.capacity.getUserNodes({ twinId });
        nodes.value = userNodes;
        console.log("nodes.value", nodes.value);

        return userNodes;
      } catch (error) {
        console.log(error);
      }
    }
    return {
      getUserNodes,
      nodes,
      headers,
      expanded,
    };
  },
};
</script>
