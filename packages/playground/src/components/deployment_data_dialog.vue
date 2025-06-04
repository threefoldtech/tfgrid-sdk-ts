<template>
  <v-row justify="center">
    <v-dialog model-value scrollable attach="#modals" @update:model-value="$emit('close')">
      <v-card>
        <v-card-title v-if="!onlyJson" class="d-flex flex-column">
          <div class="d-flex justify-center">
            <v-btn-toggle v-model="showType" divided mandatory>
              <v-btn> details </v-btn>
              <v-btn> JSON</v-btn>
            </v-btn-toggle>
          </div>
          <v-tabs v-if="showType === 0" v-model="activeTab" align-tabs="center" class="my-4 mx-auto">
            <v-tab
              v-for="(item, index) in contracts"
              :key="item.contractId"
              variant="tonal"
              color="secondary"
              class="mx-2"
            >
              <v-tooltip location="bottom" :text="getTooltipText(item, index)" :disabled="!hasMaster(item)">
                <template #activator="{ props: tooltipProps }">
                  <span v-bind="tooltipProps" class="text-lowercase">{{
                    contracts && contracts.length === 1 && "name" in contracts ? (contracts as any).name : item.name
                  }}</span>
                </template>
              </v-tooltip>
            </v-tab>
          </v-tabs>
        </v-card-title>
        <v-card-text>
          <template v-if="showType === 0">
            <v-form
              v-if="contract && !['gateway-name-proxy', 'gateway-fqdn-proxy'].includes(data?.[0]?.workloads?.[0]?.type)"
              readonly
            >
              <v-alert v-if="contract.customDomain" class="my-4" variant="tonal" type="info">
                Make sure to create an A record on your name provider with
                <span class="font-weight-bold">{{ contract.customDomain }}</span>
                pointing to
                <span class="font-weight-bold">{{ contract.publicIP?.ip.split("/")[0] || contract.publicIP?.ip }}</span>
              </v-alert>
              <CopyReadonlyInput label="Name" :data="contract.name" />
              <CopyReadonlyInput label="Node ID" :data="contract.nodeId" />
              <CopyReadonlyInput label="Contract ID" :data="contract.contractId" />

              <template v-if="contract.publicIP">
                <CopyReadonlyInput
                  v-if="contract.publicIP.ip"
                  label="Public IPv4"
                  :data="contract.publicIP.ip.split('/')[0] || contract.publicIP.ip"
                />
                <CopyReadonlyInput
                  v-if="contract.publicIP.ip6"
                  label="Public IPv6"
                  :data="contract.publicIP.ip6 ? contract.publicIP.ip6.replace(/\/64$/, '') : '-'"
                />
              </template>

              <CopyReadonlyInput v-if="contract.planetary" label="Planetary Network IP" :data="contract.planetary" />
              <CopyReadonlyInput v-if="contract.myceliumIP" label="Mycelium Network IP" :data="contract.myceliumIP" />

              <CopyReadonlyInput label="Network Name" :data="contract.interfaces[0].network" />
              <CopyReadonlyInput label="CPU (vCores)" :data="contract.capacity.cpu" />
              <CopyReadonlyInput label="Memory (MB)" :data="contract.capacity.memory" />
              <CopyReadonlyInput label="Total Storage (GB)" :data="getTotalStorage(contract)" />
              <CopyReadonlyInput
                v-if="contract.mounts.length > 0"
                label="Root Filesystem (GB)"
                :data="getStorage(contract.rootfs_size)"
              />
              <CopyReadonlyInput
                v-for="disk of contract.mounts"
                :key="disk.name"
                :label="getDiskLabel(contract, disk)"
                :data="Math.ceil(disk.size / (1024 * 1024 * 1024))"
              />
              <CopyReadonlyInput
                v-if="contract.type !== 'zmachine-light'"
                label="WireGuard IP"
                :data="contract.interfaces[0].ip"
              />
              <CopyReadonlyInput
                v-if="data.wireguard || contract.wireguard"
                label="WireGuard Config"
                textarea
                :data="data.wireguard || contract.wireguard"
              />
              <CopyReadonlyInput v-if="contract.flist" label="Flist" :data="contract.flist" />
              <template v-if="environments !== false">
                <template v-for="key of Object.keys(contract.env)" :key="key">
                  <template v-if="(environments[key] || !(key in environments)) && contract.env[key]">
                    <v-switch
                      v-if="contract.env[key].toLowerCase() === 'true' || contract.env[key].toLowerCase() === 'false'"
                      inset
                      color="primary"
                      :model-value="getValue(key)"
                      :label="getLabel(key)"
                    />
                    <password-input-wrapper v-else-if="getType(key) === 'password'" :data="getValue(key)" #="{ props }">
                      <v-text-field
                        :label="getLabel(key)"
                        variant="outlined"
                        :model-value="getValue(key)"
                        v-bind="props"
                      />
                    </password-input-wrapper>
                    <CopyReadonlyInput
                      v-else
                      :label="getLabel(key)"
                      :textarea="getType(key) === 'textarea'"
                      :data="getValue(key)"
                    />
                  </template>
                </template>
              </template>
              <CopyReadonlyInput v-if="showGpuCard" label="GPU Cards" :data="gpuInfo" :loading="loadingCard" />
              <CopyReadonlyInput label="Monitoring URL" :data="grafanaURL" :loading="isLoading" />
            </v-form>
            <v-form v-else readonly>
              <CopyReadonlyInput label="Name" :data="data.name" />
              <CopyReadonlyInput label="IP" :data="data[0].workloads[0].data.backends.join(', ')" />
              <CopyReadonlyInput
                label="Domain"
                :data="data[0].workloads[0].result.data.fqdn || data[0].workloads[0].data.fqdn"
              />
              <v-switch
                inset
                color="primary"
                :model-value="data[0].workloads[0].data.tls_passthrough"
                label="TLS Passthrough"
              />
            </v-form>
          </template>
          <template v-else>
            <HighlightDark v-if="theme.global.current.value.dark" />
            <HighlightLight v-else />
            <pre>
            <code class="hljs json" :class="[theme.global.current.value.dark ? 'dark-bg' : 'light-bg']" v-html="html" />
          </pre>
          </template>
        </v-card-text>
        <v-card-actions class="justify-end my-1 mr-2">
          <v-btn color="anchor" @click="$emit('close')"> Close </v-btn>
          <v-btn v-if="showType == 1" color="secondary" @click="copy"> Copy </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script lang="ts" setup>
