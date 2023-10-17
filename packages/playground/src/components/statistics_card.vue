<template>
  <div class="mt-2 text-center">
    <v-card color="primary" class="pt-2">
      <div class="d-flex align-center justify-center items-center font-weight-medium">
        <v-icon class="mr-2" size="small">{{ item.icon }} </v-icon>
        <span>
          {{ item.title }}
        </span>
      </div>

      <v-divider class="mt-1 text-red-700" />

      <v-card-text class="card-body"> {{ item.data }} </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import type { IStatistics as IStatistics } from "../types";

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
