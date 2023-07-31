<template>
  <Layout>
    <template v-slot:filters>
      <LayoutFilters :items="filters.map(f => f.label)" v-model="activeFiltersList" />
    </template>

    <template v-slot:active-filters>
      <div v-for="filter in activeFilters" :key="filter.key">
        <NodeFilter :filterKey="filter.key" :label="filter.label" :items="[]" :placeholder="filter.placeholder" />
      </div>
    </template>

    <template v-slot:node-table>
      <v-card>
        <v-tabs v-model="activeTab" background-color="deep-blue accent-4" centered dark @change="onTabChange()">
          <v-tab v-for="tab in tabs" :key="tab.index" :value="tab.query" :href="'#' + tab.query">
            {{ tab.label }}
          </v-tab>
        </v-tabs>
        <NodesTable
          :tab="tabs.find(tab => tab.query === activeTab)"
          :twinId="$store.state.credentials.twin.id"
          :trigger="trigger"
          :filterKeys="activeFilters"
        />
      </v-card>
    </template>
  </Layout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import Layout from "../components/Layout.vue";
import LayoutFilters from "../components/LayoutFilters.vue";
import NodeFilter from "../components/NodeFilter.vue";
import NodesTable from "../components/NodesTable.vue";
import { ITab } from "../lib/nodes";

@Component({
  name: "NodesView",
  components: { NodesTable, LayoutFilters, Layout, NodeFilter },
})
export default class NodesView extends Vue {
  tabs: ITab[] = [
    {
      label: "Rentable",
      value: "rentable",
      query: "rentable",
      index: 1,
    },
    {
      label: "Rented",
      value: "rented",
      query: "rented",
      index: 2,
    },
    {
      label: "Mine",
      value: "mine",
      query: "rented_by",
      index: 3,
    },
  ];

  activeFiltersList: string[] = ["Total SRU (GB)"];

  get activeFilters() {
    const keySet = new Set(this.activeFiltersList);
    return this.filters.filter(filter => keySet.has(filter.label));
  }

  filters = [
    {
      label: "Total SRU (GB)",
      key: "total_sru",
      placeholder: "Filter by total SSD greater than or equal to.",
    },
    {
      label: "Total HRU (GB)",
      key: "total_hru",
      placeholder: "Filter by total HDD greater than or equal to.",
    },
    {
      label: "Total MRU (GB)",
      key: "total_mru",
      placeholder: "Filter by total Memory greater than or equal to.",
    },
    {
      label: "Total CRU (Cores)",
      key: "total_cru",
      placeholder: "Filter by total Cores greater than or equal to.",
    },
    {
      label: "GPU's vendor name",
      key: "gpu_vendor_name",
      placeholder: "Filter by GPU's vendor name.",
    },
    {
      label: "GPU's device name",
      key: "gpu_device_name",
      placeholder: "Filter by GPU's device name.",
    },
  ];

  $api = "";
  activeTab = this.tabs[0].query;
  trigger = "";

  mounted() {
    if (!(this.$api && this.$store.state.credentials.initialized)) {
      this.$router.push({ name: "accounts", path: "/" });
    }
  }

  onTabChange() {
    this.trigger = Math.random().toString(36).slice(2);
  }

  unmounted() {
    this.$store.commit("UNSET_CREDENTIALS");
  }
}
</script>
