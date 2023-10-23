<template v-if="nodes">
  <div class="my-6">
    <v-card color="primary rounded-b-0">
      <v-card-title class="py-1 text-subtitle-1">Your Nodes</v-card-title>
    </v-card>
    <v-data-table
      :headers="headers"
      :items="nodes"
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
      :items-per-page-options="[
        { value: 5, title: '5' },
        { value: 10, title: '10' },
        { value: 15, title: '15' },
        { value: 50, title: '50' },
      ]"
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
                <v-expansion-panel-title> Resource Units Reserved </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row class="mt-5 mb-5">
                    <v-col v-for="(value, key) in item.raw.total_resources" :key="key" align="center">
                      <p class="text-center text-uppercase">
                        {{ key === "cru" ? "cpu" : key === "mru" ? "ram" : key }}
                      </p>
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
            <v-expansion-panels
              v-if="network == 'main' && item.raw.status === 'up'"
              :disabled="false"
              focusable
              single
              model-value
            >
              <v-expansion-panel>
                <v-expansion-panel-title> Node Statistics </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <NodeMintingDetails :node="item" />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </td>
        </tr>
      </template>

      <template #[`item.status`]="{ item }">
        <v-chip :color="getColor(item.raw.status)">
          {{ item.raw.status }}
        </v-chip>
      </template>

      <template #[`item.actions`]="{ item }">
        <AddPublicConfig class="me-2" :nodeId="item.raw.nodeId" :farmId="item.raw.farmId" v-model="publicConfig" />
        <SetExtraFee class="me-2" :nodeId="item.raw.nodeId" />
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";

import CardDetails from "@/explorer/components/node_details_cards/card_details.vue";
import type { NodeDetailsCard } from "@/explorer/utils/types";
import {
  getNodeAvailability,
  getNodeMintingFixupReceipts,
  getNodeUptimePercentage,
  type NodeInterface,
} from "@/utils/node";

import { gridProxyClient } from "../../../clients";
import { useProfileManager } from "../../../stores";
import { createCustomToast, ToastType } from "../../../utils/custom_toast";
import AddPublicConfig from "./add_public_config.vue";
import NodeMintingDetails from "./NodeMintingDetails.vue";
import SetExtraFee from "./set_extra_fee.vue";

export default {
  name: "UserNodes",
  components: {
    NodeMintingDetails,
    AddPublicConfig,
    SetExtraFee,
    CardDetails,
  },
  setup() {
    const profileManager = useProfileManager();
    const nodes = ref<NodeInterface[]>();
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
      {
        title: "Actions",
        align: "center",
        key: "actions",
        sortable: false,
      },
    ] as any[];

    const expanded = ref<string[]>();
    const network = process.env.NETWORK || window.env.NETWORK;
    interface IPublicConfig {
      ipv4?: number;
      gwv4?: number;
      ipv6?: number;
      gwv6?: number;
      domain?: string;
    }
    const publicConfig = ref<IPublicConfig>({});
    const resourcesPanel = ref([]);
    const receiptsPanel = ref([]);
    const uptime = ref();

    onMounted(async () => {
      const nodes = await getUserNodes();
      await Promise.all(
        nodes!.map(async (n, i) => {
          n.uptime = +(await getNodeUptimePercentage(n.nodeId));
          return n.uptime;
        }),
      );
    });

    async function getUserNodes() {
      try {
        const twinId = profileManager.profile!.twinId;
        const { data } = await gridProxyClient.farms.list({ twinId });
        const farmIds = data.map(farm => farm.farmId).join(",");
        const res = await gridProxyClient.nodes.list({ farmIds });
        const _nodes = res.data as unknown as NodeInterface[];

        const nodesWithResources = _nodes.map(async (node: NodeInterface) => {
          try {
            const network = process.env.NETWORK || (window as any).env.NETWORK;
            node.receipts = [];
            if (network == "dev") node.receipts = await getNodeMintingFixupReceipts(node.nodeId);
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

        nodes.value = await Promise.all(nodesWithResources);
        return nodes.value;
      } catch (error) {
        console.log(error);
        createCustomToast("Failed to get user nodes!", ToastType.danger);
      }
    }

    function getColor(status: string) {
      return status === "down" ? "tonal" : "primary";
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
        { name: "First Boot at", value: new Date(parseInt(item.created) * 1000) },
        { name: "Updated at", value: new Date(parseInt(item.updatedAt) * 1000) },
        { name: "Country", value: item.country },
        { name: "City", value: item.city },
        { name: "Serial Number", value: item.serialNumber },
        { name: "Pricing Policy", value: item.farmingPolicyId },
        { name: "Uptime", value: item.uptime + "%" },
      ];
    }

    return {
      nodes,
      headers,
      expanded,
      network,
      resourcesPanel,
      receiptsPanel,
      publicConfig,
      uptime,
      getUserNodes,
      getColor,
      getPercentage,
      byteToGB,
      getNodeDetails,
    };
  },
};
</script>

<style scoped>
.v-table .v-table__wrapper > table > tbody > tr:not(:last-child) > td {
  border-bottom: none;
}
</style>
