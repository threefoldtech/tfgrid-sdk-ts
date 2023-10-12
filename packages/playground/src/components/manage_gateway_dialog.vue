<template>
  <div>
    <v-dialog
      model-value
      @update:model-value="$emit('close')"
      scrollable
      width="70%"
      :persistent="deleting || layout?.status === 'deploy'"
    >
      <weblet-layout
        ref="layout"
        @back="
          () => {
            gatewayTab = 0;
            loadGateways();
          }
        "
      >
        <template #title>Manage Gateways </template>

        <v-tabs align-tabs="center" color="primary" class="mb-6" v-model="gatewayTab" :disabled="deleting">
          <v-tab>Gateway List</v-tab>
          <v-tab>Add new gateway</v-tab>
        </v-tabs>

        <div v-show="gatewayTab === 0" :class="{ 'pb-2': !loadingGateways, 'pb-6': loadingGateways }">
          <div class="d-flex justify-end mb-4">
            <v-btn color="primary" :loading="loadingGateways" :disabled="deleting" @click="loadGateways" variant="tonal"
              >Reload</v-btn
            >
          </div>
          <list-table
            :headers="[
              { title: 'Name', key: 'name' },
              { title: 'Contract ID', key: 'contractId' },
              { title: 'Domain', key: 'domain' },
              { title: 'TLS Passthrough', key: 'tls_passthrough' },
              { title: 'Backends', key: 'backends' },
              { title: 'Status', key: 'status' },
            ]"
            :items="gateways"
            return-object
            :loading="loadingGateways"
            v-model="gatewaysToDelete"
            :deleting="deleting"
          >
            <template #[`item.tls_passthrough`]="{ item }">
              {{ item.value.tls_passthrough ? "Yes" : "No" }}
            </template>

            <template #[`item.status`]="{ item }">
              {{ item.value.status.toUpperCase() }}
            </template>
          </list-table>
        </div>

        <div v-show="gatewayTab === 1">
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
                :rules="[
                  validators.required('Domain is required.'),
                  validators.isFQDN('Please provide a valid domain.'),
                ]"
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
        </div>

        <template #footer-actions>
          <v-btn
            color="error"
            variant="outlined"
            :disabled="gatewaysToDelete.length === 0 || deleting || loadingGateways"
            v-if="gatewayTab === 0"
            @click="requestDelete = true"
          >
            Delete
          </v-btn>
          <v-btn color="primary" variant="tonal" @click="deployGateway" :disabled="!valid" v-else> Deploy </v-btn>
        </template>
      </weblet-layout>
    </v-dialog>

    <v-dialog v-model="requestDelete" max-width="600px">
      <v-card>
        <v-card-title> Are you sure you want to delete the following gateways? </v-card-title>
        <v-card-text class="d-flex">
          <v-chip color="error" label variant="tonal" class="mr-1 mb-1" v-for="gw in gatewaysToDelete" :key="gw.name">
            {{ gw.name }}
          </v-chip>
        </v-card-text>

        <v-divider />

        <v-card-actions class="d-flex justify-end">
          <v-btn
            color="error"
            variant="outlined"
            size="small"
            :disabled="loadingGateways || deleting"
            @click="
              () => {
                requestDelete = false;
                deleteSelectedGateways();
              }
            "
            >Delete</v-btn
          >
          <v-btn color="secondary" variant="tonal" size="small" @click="requestDelete = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { onMounted, PropType, ref } from "vue";

import { useProfileManager } from "../stores";
import type { GatewayNode } from "../types";
import { deployGatewayName, type GridGateway, loadDeploymentGateways } from "../utils/gateway";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";
import { generateName } from "../utils/strings";
import ListTable from "./list_table.vue";
import SelectGatewayNode from "./select_gateway_node.vue";
import { useLayout } from "./weblet_layout.vue";

export interface VM {
  deploymentName: string;
  projectName: string;
}

export default {
  name: "ManageGatewayDialog",
  components: { SelectGatewayNode, ListTable },
  props: {
    vm: Object as PropType<VM>,
  },
  setup(props) {
    const profileManager = useProfileManager();
    const layout = useLayout();
    const gatewayTab = ref(0);

    const subdomain = ref<string>(generateName({}, 12));
    const gatewayNode = ref<GatewayNode>();
    const port = ref(80);
    const useCustomDomain = ref(false);
    const domain = ref<string>();
    const valid = ref(false);

    const ip = props.vm[0].interfaces[0].ip as string;
    const networkName = props.vm[0].interfaces[0].network as string;

    onMounted(loadGateways);

    const loadingGateways = ref(false);
    const gateways = ref<GridGateway[]>([]);
    async function loadGateways() {
      gateways.value = [];
      gatewaysToDelete.value = [];
      loadingGateways.value = true;
      const grid = await getGrid(profileManager.profile!, props.vm.projectName);
      gateways.value = await loadDeploymentGateways(grid);
      loadingGateways.value = false;
    }

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

    const requestDelete = ref(false);
    const gatewaysToDelete = ref<GridGateway[]>([]);
    const deleting = ref(false);
    async function deleteSelectedGateways() {
      deleting.value = true;
      const grid = await getGrid(profileManager.profile!, props.vm.projectName);
      const deletedGateways = new Set<GridGateway>();
      for (const gw of gatewaysToDelete.value) {
        await grid.gateway
          .delete_name(gw)
          .then(() => deletedGateways.add(gw))
          .catch(() => []);
      }
      gatewaysToDelete.value = gatewaysToDelete.value.filter(gw => !deletedGateways.has(gw));
      gateways.value = gateways.value.filter(gw => !deletedGateways.has(gw));
      deleting.value = false;
      if (gatewaysToDelete.value.length > 0) {
        layout.value.setStatus("failed", `Failed to delete some of the selected gateways.`);
      }
    }

    return {
      layout,
      gatewayTab,

      loadingGateways,
      gateways,

      subdomain,
      gatewayNode,
      port,
      useCustomDomain,
      domain,
      valid,

      ip,
      networkName,

      loadGateways,
      deployGateway,

      requestDelete,
      gatewaysToDelete,
      deleting,
      deleteSelectedGateways,
    };
  },
};
</script>