import hljs from "highlight.js";
import { computed, type PropType, ref } from "vue";
import { useTheme } from "vuetify";

import { gridProxyClient } from "@/clients";
import { getCardName } from "@/utils/helpers";

const props = defineProps({
  data: {
    type: Object as PropType<any>,
    required: true,
  },
  environments: {
    type: Object as PropType<
      | { [key: string]: string | boolean | { label: string; type?: string; transform?: (value: string) => string } }
      | false
    >,
    required: false,
    default: () => ({}),
  },
  onlyJson: {
    type: Boolean,
    required: false,
    default: () => false,
  },
});
defineEmits<{ (event: "close"): void }>();

const showType = ref(props.onlyJson ? 1 : 0);
const isLoading = ref(false);
const loadingCard = ref(false);
const showGpuCard = ref(false);
const activeTab = ref(0);
const grafanaURL = ref("");
const gpuInfo = ref("");
const theme = useTheme();
const contracts = computed(() => {
  if (!props.data) return [];
  if ("masters" in props.data) return [...props.data.masters, ...props.data.workers];
  return Array.isArray(props.data) ? props.data : [props.data];
});
const contract = computed(() => contracts.value?.[activeTab.value] ?? {});
const code = computed(() => JSON.stringify(props.data || {}, undefined, 2));
const html = computed(() => hljs.highlight(code.value, { language: "json" }).value);
const gridStore = useGrid();
const grid = gridStore.client as GridClient;

function copy() {
  navigator.clipboard.writeText(code.value);
  createCustomToast("Copied!", ToastType.success);
}

function getLabel(key: string): string {
  if (props.environments === false) {
    return key;
  }

  const env = props.environments[key];

  if (typeof env === "string") {
    return env;
  }

  if (typeof env === "object") {
    return env.label || key;
  }

  return key;
}

