<template v-if="nodes">
  <div class="my-6">
    <v-card color="primary rounded-b-0">
      <v-card-title class="py-1 text-subtitle-1 font-weight-bold">Your Nodes</v-card-title>
    </v-card>
    <v-data-table
      :headers="headers"
      :items="nodes"
      single-expand="true"
      :expanded.sync="expanded"
      show-expand
      item-value="name"
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
                          <span>{{ item.raw.nodeId }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>Farm ID</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ item.raw.farmId }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>Twin ID</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ item.raw.twinId }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>Certification</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ item.raw.certificationType }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>First boot at</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ new Date(parseInt(item.raw.created) * 1000) }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>Updated at</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ new Date(parseInt(item.raw.updatedAt) * 1000) }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>Country</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ item.raw.country }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>City</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ item.raw.city }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>Serial Number</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ item.raw.serialNumber }}</span>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col col="2">
                          <span>Farming Policy ID</span>
                        </v-col>
                        <v-col cols="9">
                          <span>{{ item.raw.farmingPolicyId }}</span>
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
                            :model-value="item.value.uptime"
                            class="my-3"
                            color="primary"
                          />
                          <p>Uptime: {{ item.value.uptime }}%</p>
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
                    <v-col v-for="(value, key) in item.raw.total_resources" :key="key" align="center">
                      <p class="text-center text-uppercase">{{ key }}</p>
                      <v-flex class="text-truncate">
                        <v-tooltip bottom class="d-none">
                          <template v-slot:activator="{ props }">
                            <v-progress-circular
                              v-bind="props"
                              :rotate="-90"
                              :size="150"
                              :width="12"
                              :model-value="isNaN(getPercentage(item.raw, key)) ? 0 : getPercentage(item.raw, key)"
                              class="my-3"
                              color="primary"
                            />
                            <template v-if="item.value.used_resources">
                              <p v-if="item.value.total_resources[key] > 1000">
                                {{ byteToGB(item.value.used_resources[key]) }} /
                                {{ byteToGB(item.value.total_resources[key]) }} GB
                              </p>

                              <p v-else-if="item.value.total_resources[key] == 0">NA</p>
                              <p v-else>
                                {{ item.value.used_resources[key] }} /
                                {{ item.value.total_resources[key] }}
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
              v-model="receiptsPanel"
              :disabled="false"
              focusable
              single
            >
              <v-expansion-panel>
                <v-expansion-panel-title> Node Statistics </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <NodeMintingDetails :node="item.raw" />
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
        <AddPublicConfig
          class="me-2"
          :nodeId="item.raw.nodeId"
          :farmId="item.raw.farmId"
          :publicConfig="item.raw.publicConfig"
        />
        <SetExtraFee class="me-2" :nodeId="item.raw.nodeId" />
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";

import { getNodeUptimePercentage, type NodeInterface } from "@/utils/node";

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

    const expanded = ref<any[]>();
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
        const { data } = await gridProxyClient.nodes.list({ farmIds }, { loadStats: true });
        nodes.value = data as unknown as NodeInterface[];
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
