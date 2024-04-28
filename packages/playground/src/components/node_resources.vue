<template>
  <v-row justify="center">
    <div v-for="item in resources" :key="item.name" class="mx-6 d-flex flex-column pt-2 mt-2 align-center">
      <div class="mb-2">{{ item.name }}</div>
      <div class="text-center">
        <v-progress-circular :model-value="item.value !== 'NaN' ? item.value : 0" :size="150" :width="15" color="info">
          {{ item.value !== "NaN" ? item.value + "%" : "N/A" }}
        </v-progress-circular>
      </div>
    </div>
  </v-row>
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { computed, type PropType } from "vue";

const renamedResources = ["CPU", "SSD", "HDD", "RAM"];

export default {
  name: "NodeResources",
  props: {
    node: { type: Object as PropType<GridNode>, required: true },
  },
  setup(props) {
    const resources = computed(() => {
      return ["cru", "sru", "hru", "mru"].map((id, idx) => {
        const value = Reflect.get(props.node.used_resources, id) / Reflect.get(props.node.total_resources, id);
        return {
          id,
          value: (value * 100).toFixed(2),
          name: renamedResources[idx],
        };
      });
    });

    return { resources };
  },
};
</script>
