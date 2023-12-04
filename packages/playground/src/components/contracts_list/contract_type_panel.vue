<template>
  <!-- Error Alert -->
  <v-alert type="error" variant="tonal" class="mt-2 mb-4" v-if="loadingErrorMessage">
    Failed to list your contracts: {{ loadingErrorMessage }}
  </v-alert>

  <v-expansion-panel class="mb-4" :elevation="3" v-if="$props.type === ContractType.NODE">
    <v-expansion-panel-title color="primary">
      <v-icon size="30" class="pr-3">{{ icon }}</v-icon>
      <v-card-title class="pa-0">{{ title }}</v-card-title>
    </v-expansion-panel-title>

    <v-expansion-panel-text>
      <node-contracts :loading="$props.isLoading" :contracts="$props.contracts" :grid="$props.grid" />
    </v-expansion-panel-text>
  </v-expansion-panel>

  <v-expansion-panel class="mb-4" :elevation="3" v-if="$props.type === ContractType.NAME">
    <v-expansion-panel-title color="primary">
      <v-icon size="30" class="pr-3">{{ icon }}</v-icon>
      <v-card-title class="pa-0">{{ title }}</v-card-title>
    </v-expansion-panel-title>

    <v-expansion-panel-text>
      <name-contracts :loading="$props.isLoading" :contracts="$props.contracts" :grid="$props.grid" />
    </v-expansion-panel-text>
  </v-expansion-panel>

  <v-expansion-panel class="mb-4" :elevation="3" v-if="$props.type === ContractType.RENT">
    <v-expansion-panel-title color="primary">
      <v-icon size="30" class="pr-3">{{ icon }}</v-icon>
      <v-card-title class="pa-0">{{ title }}</v-card-title>
    </v-expansion-panel-title>

    <v-expansion-panel-text>
      <rent-contracts :loading="$props.isLoading" :contracts="$props.contracts" :grid="$props.grid" />
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script lang="ts" setup>
import type { GridClient } from "@threefold/grid_client";
import { defineComponent, type PropType, ref } from "vue";

import NameContracts from "@/components/contracts_list/name_contracts.vue";
import NodeContracts from "@/components/contracts_list/node_contracts.vue";
import RentContracts from "@/components/contracts_list/rent_contracts.vue";
import { ContractType } from "@/utils/contracts";

const isDataLoading = ref<boolean>(false);
const deleting = ref<boolean>(false);
const loadingErrorMessage = ref<string>();
</script>

<script lang="ts">
export default defineComponent({
  name: "ContractTypePanel",
  props: {
    title: String,
    isLoading: Boolean,
    icon: String,
    contracts: Array as PropType<any[]>,
    grid: Object as PropType<GridClient>,
    type: Object as PropType<ContractType>,
  },
});
</script>
