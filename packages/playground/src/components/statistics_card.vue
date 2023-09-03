<template>
  <div class="mt-8">
    <v-card color="primary" class="pa-3 pt-6" height="200">
      <v-icon class="ml-3">{{ item.icon }} </v-icon>
      <v-card-title> {{ item.title }} </v-card-title>
      <v-divider class="mt-1" />

      <v-card-text> {{ item.data }} </v-card-text>
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
