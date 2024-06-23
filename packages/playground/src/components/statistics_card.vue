<template>
  <v-card color="primary" class="py-2 text-center flex-grow-1">
    <div class="font-weight-medium">
      <v-icon class="mr-2" size="small">{{ item.icon }} </v-icon>
      <span>
        {{ item.title }}
      </span>
    </div>

    <v-divider class="mt-1" />

    <v-card-text class="card-body"> {{ item.data }} </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import type { IStatistics } from "../types";

defineProps<{
  item: IStatistics;
}>();
</script>
<script lang="ts">
export default {
  name: "StatisticsCard",
};
</script>

<style>
.card-body {
  font-size: 0.875rem !important;
}
.v-card-text {
  padding: 0.6em;
}
.v-divider {
  opacity: 0.5;
}
</style>
