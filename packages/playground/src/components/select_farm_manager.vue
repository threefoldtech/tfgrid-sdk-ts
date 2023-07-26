<template>
  <slot />
</template>
<script lang="ts" setup>
import { provide, type Ref, ref, watch } from "vue";

const subscribtion: any[] = [];
const farm = ref() as Ref<number | undefined>;
provide("farm:manager", {
  setFarmId(_farm) {
    farm.value = _farm;
  },
  subscribe(fn) {
    subscribtion.push(fn);
    return () => {
      subscribtion.splice(subscribtion.indexOf(fn), 1);
    };
  },
} as IFarm);

watch(farm, farm => {
  subscribtion.forEach(s => s(farm));
});
</script>
<script lang="ts">
import { inject } from "vue";
export interface IFarm {
  setFarmId(farmId?: number): void;
  subscribe(fn: (farm?: number) => void): () => void;
}

export function useFarm(): IFarm | null {
  return inject("farm:manager", null);
}

export default {
  name: "SelectFarmManager",
};
</script>
