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
      <input-tooltip tooltip="Wordpress admin email.">
        <v-text-field
          label="Domain Name"
          v-model="customDomainName"
          @update:modelValue="$emit('update:customDomainName', $event)"
          v-bind="{ ...props }"
        />
      </input-tooltip>
    </input-validator>
    <select_gateway_node v-if="!$props.hasPublicIP" v-model="gateway"></select_gateway_node>
  </v-div>
</template>

<script lang="ts">
import { type Ref, ref, watch } from "vue";

import type { GatewayNode } from "@/types";

import { useFarmGatewayManager } from "./farm_gateway_mamager.vue";
import select_gateway_node from "./select_gateway_node.vue";

export default {
  name: "Gateway",
  components: {
    select_gateway_node,
  },
  props: {
    hasPublicIP: {
      type: Boolean,
      default: () => null,
    },
  },
  emits: {
    "update:customDomainName": (value?: string) => value,
  },
  setup() {
    const customDomain = ref(false);
    const customDomainName = ref("");
    const FarmGatewayManager = useFarmGatewayManager();
    const farmData = ref(FarmGatewayManager?.load());
    watch(farmData, f => console.log(f), { deep: true });
    const gateway = ref() as Ref<GatewayNode>;
    return {
      customDomain,
      customDomainName,
      gateway,
      farmData,
    };
  },
};
</script>
<style></style>
