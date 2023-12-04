<template>
  <slot />
</template>
<script lang="ts" setup>
import { provide, type Ref, ref, watch } from "vue";

import type { FarmInterface } from "../types";

const subscribtion = new Set<(f?: FarmInterface) => void>();
const farm = ref<FarmInterface>();
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
  setFarmId(farmId?: FarmInterface): void;
  subscribe(fn: (farm?: FarmInterface) => void): () => void;
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
