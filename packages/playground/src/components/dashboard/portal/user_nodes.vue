<template v-if="nodes">
  <div class="my-6">
    <v-card color="primary rounded-b-0">
      <v-card-title class="py-1 text-subtitle-1 font-weight-bold">Your Nodes</v-card-title>
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
      expand-on-click
      return-object
    >
      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length" key="item.id">
            <v-container>
              <v-card outlined>
                <v-card-title>
                  <span class="headline">Node Details</span>
                </v-card-title>
                <v-card-text>
                  <v-row :justify="'space-around'">
                    <v-col cols="8">
                      <v-row no-gutters>
                        <v-col col="2">
                          <span>Node ID</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ item.nodeId }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>Farm ID</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ item.farmId }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>Twin ID</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ item.twinId }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>Certification</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ item.certificationType }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>First boot at</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ new Date(parseInt(item.created) * 1000) }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>Updated at</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ new Date(parseInt(item.updatedAt) * 1000) }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>Country</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ item.country }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>City</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ item.city }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>Serial Number</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ item.serialNumber }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>Farming Policy ID</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ item.farmingPolicyId }}</span>
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="4" class="text-center" :align-self="'center'">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ props }">
                          <v-progress-circular
                            v-bind="props"
                            :rotate="-90"
                            :size="150"
                            :width="12"
                            :model-value="item.uptime"
                            class="my-3"
                            color="primary"
                          />
                          <p>Uptime: {{ item.uptime }}%</p>
                        </template>
                        <span>Current Node Uptime Percentage (since start of the current minting period)</span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-container>

            <v-expansion-panels v-model="resourcesPanel" :disabled="false" focusable>
              <v-expansion-panel>
                <v-expansion-panel-title> Resource Units Reserved </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row class="mt-5 mb-5">
                    <v-col v-for="(value, key) in item.total_resources" :key="key" align="center">
                      <p class="text-center text-uppercase">{{ key }}</p>
                      <v-flex class="text-truncate">
                        <v-tooltip bottom class="d-none">
                          <template v-slot:activator="{ props }">
                            <v-progress-circular
                              v-bind="props"
                              :rotate="-90"
                              :size="150"
                              :width="12"
                              :model-value="getPercentage(item, key)"
                              class="my-3"
                              color="primary"
                            />
                            <template v-if="item.used_resources">
                              <p v-if="item.total_resources[key] > 1000">
                                {{ byteToGB(item.used_resources[key]) }} / {{ byteToGB(item.total_resources[key]) }} GB
                              </p>

                              <p v-else-if="item.total_resources[key] == 0">NA</p>
                              <p v-else>
                                {{ item.used_resources[key] }} /
                                {{ item.total_resources[key] }}
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
        <v-chip :color="getColor(item.status)">
          {{ item.status }}
        </v-chip>
      </template>

      <template #[`item.actions`]="{ item }">
        <AddPublicConfig class="me-2" :nodeId="item.nodeId" :farmId="item.farmId" :publicConfig="item.publicConfig" />
        <SetExtraFee class="me-2" :nodeId="item.nodeId" />
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";

import {
  getNodeAvailability,
  getNodeMintingFixupReceipts,
  getNodeUptimePercentage,
  type NodeInterface,
} from "@/utils/node";

import { gridProxyClient } from "../../../clients";
import { useGrid, useProfileManager } from "../../../stores";
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
  },
  setup() {
    const gridStore = useGrid();
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
    const publicConfig = ref<IPublicConfig>();
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
        const userFarms = await gridStore.grid.capacity.getUserFarms({ twinId });
        const farmIds = userFarms.map(farm => farm.farmId).join(",");
        const { data } = await gridProxyClient.nodes.list({ farmIds });
        const _nodes = data as unknown as NodeInterface[];

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
      return status === "down" ? "red" : "primary";
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
    };
  },
};
</script>

<style scoped>
.v-table .v-table__wrapper > table > tbody > tr:not(:last-child) > td {
  border-bottom: none;
}
</style>
