<template>
  <div class="table-content">
    <v-row>
      <v-col>
        <v-data-table-server
          :height="height || '750px'"
          :loading="loading"
          loading-text="Loading nodes..."
          :items="modelValue"
          :items-length="count"
          :items-per-page="$props.size"
          :items-per-page-options="[
            { value: 5, title: '5' },
            { value: 10, title: '10' },
            { value: 15, title: '15' },
            { value: 50, title: '50' },
          ]"
          :page="$props.page"
          @update:page="$emit('update:page', $event)"
          @update:items-per-page="$emit('update:size', $event)"
          class="elevation-1 v-data-table-header"
          :disable-sort="true"
          :hover="true"
        >
          <tbody class="mx-4 my-4">
            <tr v-for="(node, index) in modelValue" v-bind:key="node.id" @click="openSheet($event, node)">
              <TfNodeDetailsCard :key="node.rentedByTwinId" v-model:node="$props.modelValue[index]" />
            </tr>
            <p v-if="modelValue && modelValue.length === 0 && !loading" class="mx-4 mt-10 text-center">
              No data available
            </p>
          </tbody>
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
    height: String,
  },
  components: {
    TfNodeDetailsCard,
  },
  setup(_, { emit }) {
    const openSheet = (_e: any, node: any) => {
      emit("open-dialog", node);
    };

    return {
      getNodeStatusColor,
      getNodeTypeColor,
      openSheet,
      capitalize,
    };
  },
};
</script>

<style>
.v-data-table-header th,
.v-data-table-header td {
  white-space: nowrap;
  font-size: 14px;
}
.v-data-table__thead {
  line-height: 60px;
}
</style>
<style scoped>
.v-data-table tbody tr {
  position: relative;
}
.v-data-table tbody tr::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 0.5rem;
  background-color: rgb(var(--v-theme-background));
}
</style>
