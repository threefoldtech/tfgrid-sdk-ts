<template>
  <div class="pt-5">
    <v-card>
      <v-tabs v-model="activeTab" align-tabs="center">
        <v-tab v-for="(tab, index) in tabs" :key="index" :value="index" color="info">
          {{ tab.label }}
        </v-tab>
      </v-tabs>
    </v-card>
  </div>
  <div>
    <v-card class="pa-5">
      <v-data-table-server
        :loading="$props.loading"
        :items-length="$props.nodesCount"
        loading-text="Loading nodes..."
        :headers="headers"
        :items="nodes"
        v-model:items-per-page="$props.options.size"
        v-model:expanded="expanded"
        :hide-no-data="false"
        :disable-sort="true"
        class="elevation-1"
        :hover="true"
        :items-per-page-options="pageOptions"
        v-model:page="$props.options.page"
        return-object
        @click:row="toggleExpand"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <reserve-btn :node="(item.raw as unknown as GridNode)" @updateTable="emits('reload-table')" />
        </template>

        <template v-slot:[`item.price`]="{ item }">
          <v-tooltip bottom color="primary" close-delay="100">
            <template v-slot:activator="{ isActive, props }">
              <span v-bind="props" v-on="isActive">{{ item.raw.price }} *</span>
            </template>
            <span>
              Discounts: <v-spacer />
              <ul class="pl-2">
                <li>
                  {{ activeTab == 1 ? "You receive " : "You'll be receiving " }} 50% discount if you reserve an entire
                  <a
                    target="_blank"
                    href="https://manual.grid.tf/dashboard/portal/dashboard_portal_dedicated_nodes.html#billing--pricing"
                  >
                    node
                  </a>
                </li>
                <li>
                  {{ activeTab == 1 ? "You're receiving " : "You'll be receiving " }} {{ item.raw.discount }}% discount
                  as per the
                  <a
                    target="_blank"
                    href="https://manual.grid.tf/wiki/cloudunits/pricing/staking_discount_levels.html#staking-discount-levels"
                  >
                    <p style="display: inline">staking discounts</p>
                  </a>
                </li>
              </ul>
            </span>
          </v-tooltip>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
          <node-details :node="(item.raw as unknown as GridNode)" :columns-len="columns.length" />
        </template>
      </v-data-table-server>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const headers: VDataTable["headers"] = [
  { title: "Node ID", key: "nodeId", sortable: false },
  { title: "Location", key: "location.country", sortable: false },
  { title: "CPU", key: "total_resources.cru", sortable: false },
  {
    title: "RAM",
    key: "total_resources.mru",
    value: item => formatResourceSize(item.total_resources.mru),
    sortable: false,
  },
  {
    title: "SSD",
    key: "total_resources.sru",
    value: item => formatResourceSize(item.total_resources.sru),
    sortable: false,
  },
  {
    title: "HDD",
    key: "total_resources.hru",
    value: item => formatResourceSize(item.total_resources.hru),
    sortable: false,
  },
  { title: "GPU", key: "num_gpu", sortable: false },
  {
    title: "Price (USD)",
    key: "price",
    sortable: false,
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
  },
];

const expanded = ref<any[]>([]);
const expandedId = ref<string>("");
const tabs = [{ label: "Rentable" }, { label: "Mine" }];
const activeTab = ref(0);
const pageOptions: { value: number; title: string }[] = [
  { value: 5, title: "5" },
  { value: 10, title: "10" },
  { value: 15, title: "15" },
  { value: 50, title: "50" },
];

defineProps({
  options: {
    type: Object as PropType<FilterOptions>,
    required: true,
  },
  nodes: {
    type: Object as PropType<any[]>,
    required: true,
  },
  nodesCount: {
    type: Number,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
});

const emits = defineEmits(["reload-table", "update-active-tab-value"]);

watch(
  activeTab,
  () => {
    emits("update-active-tab-value", activeTab.value);
  },
  { deep: true },
);

function toggleExpand(e: any, data: any) {
  if (data.item.props.title.id === expandedId.value) {
    expanded.value = [];
    expandedId.value = "";
    return;
  }

  if (expanded.value.length) {
    expanded.value = [];
    expandedId.value = "";
  }

  expanded.value.push(data.item.props.title);
  expandedId.value = data.item.props.title.id;
}
</script>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { type PropType, ref, watch } from "vue";
import type { VDataTable } from "vuetify/labs/VDataTable";
import { VDataTableServer } from "vuetify/labs/VDataTable";

import type { FilterOptions } from "@/types";
import formatResourceSize from "@/utils/format_resource_size";

import NodeDetails from "./node_details.vue";
import ReserveBtn from "./reserve_action_btn.vue";

export default {
  name: "Dedicated Node",
  components: {
    ReserveBtn,
    NodeDetails,
  },
};
</script>

<style>
.v-table__wrapper {
  min-height: 100px;
}

.v-tooltip > .v-overlay__content {
  pointer-events: initial !important;
}
</style>
