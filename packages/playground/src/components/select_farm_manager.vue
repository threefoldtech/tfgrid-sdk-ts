<template>
  <slot />
</template>
<script lang="ts" setup>
import { provide, type Ref, ref, watch } from "vue";

import type { Farm } from "../types";

const subscribtion = new Set<(f?: Farm) => void>();
const farm = ref<Farm>();
const LoadingNodes = ref(false);

provide("farm:manager", {
  setFarmId(_farm) {
    farm.value = _farm;
  },
  subscribe(fn) {
    subscribtion.add(fn);
    return () => {
      subscribtion.delete(fn);
    };
  },
  setLoading(loading: boolean) {
    LoadingNodes.value = loading;
  },
  getLoading() {
    return LoadingNodes;
  },
} as IFarm);

watch(farm, farm => {
  subscribtion.forEach(s => s(farm));
});
</script>
<script lang="ts">
import { inject } from "vue";
export interface IFarm {
  setFarmId(farmId?: Farm): void;
  subscribe(fn: (farm?: Farm) => void): () => void;
  setLoading(loading: boolean): void;
  getLoading(): Ref<boolean>;
}

export function useFarm() {
  return inject("farm:manager") as IFarm;
}

export default {
  name: "SelectFarmManager",
};
</script>
