<template>
  <v-div>
    <input-validator
      :value="customDomainName"
      :rules="[
        validators.required('Domain name is required.'),
        validators.isFQDN('Please provide a valid domain name.'),
      ]"
      #="{ props }"
    >
      <input-tooltip tooltip="Domain Name that will points to this instance">
        <v-text-field
          label="Domain Name"
          v-model="customDomainName"
          @update:modelValue="$emit('update:domainName', $event)"
          v-bind="{ ...props }"
        />
      </input-tooltip>
    </input-validator>
    <SelectGatewayNode
      v-model="gateway"
      v-if="!$props.hasPublicIP"
      customDomain
      :farmData="farmData"
      @update:model-value="$emit('update:gateway', $event)"
    />
  </v-div>
</template>

<script lang="ts">
import { type Ref, ref, watch } from "vue";

import type { GatewayNode } from "@/types";

import { useFarmGatewayManager } from "./farm_gateway_mamager.vue";
import SelectGatewayNode from "./select_gateway_node.vue";

export default {
  name: "CustomDomain",
  components: {
    SelectGatewayNode,
  },
  props: {
    hasPublicIP: {
      type: Boolean,
      default: () => null,
    },
  },
  emits: {
    "update:gateway": (value?: GatewayNode) => value,
    "update:domainName": (value?: string) => value,
  },
  setup() {
    const customDomain = ref(false);
    const customDomainName = ref("");
    const FarmGatewayManager = useFarmGatewayManager();
    const farmData = ref(FarmGatewayManager?.load());
    // watch(farmData, f => console.log(f), { deep: true });
    const gatewayNode = ref() as Ref<GatewayNode>;
    const gateway = ref() as Ref<GatewayNode>;
    return {
      customDomain,
      customDomainName,
      gatewayNode,
      farmData,
      gateway,
    };
  },
};
</script>
<style></style>
