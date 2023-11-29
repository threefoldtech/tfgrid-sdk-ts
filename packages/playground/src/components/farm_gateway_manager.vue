<template>
  <slot />
</template>
<script lang="ts" setup>
import { provide, type Ref, ref } from "vue";

import type { FarmInterface } from "@/types";

const FarmGateway = ref() as Ref<FarmInterface | undefined>;
const Loading = ref(false);
provide("farm:gateway:manager", {
  register(farmData: FarmInterface) {
    FarmGateway.value = farmData;
  },
  setLoading(loading: boolean) {
    Loading.value = loading;
  },
  getLoading() {
    return Loading;
  },
  unregister() {
    FarmGateway.value = undefined;
  },
  load() {
    return FarmGateway;
  },
});
</script>
<script lang="ts">
import { inject } from "vue";
export interface FarmGatewayManager {
  register(farmData: FarmInterface | undefined): void;
  unregister(): void;
  setLoading(loading: boolean): void;
  getLoading(): boolean;
  load(): FarmInterface;
}

export function useFarmGatewayManager(): FarmGatewayManager | null {
  return inject("farm:gateway:manager", null);
}

export default {
  name: "FarmGatewayManager",
};
</script>
