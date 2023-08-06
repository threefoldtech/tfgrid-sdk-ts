<template>
  <Layout pageName="Nodes" class="custom-layout">
    <template v-slot:filters>
      <LayoutFilters :items="filters.map(f => f.label)" v-model="activeFiltersList" />
    </template>

    <template v-slot:active-filters>
      <div v-for="filter in activeFilters" :key="filter.key">
        <NodeFilter :filterKey="filter.key" :label="filter.label" :placeholder="filter.placeholder" />
      </div>
    </template>

    <template v-slot:table>
      <div class="d-flex justify-start mt-11">
        <v-alert class="mb-0" dense text type="info">
          Node statuses are updated every 90 minutes. For a realtime status, please click on the row.
        </v-alert>
      </div>
      <v-row class="py-2" align="center" justify="space-between">
        <v-col cols="6">
          <v-row align="center">
            <v-col xl="4" class="ml-2">
              <v-switch
                class="mt-0"
                label="Gateways (Only)"
                hide-details
                v-model="gatewayFilter"
                @change="requestNodes"
              />
            </v-col>
            <v-col>
              <v-switch
                class="mt-0 ml-2"
                label="GPU Node (Only)"
                hide-details
                v-model="gpuFilter"
                @change="requestNodes"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="3" align="end">
          <v-select
            class="p-0"
            label="Select Nodes Status"
            :items="[statusFilter.up, statusFilter.down, statusFilter.standBy]"
            v-model="nodeStatusFilter"
          ></v-select>
        </v-col>
      </v-row>
      <v-data-table
        ref="table"
        :loading="$store.getters['explorer/tableLoading']"
        loading-text="Loading..."
        :headers="headers"
        :items="$store.getters['explorer/nodes']"
        :server-items-length="$store.getters['explorer/getNodesCount']"
        :items-per-page="10"
        :footer-props="{
          'items-per-page-options': [5, 10, 15, 50],
        }"
        :page.sync="page"
        class="elevation-1"
        align
        @click:row="openSheet"
        :disable-sort="true"
        @update:options="onUpdateOptions($event.page, $event.itemsPerPage)"
        hide-default-header
      >
        <!-- 
          Custom table header, hide the original.
         -->
        <template v-slot:header="{ props: { headers } }">
          <thead class="v-data-table-header">
            <tr>
              <th v-for="h in headers" :key="h.value" :class="h.customAlign">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <span v-on="on">{{ h.text }}</span>
                  </template>
                  <span>{{ h.description || h.text }}</span>
                </v-tooltip>
              </th>
            </tr>
          </thead>
        </template>

        <!--  -->
        <template v-slot:[`item.created`]="{ item }">
          {{ item.created | date }}
        </template>

        <template v-slot:[`item.hru`]="{ item }">
          {{ item.hru | toTeraOrGigaOrPeta }}
        </template>

        <template v-slot:[`item.sru`]="{ item }">
          {{ item.sru | toTeraOrGigaOrPeta }}
        </template>

        <template v-slot:[`item.mru`]="{ item }">
          {{ item.mru | toTeraOrGigaOrPeta }}
        </template>

        <template v-slot:[`item.uptime`]="{ item }">
          {{ item.uptime | secondToRedable }}
        </template>

        <template v-slot:[`item.status`]="{ item }">
          <p class="text-left mt-1 mb-0">
            <v-chip :color="getStatus(item).color">
              <span style="color: rgb(255, 255, 255); font-weight: 700">
                {{ getStatus(item).status }}
              </span>
            </v-chip>
          </p>
        </template>
      </v-data-table>
    </template>

    <template v-slot:details>
      <DetailsV2
        :open="!!node"
        :query="query"
        :variables="
          node
            ? {
                nodeId: node.nodeId,
                farmId: node.farmId,
                twinId: node.twinId,
                country: node.country === 'United States' ? 'United States of America' : node.country,
              }
            : {}
        "
        :nodeId="node && node.nodeId"
        v-on:close-sheet="closeSheet"
      />
    </template>
  </Layout>
</template>

<script lang="ts">
import gql from "graphql-tag";
import { Component, Vue } from "vue-property-decorator";

import DetailsV2 from "../components/DetailsV2.vue";
import Layout from "../components/Layout.vue";
import LayoutFilters from "../components/LayoutFilters.vue";
import NodeFilter from "../components/NodeFilter.vue";
import { INode } from "../graphql/api";
import { ActionTypes } from "../store/actions";
import { MutationTypes } from "../store/mutations";
import { NodeStatusFilter } from "../types/FilterOptions";

@Component({
  components: {
    Layout,
    DetailsV2,
    LayoutFilters,
    NodeFilter,
  },
})
export default class Nodes extends Vue {
  headers = [
    { text: "ID", value: "nodeId", customAlign: "text-start" },
    { text: "Farm ID", value: "farmId", align: "center", customAlign: "text-center" },
    { text: "Total Public IPs", value: "totalPublicIPs", align: "center", customAlign: "text-center" },
    { text: "Free Public IPs", value: "freePublicIPs", align: "center", customAlign: "text-center" },
    { text: "CRU", value: "cru", align: "center", customAlign: "text-center", description: "Total Cores" },
    { text: "MRU", value: "mru", align: "center", customAlign: "text-center", description: "Total Memory" },
    { text: "SRU", value: "sru", align: "center", customAlign: "text-center", description: "Total SSD" },
    { text: "HRU", value: "hru", align: "center", customAlign: "text-center", description: "Total HDD" },
    { text: "GPU", value: "num_gpu", align: "center", customAlign: "text-center", description: "GPU card" },
    { text: "Up Time", value: "uptime", align: "center", customAlign: "text-center" },
    { text: "Status", value: "status", align: "center", customAlign: "text-center" },
  ];

