<template>
  <div class="mt-8">
    <v-card color="primary" class="my-3 pa-3 text-center">
      <div>
        <v-icon size="30">{{ item.icon }}</v-icon>
        <h4 class="d-inline">{{ item.title }}</h4>
        <v-divider class="mt-1" />
        <p class="text-center">{{ item.data }}</p>
      </div>
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
