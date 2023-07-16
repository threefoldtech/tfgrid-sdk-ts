<template>
  <v-sheet width="100%" v-model="domain">
    <v-row class="d-flex align-center mx-2 mb-2">
      <h6 class="text-h5">Domain Name</h6>
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
    <!-- <v-row class="d-flex align-center mr-2 mb-2">
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
    </v-row> -->
    <v-expand-transition>
      <div class="pb-3" v-if="customDomain">
        <input-validator
          :value="domainName"
          :rules="[
            validators.required('Domain name is required.'),
            validators.isFQDN('Please provide a valid domain name.'),
          ]"
          #="{ props }"
        >
          <input-tooltip tooltip="Domain Name that will points to this instance">
            <v-text-field :disabled="!customDomain" label="Domain Name" v-model="domainName" v-bind="{ ...props }" />
          </input-tooltip>
        </input-validator>
      </div>
    </v-expand-transition>
    <SelectGatewayNode
      v-model="gatewayNode"
      v-if="!$props.hasIPv4 || !customDomain"
      customDomain
      :farmData="farmData"
    />
  </v-sheet>
</template>
<script lang="ts">
import { computed, type Ref, ref } from "vue";

import SelectGatewayNode from "../components/select_gateway_node.vue";
import type { Domain, GatewayNode, Validators } from "../types";
import { useFarmGatewayManager } from "./farm_gateway_mamager.vue";

export default {
  name: "DomainName",
  props: {
    hasIPv4: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    dynamicValidateDomain(validators: Validators) {
      return (value: string) => {
        if (this.customDomain) {
          return validators.isFQDN("test required")(value);
        }
      };
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
    expose({ domain });
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
