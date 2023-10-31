<template>
  <div class="mt-1 text-center py-0 w-100">
    <v-card color="title">
      <div class="d-flex align-center justify-center items-center py-2 font-weight-bold">
        <v-icon class="mr-1" size="large">{{ item.icon }} </v-icon>
        <span style="font-size: 1rem">
          {{ item.title }}
        </span>
      </div>

      <v-divider class="light border-opacity-75" :thickness="1" />

      <v-card-text class="card-body light py-2" style="font-size: 0.875rem"> {{ item.data }} </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import type { IStatistics } from "../types/index";
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
  font-size: 1.1rem !important;
}
</style>
