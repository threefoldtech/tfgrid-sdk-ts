<template>
  <slot />
</template>
<script lang="ts" setup>
import { provide, type Ref, ref } from "vue";

import type { FarmInterface } from "../types";

const subscribtion = new Set<(f?: FarmInterface) => void>();
const farm = ref<FarmInterface>();
const LoadingNodes = ref(false);

provide("farm:manager", {
  setFarmId(_farm) {
    farm.value = _farm;
    subscribtion.forEach(fn => fn(_farm));
  },
  subscribe(fn) {
    subscribtion.add(fn);
    fn(farm.value);
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
