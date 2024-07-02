<template>
  <div>
    <v-dialog
      model-value
      @update:model-value="$emit('close')"
      scrollable
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
        <template #title>Manage Domains ({{ $props.vm.name }})</template>

        <v-tabs align-tabs="center" color="secondary" class="mb-6" v-model="gatewayTab" :disabled="deleting">
          <v-tab>Domains List</v-tab>
          <v-tab>Add new domain</v-tab>
        </v-tabs>

        <v-alert
          type="warning"
          variant="tonal"
          class="mb-4"
          v-if="failedToListGws.length && gatewayTab === 0 && !loadingGateways"
        >
          Failed to list {{ failedToListGws.length }} domains.

          <template #append>
            <v-btn
              icon="mdi-format-list-bulleted-square"
              variant="plain"
              size="x-small"
              @click="failedDomainDialog = true"
            />
          </template>
        </v-alert>

        <v-dialog v-model="failedDomainDialog" max-width="400px" scrollable>
          <v-card>
            <v-card-title class="bg-warning">Failed Domains</v-card-title>

            <v-card-text>
              <ul style="list-style: square">
                <li v-for="gw in failedToListGws" :key="gw">
                  <span>{{
                    gw.startsWith(prefix)
                      ? gw.slice(prefix.length)
                      : gw.startsWith(oldPrefix)
                      ? gw.slice(oldPrefix.length)
                      : gw
                  }}</span>
                </li>
              </ul>
            </v-card-text>
          </v-card>
        </v-dialog>

        <div v-show="gatewayTab === 0" :class="{ 'pb-2': !loadingGateways, 'pb-6': loadingGateways }">
          <div class="d-flex justify-end mb-4">
            <v-btn
              color="secondary"
              :loading="loadingGateways"
              :disabled="deleting"
              @click="loadGateways"
              variant="outlined"
              >Reload</v-btn
            >
          </div>
          <list-table
            :headers="[
              { title: 'Name', key: 'name' },
              { title: 'Contract ID', key: 'contractId' },
              { title: 'Domain', key: 'domain' },
              { title: 'TLS Passthrough', key: 'tls_passthrough' },
              { title: 'Backend', key: 'backends' },
              { title: 'Status', key: 'status' },
              { title: 'Actions', key: 'actions' },
            ]"
            :items="gateways"
            return-object
            :loading="loadingGateways"
            v-model="gatewaysToDelete"
            :deleting="deleting"
            no-data-text="No domains attached to this virtual machine."
          >
            <template #[`item.name`]="{ item }">
              {{ item.name }}
            </template>

            <template #[`item.tls_passthrough`]="{ item }">
              {{ item.tls_passthrough ? "Yes" : "No" }}
            </template>

            <template #[`item.backends`]="{ item }">
              {{ (Array.isArray(item.backends) ? item.backends[0] : item.backends) ?? "-" }}
            </template>

            <template #[`item.status`]="{ item }">
              {{ item.status.toUpperCase() }}
            </template>

            <template #[`item.actions`]="{ item }">
              <IconActionBtn tooltip="Visit" icon="mdi-web" color="anchor" :href="'https://' + item.domain" />
            </template>
          </list-table>
        </div>

        <div v-if="gatewayTab === 1">
          <form-validator v-model="valid">
            <input-tooltip tooltip="Selecting custom domain sets subdomain as gateway name.">
              <input-validator
                :value="subdomain"
                :rules="[
                  validators.required('Subdomain is required.'),
                  validators.isLowercase('Subdomain should consist of lowercase letters only.'),
                  validators.isAlphanumeric('Subdomain should consist of letters and numbers only.'),
                  subdomain => validators.isAlpha('Subdomain must start with alphabet char.')(subdomain[0]),
                  validators.minLength('Subdomain must be at least 4 characters.', 4),
                  subdomain => validators.maxLength('Subdomain cannot exceed 50 characters.', 50)(subdomain),
                ]"
                :async-rules="gatewayTab === 1 ? [validateSubdomain] : []"
                #="{ props }"
              >
                <v-text-field label="Subdomain" v-model.trim="subdomain" v-bind="props" />
              </input-validator>
            </input-tooltip>

            <div :style="{ marginTop: '-10px' }">
              <TfSelectionDetails disable-node-selection require-domain use-fqdn v-model="selectionDetails" />
            </div>

            <input-validator
              :value="port"
              :rules="[validators.required('Port is required.'), validators.isPort('Please provide a valid port.')]"
              #="{ props }"
            >
              <v-text-field label="Port" v-model.number="port" type="number" v-bind="props" />
            </input-validator>

            <div :style="{ marginTop: '-10px' }">
              <input-tooltip
                tooltip="When enabled, the backend service will terminate the TLS traffic, otherwise the gateway service will do the TLS traffic termination."
                inline
              >
                <v-switch
                  label="TLS Passthrough"
                  hide-details
                  inset
                  variant="tonal"
                  color="primary"
                  v-model="passThrough"
                />
              </input-tooltip>
            </div>

            <copy-input-wrapper #="{ props }" :data="networkName">
              <v-text-field label="Network name" v-model="networkName" readonly v-bind="props" />
            </copy-input-wrapper>

            <copy-input-wrapper #="{ props }" :data="ip">
              <v-text-field label="Wireguard IP Address" v-model="ip" readonly v-bind="props" />
            </copy-input-wrapper>
          </form-validator>
        </div>

        <template #footer-actions>
          <v-btn color="anchor" @click="$emit('close')">Close</v-btn>
          <v-btn
            color="error"
            :disabled="gatewaysToDelete.length === 0 || deleting || loadingGateways"
            v-if="gatewayTab === 0"
            @click="requestDelete = true"
          >
            Delete
          </v-btn>
          <v-btn color="secondary" @click="deployGateway" :disabled="!valid" v-else> Add </v-btn>
        </template>
      </weblet-layout>
    </v-dialog>

    <v-dialog v-model="requestDelete" max-width="600px">
      <v-card>
        <v-card-title> Are you sure you want to delete the following gateways? </v-card-title>
        <v-card-text class="d-flex flex-wrap">
          <v-chip label class="mr-1 mb-5" v-for="gw in gatewaysToDelete" :key="gw.name">
            {{ gw.name }}
          </v-chip>
          <v-divider />
        </v-card-text>

        <v-card-actions class="justify-end mb-1 mr-2">
          <v-btn color="anchor" @click="requestDelete = false">Cancel</v-btn>
          <v-btn
            color="error"
            :disabled="loadingGateways || deleting"
            @click="
              () => {
                requestDelete = false;
                deleteSelectedGateways();
              }
            "
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import type { GridClient } from "@threefold/grid_client";
import { onMounted, type PropType, ref } from "vue";

