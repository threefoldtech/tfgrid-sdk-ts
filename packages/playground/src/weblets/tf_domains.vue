<template>
  <weblet-layout ref="layout">
    <template #title>
      <span>
        <v-icon class="pr-3">mdi-web-box</v-icon>
      </span>
      Deploy Domains Instance
    </template>

    <d-tabs :tabs="[{ title: 'Config', value: 'config' }]">
      <template #config>
        <input-tooltip tooltip="Selecting Custom Domain sets the subdomain as the gateway name.">
          <input-validator
            :value="subdomain"
            :rules="[
              validators.required('Subdomain is required.'),
              validators.isLowercase('Subdomain should consist of lowercase letters only.'),
              validators.isAlphanumeric('Subdomain should consist of letters and numbers only.'),
              subdomain => validators.isAlpha('Subdomain must start with alphabet char.')(subdomain[0]),
              validators.minLength('Subdomain must be at least 4 characters.', 4),
              subdomain => validators.maxLength('Subdomain cannot exceed 35 characters.', 35)(subdomain),
            ]"
            :async-rules="[validateSubdomain]"
            #="{ props }"
          >
            <v-text-field v-model.trim="subdomain" label="Subdomain" v-bind="props" />
          </input-validator>
        </input-tooltip>

        <div :style="{ marginTop: '-10px' }">
          <TfSelectionDetails v-model="selectionDetails" disable-node-selection require-domain use-fqdn />
        </div>

        <input-tooltip
          tooltip="When enabled, the backend service will terminate the TLS traffic, otherwise the gateway service will do the TLS traffic termination."
          inline
        >
          <v-switch v-model="passThrough" label="TLS Passthrough" hide-details inset variant="tonal" color="primary" />
        </input-tooltip>

        <input-tooltip tooltip="Enable multiple backend configuration for load balancing and failover" inline>
          <v-switch
            v-model="multipleBackends"
            label="Multiple Backends"
            hide-details
            inset
            variant="tonal"
            color="primary"
          />
        </input-tooltip>

        <v-alert
          v-if="multipleBackends && backends.some(b => !b.ip || !b.port)"
          type="warning"
          variant="tonal"
          class="mt-3"
          density="compact"
        >
          Please fill in all backend IP addresses and ports before deploying.
        </v-alert>

        <template v-if="multipleBackends">
          <div class="mt-4">
            <v-card class="pa-4" outlined>
              <v-card-title class="text-h6 mb-3">Backend Configuration</v-card-title>

              <div v-for="(backend, index) in backends" :key="index" class="mb-4">
                <v-row>
                  <v-col cols="12" md="5">
                    <input-tooltip
                      tooltip="Backend IP address: It could be Mycelium IP, Yggdrasil IP, or a public IP (IPv4 or IPv6)."
                    >
                      <input-validator
                        :value="backend.ip"
                        :rules="[
                          validators.required('IP is required.'),
                          validators.isIP('IP is not valid.'),
                          validators.startsWith('IP is not valid.', '127.'),
                        ]"
                        #="{ props }"
                      >
                        <v-text-field v-model="backend.ip" :label="`Backend ${index + 1} IP`" v-bind="props" />
                      </input-validator>
                    </input-tooltip>
                  </v-col>

                  <v-col cols="12" md="4">
                    <input-tooltip tooltip="The port used to access the backend.">
                      <input-validator
                        :value="backend.port"
                        :rules="[
                          validators.required('Port is required.'),
                          validators.isPort('Please provide a valid port.'),
                        ]"
                        #="{ props }"
                      >
                        <v-text-field
                          v-model.number="backend.port"
                          :label="`Backend ${index + 1} Port`"
                          type="number"
                          v-bind="props"
                        />
                      </input-validator>
                    </input-tooltip>
                  </v-col>

                  <v-col cols="12" md="3" class="d-flex align-center">
                    <v-btn
                      v-if="backends.length > 1"
                      icon="mdi-delete"
                      variant="outlined"
                      color="error"
                      size="small"
                      @click="removeBackend(index)"
                    />
                  </v-col>
                </v-row>
              </div>

              <v-btn variant="outlined" color="primary" prepend-icon="mdi-plus" class="mt-2" @click="addBackend">
                Add Backend
              </v-btn>
            </v-card>
          </div>
        </template>

        <template v-else>
          <input-tooltip
            tooltip="User's machine's IP: It could be Mycelium IP, Yggdrasil IP, or a public IP (IPv4 or IPv6)."
          >
            <input-validator
              :value="ip"
              :rules="[
                validators.required('IP is required.'),
                validators.isIP('Public IP is not valid.'),
                validators.startsWith('Public IP is not valid.', '127.'),
              ]"
              #="{ props }"
            >
              <v-text-field v-model="ip" label="IP" v-bind="props" />
            </input-validator>
          </input-tooltip>

          <input-tooltip tooltip="The port used to access the machine.">
            <input-validator
              :value="port"
              :rules="[validators.required('Port is required.'), validators.isPort('Please provide a valid port.')]"
              #="{ props }"
            >
              <v-text-field v-model.number="port" label="Port" type="number" v-bind="props" />
            </input-validator>
          </input-tooltip>
        </template>
      </template>
    </d-tabs>

    <template #footer-actions="{ validateBeforeDeploy }">
      <v-btn
        variant="elevated"
        class="text-primery px-10 py-3 h-auto text-subtitle-1"
        text="Deploy"
        @click="validateBeforeDeploy(deploy)"
      />
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import type { GridClient } from "@threefold/grid_client";
import { ref } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useGrid } from "../stores";
import { ProjectName } from "../types";
import { deployGatewayName, deployGatewayNameMultiBackend, rollbackGateway } from "../utils/gateway";
import { normalizeError } from "../utils/helpers";
import { generateName } from "../utils/strings";

