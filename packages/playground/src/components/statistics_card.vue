<template>
  <div class="mt-2 text-center">
    <v-card color="primary" class="pa-3 pt-4">
      <div class="d-flex align-center justify-center items-center py-2 font-weight-bold text-h7">
        <v-icon class="mr-3" size="large">{{ item.icon }} </v-icon>
        <span>
          {{ item.title }}
        </span>
      </div>

      <v-divider class="mt-1" />

      <v-card-title> {{ item.data }} </v-card-title>
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
