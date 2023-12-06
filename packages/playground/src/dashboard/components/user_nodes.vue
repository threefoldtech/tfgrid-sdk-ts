<template v-if="nodes">
  <div class="my-6">
    <v-card color="primary rounded-0">
      <v-card-title class="py-1 text-subtitle-1">Your Nodes</v-card-title>
    </v-card>
    <v-data-table-server
      :loading="loading"
      :items="nodes"
      :items-length="nodesCount"
      :items-per-page-options="[
        { value: 5, title: '5' },
        { value: 10, title: '10' },
        { value: 15, title: '15' },
        { value: 50, title: '50' },
      ]"
      :headers="headers"
      v-model:page="page"
      v-model:items-per-page="pageSize"
      show-expand
      :expanded="expanded"
      @update:expanded="
        $event => {
          if ($event.length > 0) {
            expanded = [$event.pop()];
          } else {
            expanded = [];
          }
        }
      "
      @update:options="getUserNodes"
      :hover="true"
      expand-on-click
      return-object
    >
      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length" key="item.id">
            <v-container>
              <card-details
                :loading="false"
                title="Node Details"
                icon="mdi-resistor-nodes"
                :items="getNodeDetails(item.raw)"
              ></card-details>
            </v-container>
            <v-expansion-panels v-model="resourcesPanel" :disabled="false" focusable>
              <v-expansion-panel>
                <v-expansion-panel-title class="bg-primary"> Resource Units Reserved </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row class="mt-5 mb-5">
                    <v-col v-for="(value, key) in item.raw.total_resources" :key="key" align="center">
                      <p class="text-center">{{ getKey(key) }}</p>
                      <v-flex class="text-truncate">
                        <v-tooltip bottom class="d-none">
                          <template v-slot:activator="{ props }">
                            <v-progress-circular
                              v-bind="props"
                              :rotate="-90"
                              :size="150"
                              :width="12"
                              :model-value="getPercentage(item.raw, key)"
                              class="my-3"
                              color="primary"
                            />
                            <template v-if="item.raw.used_resources">
                              <p v-if="item.raw.total_resources[key] > 1000">
                                {{ byteToGB(item.raw.used_resources[key]) }} /
                                {{ byteToGB(item.raw.total_resources[key]) }} GB
                              </p>

                              <p v-else-if="item.raw.total_resources[key] == 0">NA</p>
                              <p v-else>
                                {{ item.raw.used_resources[key] }} /
                                {{ item.raw.total_resources[key] }}
                              </p>
                            </template>
                          </template>
                        </v-tooltip>
                      </v-flex>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
            <v-expansion-panels v-if="network == 'main'" :disabled="false" focusable single model-value>
              <v-expansion-panel class="my-3">
                <v-expansion-panel-title class="bg-primary"> Node Statistics </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <NodeMintingDetails :node="item.value" />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </td>
        </tr>
      </template>

      <template #[`item.status`]="{ item }">
        <v-chip :color="getNodeStatusColor(item.raw.status as string).color">
          {{ capitalize(item.raw.status as string) }}
        </v-chip>
      </template>

      <template #[`item.actions`]="{ item }">
        <PublicConfig
          class="me-2"
          :nodeId="item.raw.nodeId"
          :farmId="item.raw.farmId"
          v-model="item.raw.publicConfig"
          @remove-config="(item.raw.publicConfig = $event), reloadNodes"
          @add-config="(item.raw.publicConfig = $event), reloadNodes"
        />
        <SetExtraFee class="me-2" :nodeId="item.raw.nodeId" />
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import moment from "moment";
import { onMounted, ref } from "vue";
import { capitalize } from "vue";

import { gridProxyClient } from "@/clients";
import CardDetails from "@/components/node_details_cards/card_details.vue";
import { useProfileManager } from "@/stores";
import type { NodeDetailsCard } from "@/types";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { getNodeStatusColor } from "@/utils/get_nodes";
import {
  getNodeAvailability,
  getNodeMintingFixupReceipts,
  getNodeUptimePercentage,
  type NodeInterface,
} from "@/utils/node";

import NodeMintingDetails from "./NodeMintingDetails.vue";
import PublicConfig from "./public_config.vue";
import SetExtraFee from "./set_extra_fee.vue";

