<template>
  <v-dialog model-value @update:model-value="$emit('close')" scrollable width="70%">
    <weblet-layout ref="layout">
      <template #title>Manage Gateways </template>

      <form-validator v-model="valid">
        <input-validator
          :value="subdomain"
          :rules="[
            validators.required('Subdomain is required.'),
            validators.isLowercase('Subdomain should consist of lowercase letters only.'),
            validators.isAlphanumeric('Subdomain should consist of letters and numbers only.'),
            subdomain => validators.isAlpha('Subdomain must start with alphabet char.')(subdomain[0]),
            validators.minLength('Subdomain must be at least 4 characters.', 4),
            validators.maxLength('Subdomain cannot exceed 15 characters.', 15),
          ]"
          #="{ props }"
        >
          <v-text-field label="Subdomain" v-model.trim="subdomain" v-bind="props" />
        </input-validator>

        <select-gateway-node v-model.number="gatewayNode" />

        <input-validator
          :value="port"
          :rules="[validators.required('Port is required.'), validators.isPort('Please provide a valid port.')]"
          #="{ props }"
        >
          <v-text-field label="Port" v-model.number="port" type="number" v-bind="props" />
        </input-validator>

        <v-checkbox label="Custom Domain" v-model="useCustomDomain" hide-details />

        <template v-if="useCustomDomain">
          <input-validator
            :value="domain"
            :rules="[validators.required('Domain is required.'), validators.isFQDN('Please provide a valid domain.')]"
            #="{ props }"
          >
            <v-text-field label="Domain" autofocus v-model.trim="domain" v-bind="props" />
          </input-validator>
        </template>

        <copy-input-wrapper #="{ props }" :data="networkName">
          <v-text-field label="Network Name" v-model="networkName" v-bind="props" />
        </copy-input-wrapper>

        <copy-input-wrapper #="{ props }" :data="ip">
          <v-text-field label="IP Address" v-model="ip" v-bind="props" />
        </copy-input-wrapper>
      </form-validator>

      <template #footer-actions>
        <v-btn color="primary" variant="tonal" @click="deployGateway" :disabled="!valid"> Deploy </v-btn>
      </template>
    </weblet-layout>
  </v-dialog>
</template>

<script lang="ts">
import { onMounted, PropType, ref } from "vue";

import { useProfileManager } from "../stores";
import type { GatewayNode } from "../types";
import { deployGatewayName, getSubdomain } from "../utils/gateway";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";
import { generateName } from "../utils/strings";
import SelectGatewayNode from "./select_gateway_node.vue";
import { useLayout } from "./weblet_layout.vue";

export interface VM {
  deploymentName: string;
  projectName: string;
}

export default {
  name: "ManageGatewayDialog",
  components: { SelectGatewayNode },
  props: {
    vm: Object as PropType<VM>,
  },
  setup(props) {
    const profileManager = useProfileManager();
    const layout = useLayout();

    const subdomain = ref<string>(generateName({}, 12));
    const gatewayNode = ref<GatewayNode>();
    const port = ref(80);
    const useCustomDomain = ref(false);
    const domain = ref<string>();
    const valid = ref(false);

    const ip = props.vm[0].interfaces[0].ip as string;
    const networkName = props.vm[0].interfaces[0].network as string;

    const initializing = ref(true);
    onMounted(async () => {
      const grid = await getGrid(profileManager.profile!, props.vm.projectName);
      // const gateways = await grid.gateway.getObj("gw22");
      // console.log({ gateways });
      const list = await grid.gateway.list();
      console.log(await Promise.all(list.map(x => grid.gateway.getObj(x))));
    });

    async function deployGateway() {
      layout.value.setStatus("deploy");

      try {
        const [x, y] = ip.split(".");
        const grid = await getGrid(profileManager.profile!, props.vm.projectName);
        await grid.networks
          .addNode({ name: networkName, ipRange: `${x}.${y}.0.0/16`, nodeId: gatewayNode.value.id })
          .catch(() => null);

        await deployGatewayName(grid!, {
          name: subdomain.value,
          nodeId: gatewayNode.value.id,
          ip,
          networkName,
          port: port.value,
          fqdn: useCustomDomain.value ? domain.value : undefined,
        });
        layout.value.setStatus("success", "Successfully deployed gateway.");
      } catch (error) {
        layout.value.setStatus("failed", normalizeError(error, "Something went wrong."));
      }
    }

    return {
      layout,
      initializing,

      subdomain,
      gatewayNode,
      port,
      useCustomDomain,
      domain,
      valid,

      ip,
      networkName,

      deployGateway,
    };
  },
};
</script>
