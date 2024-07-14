<template>
  <div class="table-content">
    <v-row>
      <v-col>
        <v-data-table-server
          :style="{ maxHeight: maxHeight || '750px' }"
          :loading="loading"
          loading-text="Loading Nodes..."
          :items="modelValue"
          :items-length="count"
          :items-per-page="$props.size"
          :page="$props.page"
          @update:page="$emit('update:page', $event)"
          @update:items-per-page="$emit('update:size', $event)"
          class="nodes-table"
          :disable-sort="true"
        >
          <template #headers> </template>

          <template #item="{ index }">
            <TfNodeDetailsCard
              class="mb-4"
              v-model:node="$props.modelValue[index]"
              @click="$emit('open-dialog', modelValue[index])"
            />
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import type { PropType } from "vue";
import { capitalize } from "vue";

import { getNodeStatusColor, getNodeTypeColor } from "@/utils/get_nodes";

import TfNodeDetailsCard from "./node_selector/TfNodeDetailsCard.vue";
export default {
  emits: ["update:page", "update:size", "open-dialog"],
  props: {
    size: {
      required: true,
      type: Number,
    },
    page: {
      required: true,
      type: Number,
    },
    modelValue: {
      required: true,
      type: [] as PropType<GridNode[]>,
    },
    count: {
      required: true,
      type: Number,
    },
    loading: {
      required: true,
      type: Boolean,
    },
    maxHeight: String,
  },
  components: {
    TfNodeDetailsCard,
  },
  setup() {
    return {
      getNodeStatusColor,
      getNodeTypeColor,
      capitalize,
    };
  },
};
</script>

<style>
.nodes-table {
  background: rgb(var(--v-theme-background));

  .v-data-table-footer {
    background: rgb(var(--v-theme-surface));
  }
}
</style>