import { useGrid } from "../stores";
import { ProjectName } from "../types";
import type { SelectionDetails } from "../types/nodeSelector";
import { deployGatewayName, type GridGateway, loadDeploymentGateways } from "../utils/gateway";
import { updateGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";
import { generateName } from "../utils/strings";
import { isAvailableName } from "../utils/validators";
import IconActionBtn from "./icon_action_btn.vue";
import ListTable from "./list_table.vue";
import { useLayout } from "./weblet_layout.vue";

export default {
  name: "ManageGatewayDialog",
  components: { ListTable, IconActionBtn },
  props: {
    vm: { type: Array as PropType<any>, required: true },
  },
  setup(props) {
    const layout = useLayout();
    const gatewayTab = ref(0);

    const oldPrefix = ref("");
    const prefix = ref("");
    const subdomain = ref("");
    const port = ref(80);
    const passThrough = ref(false);
    const valid = ref(false);
    const selectionDetails = ref<SelectionDetails>();

    const ip = props.vm.interfaces[0].ip as string;
    const networkName = props.vm.interfaces[0].network as string;
    const gridStore = useGrid();
    const grid = gridStore.client as unknown as GridClient;

    onMounted(async () => {
      updateGrid(grid, { projectName: "" });

      oldPrefix.value =
        (props.vm.projectName.toLowerCase().includes(ProjectName.Fullvm.toLowerCase()) ? "fvm" : "vm") +
        grid!.config.twinId;
      prefix.value = oldPrefix.value + props.vm.name;
      subdomain.value = generateName({ prefix: prefix.value }, 4);
      await loadGateways();
    });

    const loadingGateways = ref(false);
    const gateways = ref<GridGateway[]>([]);
    const failedToListGws = ref<string[]>([]);
    const failedDomainDialog = ref(false);
    async function loadGateways() {
      try {
        gateways.value = [];
        gatewaysToDelete.value = [];
        loadingGateways.value = true;
        updateGrid(grid, { projectName: props.vm.projectName });

        const { gateways: gws, failedToList } = await loadDeploymentGateways(grid!, {
          filter: gw => gw.backends.some(bk => bk.includes(ip)),
        });
        gateways.value = gws;
        failedToListGws.value = failedToList;
      } catch (error) {
        layout.value.setStatus("failed", normalizeError(error, "Failed to list this deployment's domains."));
      } finally {
        loadingGateways.value = false;
      }
    }

    async function deployGateway() {
      layout.value.setStatus("deploy");

      try {
        const [x, y] = ip.split(".");

        const data = {
          name: networkName,
          ipRange: `${x}.${y}.0.0/16`,
          nodeId: selectionDetails.value!.domain!.selectedDomain!.nodeId,
          mycelium: false,
        };

        const hasNode = await grid!.networks.hasNode(data);

        if (!hasNode) {
          await grid!.networks.addNode(data);
        }

        await deployGatewayName(grid, selectionDetails.value!.domain, {
          subdomain: subdomain.value,
          ip,
          port: port.value,
          network: networkName,
          tlsPassthrough: passThrough.value,
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
      const deletedGateways = new Set<GridGateway>();
      for (const gw of gatewaysToDelete.value) {
        await grid!.gateway
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

    async function validateSubdomain() {
      return await isAvailableName(grid!, subdomain.value);
    }

    return {
      oldPrefix,
      prefix,
      layout,
      gatewayTab,

      loadingGateways,
      gateways,
      failedToListGws,
      failedDomainDialog,

      subdomain,
      port,
      selectionDetails,
      passThrough,
      valid,

      ip,
      networkName,

      loadGateways,
      deployGateway,

      requestDelete,
      gatewaysToDelete,
      deleting,
      deleteSelectedGateways,
      validateSubdomain,
    };
  },
};
</script>