function getValue(key: string) {
  const value = contract.value.env[key];
  const transform = (props.environments || ({} as any))[key]?.transform || _transform;
  return transform(value);
}

const getStorage = (disk: number) => {
  return Math.ceil(disk / (1024 * 1024 * 1024));
};

const getTotalStorage = (contract: any) => {
  let total = getStorage(contract.rootfs_size);

  if (contract.mounts) {
    total += contract.mounts.reduce((acc: number, disk: any) => {
      return acc + Math.ceil(disk.size / (1024 * 1024 * 1024));
    }, 0);
  }

  return total;
};

async function getGrafanaUrl() {
  isLoading.value = true;
  if (grid) {
    if (contract.value.type !== ContractType.Name) {
      const nodeId = await grid.capacity.getNodeIdFromContractId({
        contractId: contract.value.contractId || contract.value.contract_id,
      });
      const node = await gridProxyClient.nodes.byId(nodeId);
      const grafana = new GrafanaStatistics(node, 2);
      grafanaURL.value = await grafana.getUrl();
    }
  }
  isLoading.value = false;
}

onMounted(async () => await getGrafanaUrl());

async function getGPUInfo() {
  loadingCard.value = true;
  if (grid) {
    const nodeId = await grid.capacity.getNodeIdFromContractId({
      contractId: contract.value.contractId,
    });

    const gpuCards = await grid.zos.getNodeGPUInfo({ nodeId });
    const usedCards = gpuCards?.filter((card: any) => card.contract == contract.value.contractId);

    const cardsInfo = [];
    for (let i = 0; i < usedCards?.length; i++) {
      cardsInfo.push(getCardName(usedCards[i]));
    }
    if (cardsInfo) {
      gpuInfo.value = cardsInfo.join(", ");
      showGpuCard.value = true;
    }
  }

  if (gpuInfo.value == "") {
    showGpuCard.value = false;
  }
  loadingCard.value = false;
}
if (contract.value.metadata?.includes("fullvm") && contract.value.contractId) getGPUInfo();

function _transform(value: string): any {
  const v = value.toLowerCase();
  if (v === "true" || v === "false") {
    return v === "true";
  }
  return value;
}

function getType(key: string): string {
  if (props.environments === false) {
    return "text";
  }

  const env = props.environments[key];

  if (typeof env === "object") {
    return env.type || "text";
  }

  return "text";
}

function getDiskLabel(contract: any, disk: Disk) {
  if (contract.metadata.includes("fullvm") && contract.mounts.indexOf(disk) > 0) {
    return "Disk( " + disk.name + " ) GB";
  }
  return "Disk( " + disk.mountPoint + " ) GB";
}

function getMetadata(contract: any): { type: string; projectName: string } {
  try {
    const metadata = JSON.parse(contract.metadata);
    return {
      type: (metadata.type || "").toLowerCase(),
      projectName: (metadata.projectName || "").toLowerCase(),
    };
  } catch {
    return { type: "", projectName: "" };
  }
}

function hasMaster(contract: any): boolean {
  const meta = getMetadata(contract);
  return meta.type === "kubernetes" || meta.projectName === "caprover";
}

function getTooltipText(contract: any, index: number) {
  if (index === 0 && getMetadata(contract).projectName === "caprover") {
    return "Leader";
  }

  if (index === 0 && getMetadata(contract).type === "kubernetes") {
    return "Master";
  }

  if (index !== 0) {
    return "Worker";
  }
}
</script>

<script lang="ts">
import type { GridClient } from "@threefold/grid_client";
import { onMounted } from "vue";

import { ContractType } from "@/utils/contracts";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { GrafanaStatistics } from "@/utils/get_metrics_url";

import { useGrid } from "../stores";
import type { Disk } from "../utils/deploy_vm";
import CopyReadonlyInput from "./copy_readonly_input.vue";
import { HighlightDark, HighlightLight } from "./highlight_themes";

export default {
  name: "DeploymentDataDialog",
  components: {
    CopyReadonlyInput,
    HighlightDark,
    HighlightLight,
  },
};
</script>
