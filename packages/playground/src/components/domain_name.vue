<template>
  <v-sheet width="100%" class="pl-3 my-4" v-model="domain">
    <v-row class="d-flex align-center mr-2 mb-2">
      <h6 class="text-h5">Domain Name</h6>
      <v-tooltip location="top" text="Use subdomain with a gateway node">
        <template #activator="{ props }">
          <v-btn
            color="grey-lighten-1"
            v-bind="props"
            :class="[{ 'ma-2': true, 'bg-primary': !customDomain }]"
            @click="customDomain = false"
            >Gateway</v-btn
          >
        </template></v-tooltip
      >
      <v-tooltip location="top" text="Use Custom domain name">
        <template #activator="{ props }">
          <v-btn
            color="grey-lighten-1"
            v-bind="props"
            :class="[{ 'ma-2': true, 'bg-primary': customDomain }]"
            @click="customDomain = true"
            >Custom</v-btn
          >
        </template>
      </v-tooltip>
    </v-row>
    <v-expand-transition>
      <v-container v-if="customDomain" class="pa-0">
        <input-validator
          :value="domainName"
          :rules="[
            validators.required('Domain name is required.'),
            validators.isFQDN('Please provide a valid domain name.'),
          ]"
          #="{ props }"
        >
          <input-tooltip tooltip="Domain Name that will points to this instance">
            <v-text-field label="Domain Name" v-model="domainName" v-bind="{ ...props }" />
          </input-tooltip>
        </input-validator>
        <SelectGatewayNode v-model="gatewayNode" v-if="!$props.hasIPv4" customDomain :farmData="farmData" />
      </v-container>
    </v-expand-transition>
    <SelectGatewayNode v-if="!customDomain" v-model="gatewayNode"></SelectGatewayNode>
  </v-sheet>
</template>
<script lang="ts">
import { computed, type Ref, ref } from "vue";

import SelectGatewayNode from "../components/select_gateway_node.vue";
import type { Domain, GatewayNode } from "../types";
import { useFarmGatewayManager } from "./farm_gateway_mamager.vue";

export default {
  name: "DomainName",
  props: {
    hasIPv4: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { expose }) {
    const customDomain = ref(false);
    const domainName = ref("");
    const domain: Ref<GatewayNode | Domain> = computed(() => {
      if (!customDomain.value) {
        return gatewayNode.value;
      } else {
        return {
          name: domainName.value,
          useFQDN: props.hasIPv4,
          gatewayNode: props.hasIPv4 ? undefined : gatewayNode.value,
        };
      }
    });
    expose(domain);
    const gatewayNode = ref() as Ref<GatewayNode>;
    const FarmGatewayManager = useFarmGatewayManager();
    const farmData = ref(FarmGatewayManager?.load());
    return {
      customDomain,
      gatewayNode,
      domainName,
      farmData,
      domain,
    };
  },
  components: { SelectGatewayNode },
};
</script>