  statusFilter = NodeStatusFilter;
  filters = [
    {
      label: "Node ID",
      key: "node_id",
      placeholder: "Filter by node id.",
    },
    {
      label: "Twin ID",
      key: "twin_id",
      placeholder: "Filter by twin id.",
    },
    {
      label: "Farm IDs",
      key: "farm_ids",
      placeholder: "Find nodes in Farms with ids.",
    },
    {
      label: "Farm Name",
      key: "farm_name",
      placeholder: "Filter by farm name.",
    },
    {
      label: "Country Full Name",
      key: "country",
      placeholder: "Filter by country.",
    },
    {
      label: "Free SRU (GB)",
      key: "free_sru",
      placeholder: "Filter by Free SSD greater than or equal to.",
    },
    {
      label: "Free HRU (GB)",
      key: "free_hru",
      placeholder: "Filter by Free HDD greater than or equal to.",
    },
    {
      label: "Free MRU (GB)",
      key: "free_mru",
      placeholder: "Filter by Free Memory greater than or equal to.",
    },
    {
      label: "Total SRU (GB)",
      key: "total_sru",
      placeholder: "Filter by Total SSD greater than or equal to.",
    },
    {
      label: "Total HRU (GB)",
      key: "total_hru",
      placeholder: "Filter by Total HDD greater than or equal to.",
    },
    {
      label: "Total MRU (GB)",
      key: "total_mru",
      placeholder: "Filter by Total Memory greater than or equal to.",
    },
    {
      label: "Total CRU (Cores)",
      key: "total_cru",
      placeholder: "Filter by Total Cores greater than or equal to.",
    },
    {
      label: "Free Public IP",
      key: "free_ips",
      placeholder: "Filter by Free PublicIp Number greater than or equal to.",
    },
  ];

  activeFiltersList: string[] = ["Node ID"];

  get page() {
    return this.$store.getters["explorer/getNodesTablePageNumber"];
  }
  set page(value) {
    this.$store.commit("explorer/" + MutationTypes.SET_NODES_TABLE_PAGE_NUMBER, value);
  }
  get activeFilters() {
    const keySet = new Set(this.activeFiltersList);
    return this.filters.filter(filter => keySet.has(filter.label));
  }

  // Filter computed props, two-way binding on store.
  get gatewayFilter() {
    return this.$store.getters["explorer/getNodesGatewayFilter"];
  }

  set gatewayFilter(value) {
    this.$store.commit("explorer/" + MutationTypes.SET_GATEWAY_FILTER, value);
  }

  get gpuFilter() {
    return this.$store.getters["explorer/getNodesGPUFilter"];
  }

  set gpuFilter(value) {
    this.$store.commit("explorer/" + MutationTypes.SET_GPU_FILTER, value);
  }

  get nodeStatusFilter() {
    return this.$store.getters["explorer/getNodeStatusFilter"];
  }

  set nodeStatusFilter(value) {
    this.$store.commit("explorer/" + MutationTypes.SET_NODE_STATUS_FILTER, value);
  }

  // update the page/size of the request
  onUpdateOptions(pageNumber: number, pageSize: number) {
    this.$store.commit("explorer/" + MutationTypes.SET_NODES_TABLE_PAGE_NUMBER, pageNumber);
    this.$store.commit("explorer/" + MutationTypes.SET_NODES_TABLE_PAGE_SIZE, pageSize);

    // reload if the page/size changed; leads to double requests at init
    this.requestNodes();
  }

  // reload the nodes table
  requestNodes() {
    this.$store.dispatch(ActionTypes.REQUEST_NODES);
  }

  getStatus(node: { status: string }) {
    if (node.status === NodeStatusFilter.up.toLocaleLowerCase()) {
      return { color: "green", status: NodeStatusFilter.up };
    } else if (node.status === NodeStatusFilter.standBy.toLocaleLowerCase()) {
      return { color: "#dc9123", status: NodeStatusFilter.standBy };
    } else {
      return { color: "red", status: NodeStatusFilter.down };
    }
  }

  toggleActive(label: string): void {
    this.activeFiltersList = this.activeFiltersList.filter(x => x !== label);
  }

  node: INode | null = null;
  query = gql`
    query getNodeDetails($nodeId: Int!, $farmId: Int!, $twinId: Int!, $country: String!) {
      node: nodes(where: { nodeID_eq: $nodeId }) {
        country
        city
        location {
          latitude
          longitude
        }
        nodeId: nodeID
        farmId: farmID
        farmingPolicyId
        gridVersion
        uptime
        created
        updatedAt
        certificationType: certification
        interfaces {
          id
          name
          mac
          ips
        }
        publicConfig {
          ipv4
          gw4
          ipv6
          gw6
          domain
        }
        farmingPolicyId
      }

      farm: farms(where: { farmID_eq: $farmId }) {
        id
        farmId: farmID
        name
        gridVersion
        certificationType: certification
        stellarAddress
      }

      twin: twins(where: { twinID_eq: $twinId }) {
        id
        twinId: twinID
        accountId: accountID
        gridVersion
        relay
      }

      country: countries(where: { name_eq: $country, OR: { code_eq: $country } }) {
        code
      }
    }
  `;

  openSheet(node: INode): void {
    this.node = node;
  }

  closeSheet(): void {
    this.node = null;
  }
}
</script>

<style>
.v-text-field__details {
  display: none;
}

.custom-layout {
  margin-left: 20px;
}
</style>
