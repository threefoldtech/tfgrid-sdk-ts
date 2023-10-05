<template>
  <div class="mt-2 text-center">
    <v-card color="primary" class="pa-3 pt-4">
      <div class="d-flex align-center justify-center items-center py-2 font-weight-bold text-h6">
        <v-icon class="mr-3" size="large">{{ item.icon }} </v-icon>
        <span>
          {{ item.title }}
        </span>
      </div>

      <v-divider class="mt-1" />

      <v-card-text class="card-body"> {{ item.data }} </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import type { IStatistics } from "@/types/index";
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