export default {
  name: "UserNodes",
  components: {
    NodeMintingDetails,
    PublicConfig,
    SetExtraFee,
    CardDetails,
  },
  setup() {
    const profileManager = useProfileManager();
    const loading = ref(false);
    const page = ref<number>(1);
    const pageSize = ref(10);
    const nodes = ref<NodeInterface[]>();
    const headers = [
      {
        title: "Node ID",
        align: "center",
        key: "nodeId",
        sortable: false,
      },
      {
        title: "Farm ID",
        align: "center",
        key: "farmId",
        sortable: false,
      },
      {
        title: "Country",
        align: "center",
        key: "country",
        sortable: false,
      },
      {
        title: "Serial Number",
        align: "center",
        key: "serialNumber",
        sortable: false,
      },
      {
        title: "Status",
        align: "center",
        key: "status",
        sortable: false,
      },
      {
        title: "Actions",
        align: "center",
        key: "actions",
        sortable: false,
      },
    ] as any[];

    const expanded = ref<string[]>();
    const network = process.env.NETWORK || window.env.NETWORK;
    const resourcesPanel = ref([]);
    const receiptsPanel = ref([]);
    const uptime = ref();
    const nodesCount = ref();

    onMounted(async () => {
      const nodes = await getUserNodes();
      if (nodes) {
        await Promise.all(
          nodes.map(async (n, _) => {
            n.uptime = +(await getNodeUptimePercentage(n.nodeId));
            return n.uptime;
          }),
        );
      }
    });

    const reloadNodes = setTimeout(async () => {
      await getUserNodes();
    }, 10000);

    async function getUserNodes() {
      try {
        loading.value = true;
        const twinId = profileManager.profile!.twinId;

        const { data, count } = await gridProxyClient.nodes.list({
          retCount: true,
          page: page.value,
          size: pageSize.value,
          ownedBy: twinId,
        });

        const _nodes = data as unknown as NodeInterface[];
        nodesCount.value = count ?? 0;
        const nodesWithReceipts = _nodes.map(async (node: NodeInterface) => {
          try {
            const network = process.env.NETWORK || (window as any).env.NETWORK;
            node.receipts = [];
            if (network == "main") node.receipts = await getNodeMintingFixupReceipts(node.nodeId);
            node.availability = await getNodeAvailability(node.nodeId);
          } catch (error) {
            node.receipts = [];
            node.used_resources = {
              sru: 0,
              hru: 0,
              mru: 0,
              cru: 0,
            };
            node.availability = { downtime: 0, currentPeriod: 0 };
          }

          return node;
        });

        nodes.value = await Promise.all(nodesWithReceipts);
        return nodes.value;
      } catch (error) {
        console.log(error);
        createCustomToast("Failed to get user nodes!", ToastType.danger);
      } finally {
        loading.value = false;
      }
    }

    function getPercentage(item: any, type: any) {
      if (!item.used_resources) return 0;
      const reservedResources = item.used_resources[type];
      const totalResources = item.total_resources[type];
      if (reservedResources === 0 && totalResources === 0) return 0;
      return (reservedResources / totalResources) * 100;
    }

    function byteToGB(capacity: number) {
      return (capacity / 1024 / 1024 / 1024).toFixed(2);
    }

    function getNodeDetails(item: any): NodeDetailsCard[] {
      return [
        { name: "Node ID", value: item.nodeId },
        { name: "Farm ID", value: item.farmId },
        { name: "Twin ID", value: item.twinId },
        { name: "Certification", value: item.certificationType },
        { name: "First Boot at", value: moment(item.created * 1000).format("MM-DD-YY, HH:mm A") },
        { name: "Updated at", value: moment(item.updatedAt * 1000).format("MM-DD-YY, HH:mm A") },
        { name: "Country", value: item.country },
        { name: "City", value: item.city },
        { name: "Serial Number", value: item.serialNumber },
        { name: "Pricing Policy", value: item.farmingPolicyId },
        { name: "Uptime", value: item.uptime + "%" },
      ];
    }

    function getKey(key: any) {
      switch (key) {
        case "mru":
          return "RAM";
        case "sru":
          return "SSD";
        case "hru":
          return "HDD";
        case "cru":
          return "CPU";
      }
    }

    return {
      loading,
      page,
      pageSize,
      nodes,
      headers,
      expanded,
      network,
      resourcesPanel,
      receiptsPanel,
      uptime,
      nodesCount,
      getUserNodes,
      getNodeStatusColor,
      getPercentage,
      byteToGB,
      getNodeDetails,
      getKey,
      capitalize,
      reloadNodes,
    };
  },
};
</script>

<style scoped>
.v-table .v-table__wrapper > table > tbody > tr:not(:last-child) > td {
  border-bottom: none;
}
</style>
