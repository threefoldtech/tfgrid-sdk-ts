<template>
  <div class="mt-2 text-center py-0 w-100">
    <v-card color="primary">
      <div class="d-flex align-center justify-center items-center py-2 font-weight-bold text-h6">
        <v-icon class="mr-1" size="large">{{ item.icon }} </v-icon>
        <span>
          {{ item.title }}
        </span>
      </div>

      <v-divider class="mt-1" />

      <v-card-text style="background-color: #1aa18f; color: white" class="card-body"> {{ item.data }} </v-card-text>
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
