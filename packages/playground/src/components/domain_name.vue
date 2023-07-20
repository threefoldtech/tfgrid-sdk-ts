<template>
  <v-sheet width="100%" v-model="domain">
    <h6 class="text-h5">Domain Name</h6>
    <v-tooltip location="top" text="Use Custom domain name">
      <template #activator="{ props }">
        <v-switch v-bind="props" v-model="customDomain" hide-details color="primary" inset label="Custom domain" />
      </template>
    </v-tooltip>
    <v-expand-transition>
      <div v-if="customDomain">
        <input-validator
          :value="domainName"
          :rules="[
            validators.required('Domain name is required.'),
            validators.isFQDN('Please provide a valid domain name.'),
          ]"
          #="{ props }"
        >
          <input-tooltip tooltip="Domain Name that will points to this instance">
            <v-text-field
              :disabled="!customDomain"
              label="Custom domain name"
              v-model="domainName"
              v-bind="{ ...props }"
            />
          </input-tooltip>
        </input-validator>
      </div>
    </v-expand-transition>
    <div v-if="(!$props.hasIPv4 || !customDomain) && !loading">
      <v-expand-transition>
        <SelectGatewayNode ref="selectGateway" v-model="gatewayNode" customDomain :farmData="farmData" />
      </v-expand-transition>
      <v-expand-transition>
        <v-alert
          v-show="domain?.useFQDN && domain?.ip && domainName && !selectGateway?.loading"
          class="mb-2"
          type="warning"
          variant="tonal"
        >
          Before starting the deployment, Please make sure to create an A record on your name provider with
          <span class="font-weight-bold">{{ domainName }}</span> pointing to
          <span class="font-weight-bold">{{ domain?.ip }}</span>
        </v-alert>
      </v-expand-transition>
    </div>
  </v-sheet>
</template>
<script lang="ts">
import { computed, type Ref, ref } from "vue";

import SelectGatewayNode from "../components/select_gateway_node.vue";
import type { GatewayNode } from "../types";
import { useFarmGatewayManager } from "./farm_gateway_manager.vue";

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
    const selectGateway = ref();
    const domainName = ref("");
    const domain: Ref<GatewayNode> = computed(() => {
      if (!customDomain.value) {
        return gatewayNode.value;
      } else {
        return {
          domain: domainName.value,
          useFQDN: !props.hasIPv4,
          id: !props.hasIPv4 ? gatewayNode.value?.id : undefined,
          ip: !props.hasIPv4 ? gatewayNode.value?.ip : undefined,
        };
      }
    });
    expose({ domain, customDomain });
    const gatewayNode = ref() as Ref<GatewayNode>;
    const FarmGatewayManager = useFarmGatewayManager();
    const farmData = ref(FarmGatewayManager?.load());
    const loading = ref(FarmGatewayManager?.getLoading());
    return {
      customDomain,
      gatewayNode,
      domainName,
      farmData,
      loading,
      domain,
      selectGateway,
    };
  },
  components: { SelectGatewayNode },
};
</script>
