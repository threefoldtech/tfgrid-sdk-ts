<template>
  <Layout pageName="Nodes">
    <template v-slot:filters>
      <LayoutFilters :items="filters.map(f => f.label)" v-model="activeFiltersList" />
    </template>

    <template v-slot:active-filters>
      <div v-for="filter in activeFilters" :key="filter.key">
        <NodeFilter :filterKey="filter.key" :label="filter.label" :placeholder="filter.placeholder" />
      </div>
    </template>

    <template v-slot:table>
      <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center">
        <div>
          <v-switch
            label="Gateways (Only)"
            style="margin-bottom: -30px"
            v-model="gatewayFilter"
            @change="requestNodes"
          />
          <v-switch label="Online (Only)" v-model="onlineFilter" @change="requestNodes" />
        </div>
      </div>
      <div class="d-flex justify-center">
        <v-alert dense text type="success">
          Node statuses are updated every 2 hours. For a realtime status, please click on the row.
        </v-alert>
      </div>

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
            <v-chip :color="getStatus(item).color">{{ getStatus(item).status }}</v-chip>
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
import { Component, Vue } from "vue-property-decorator";
import DetailsV2 from "../components/DetailsV2.vue";
import { INode } from "../graphql/api";
import Layout from "../components/Layout.vue";
import LayoutFilters from "../components/LayoutFilters.vue";
import gql from "graphql-tag";
import NodeFilter from "../components/NodeFilter.vue";
import { ActionTypes } from "../store/actions";
import { MutationTypes } from "../store/mutations";

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
    { text: "HRU", value: "hru", align: "center", customAlign: "text-center", description: "Total HDD" },
    { text: "SRU", value: "sru", align: "center", customAlign: "text-center", description: "Total SSD" },
    { text: "MRU", value: "mru", align: "center", customAlign: "text-center", description: "Total Memory" },
    { text: "CRU", value: "cru", align: "center", customAlign: "text-center", description: "Total Cores" },
    { text: "Up Time", value: "uptime", align: "center", customAlign: "text-center" },
    { text: "Status", value: "status", align: "center", customAlign: "text-center" },
  ];

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

  get onlineFilter() {
    return this.$store.getters["explorer/getNodesUpFilter"];
  }

  set onlineFilter(value) {
    this.$store.commit("explorer/" + MutationTypes.SET_UP_FILTER, value);
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
    if (node.status === "up") return { color: "green", status: "Up" };
    else return { color: "red", status: "Down" };
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
