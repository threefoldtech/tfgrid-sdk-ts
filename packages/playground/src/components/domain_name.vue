<template>
  <v-sheet width="100%" class="pl-3 my-4">
    <v-row class="d-flex align-center mr-2 mb-2">
      <h6 class="text-h5">Domain Name</h6>
      <v-tooltip location="top" text="Use subdomain with a gateway node">
        <template #activator="{ props }">
          <v-btn
            color="grey-lighten-1"
            v-bind="props"
            :class="[{ 'ma-2': true, 'bg-primary': !customDomain }]"
            @click="customDomain = !customDomain"
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
            @click="customDomain = !customDomain"
            >Custom</v-btn
          >
        </template>
      </v-tooltip>
    </v-row>

    <CustomDomain v-if="customDomain"></CustomDomain>
    <SelectGatewayNode v-else></SelectGatewayNode>
  </v-sheet>
</template>
<script lang="ts">
import { ref } from "vue";

import CustomDomain from "../components/custom_domain.vue";
import SelectGatewayNode from "../components/select_gateway_node.vue";
export default {
  name: "DomainName",
  setup() {
    const customDomain = ref(false);
    const domainName = ref();
    return {
      customDomain,
      domainName,
    };
  },
  components: { SelectGatewayNode, CustomDomain },
};
</script>