const layout = useLayout();
const ip = ref();
const name = ref(generateName({ prefix: "dm" }));
const subdomain = ref(generateName({ prefix: "dm" }));
const port = ref(80);
const passThrough = ref(false);
const selectionDetails = ref<SelectionDetails>();
const multipleBackends = ref(false);
const backends = ref([{ ip: "", port: 80 }]);

const gridStore = useGrid();
const grid = gridStore.client as GridClient;

function addBackend() {
  backends.value.push({ ip: "", port: 80 });
}

function removeBackend(index: number) {
  if (backends.value.length > 1) {
    backends.value.splice(index, 1);
  }
}

function finalize(deployment: any) {
  layout.value.reloadDeploymentsList();
  layout.value.setStatus("success", "Successfully deployed a Domains instance.");
  layout.value.openDialog(deployment);
}

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Domains.toLowerCase() + "/" + name.value;
  const domain = selectionDetails.value?.domain?.enabledCustomDomain
    ? selectionDetails.value.domain.customDomain
    : subdomain.value + "." + selectionDetails.value?.domain?.selectedDomain?.publicConfig.domain;

  try {
    updateGrid(grid, { projectName });
    await layout.value.validateBalance(grid!);

    layout.value.setStatus("deploy", "Preparing to deploy gateway...");

    let gateway: any;
    if (multipleBackends.value) {
      gateway = await deployGatewayNameMultiBackend(grid, selectionDetails.value?.domain, {
        subdomain: subdomain.value,
        backends: backends.value.map(backend => ({
          ip: backend.ip,
          port: backend.port,
        })),
        tlsPassthrough: passThrough.value,
      });
    } else {
      gateway = await deployGatewayName(grid, selectionDetails.value?.domain, {
        subdomain: subdomain.value,
        ip: ip.value,
        port: port.value,
        tlsPassthrough: passThrough.value,
      });
    }

    const gw = await grid.gateway.get_name({ name: subdomain.value });
    (gw as any).name = gw[0].workloads[0].name;

    finalize(gw);
  } catch (e) {
    layout.value.setStatus("deploy", "Rollbacking back due to fail to deploy gateway...");
    await rollbackGateway(grid!, subdomain.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Domains instance."));
  }
}
async function validateSubdomain() {
  return await isAvailableName(grid, subdomain.value);
}
</script>

<script lang="ts">
import { isAvailableName } from "@/utils/validators";

import type { SelectionDetails } from "../types/nodeSelector";
import { updateGrid } from "../utils/grid";

export default {
  name: "TfDomains",
};
</script>
