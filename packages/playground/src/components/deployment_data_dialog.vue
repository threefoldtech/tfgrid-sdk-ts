<template>
  <v-row justify="center">
    <v-dialog model-value @update:model-value="$emit('close')" scrollable width="70%">
      <v-card>
        <v-card-title class="d-flex flex-column" v-if="!onlyJson">
          <div class="d-flex justify-center">
            <v-btn-toggle divided v-model="showType" mandatory>
              <v-btn variant="outlined"> details </v-btn>
              <v-btn variant="outlined"> json </v-btn>
            </v-btn-toggle>
          </div>

          <v-tabs v-model="activeTab" align-tabs="center" class="my-4 mx-auto" v-if="showType === 0">
            <v-tab
              v-for="(item, index) in contracts"
              :key="item.contractId"
              variant="tonal"
              color="primary"
              class="mx-2"
            >
              <v-tooltip location="bottom" :text="getTooltipText(item, index)" :disabled="!hasMaster(item)">
                <template #activator="{ props }">
                  <span v-bind="props" class="text-lowercase">{{ item.name }}</span>
                </template>
              </v-tooltip>
            </v-tab>
          </v-tabs>
        </v-card-title>
        <v-card-text>
          <template v-if="showType === 0">
            <v-form readonly v-if="contract">
              <v-alert class="my-4" variant="tonal" v-if="contract.customDomain" type="info">
                Make sure to create an A record on your name provider with
                <span class="font-weight-bold">{{ contract.customDomain }}</span> pointing to
                <span class="font-weight-bold">{{ contract.publicIP?.ip.split("/")[0] || contract.publicIP?.ip }}</span>
              </v-alert>
              <CopyReadonlyInput label="Name" :data="contract.name" />
              <CopyReadonlyInput label="Contract ID" :data="contract.contractId" />

              <template v-if="contract.publicIP">
                <CopyReadonlyInput
                  label="Public IPv4"
                  :data="contract.publicIP.ip.split('/')[0] || contract.publicIP.ip"
                  v-if="contract.publicIP.ip"
                />
                <CopyReadonlyInput label="Public IPv6" :data="contract.publicIP.ip6" v-if="contract.publicIP.ip6" />
              </template>

              <CopyReadonlyInput label="Planetary Network IP" :data="contract.planetary" v-if="contract.planetary" />

              <CopyReadonlyInput label="Network Name" :data="contract.interfaces[0].network" />
              <CopyReadonlyInput label="CPU (vCores)" :data="contract.capacity.cpu" />
              <CopyReadonlyInput label="Memory (MB)" :data="contract.capacity.memory" />
              <CopyReadonlyInput
                v-for="disk of contract.mounts"
                :key="disk.name"
                :label="getDiskLabel(contract, disk)"
                :data="Math.ceil(disk.size / (1024 * 1024 * 1024))"
              />
              <CopyReadonlyInput label="WireGuard IP" :data="contract.interfaces[0].ip" />
              <CopyReadonlyInput
                label="WireGuard Config"
                textarea
                :data="data.wireguard || contract.wireguard"
                v-if="data.wireguard || contract.wireguard"
              />
              <CopyReadonlyInput label="Flist" :data="contract.flist" v-if="contract.flist" />
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
              <CopyReadonlyInput label="GPU Cards" :data="gpuInfo" :loading="loadingCard" v-if="showGpuCard" />
              <CopyReadonlyInput label="Monitoring URL" :data="grafanaURL" :loading="isLoading" />
            </v-form>
          </template>
          <template v-else>
            <HighlightDark v-if="$vuetify.theme.name === 'dark'" />
            <HighlightLight v-else />
            <pre>
            <code class="hljs json dark-bg" v-html="html"></code>
          </pre>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" variant="tonal" @click="copy">Copy</v-btn>
          <v-btn color="error" variant="tonal" @click="$emit('close')">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script lang="ts" setup>
import hljs from "highlight.js";
import { computed, type PropType, ref } from "vue";

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
const contracts = computed(() => {
  if (!props.data) return [];
  if ("masters" in props.data) return [...props.data.masters, ...props.data.workers];
  return Array.isArray(props.data) ? props.data : [props.data];
});
const contract = computed(() => contracts.value?.[activeTab.value] ?? {});
const code = computed(() => JSON.stringify(props.data || {}, undefined, 2));
const html = computed(() => hljs.highlight(code.value, { language: "json" }).value);
const profileManager = useProfileManager();

function copy() {
  navigator.clipboard.writeText(code.value);
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

async function getGrafanaUrl() {
  isLoading.value = true;
  const grid = await getGrid(profileManager.profile!);
  if (grid) {
    const grafana = new GrafanaStatistics(grid, props.data);
    await grafana.getUrl().then(res => {
      grafanaURL.value = res;
    });
  }
  isLoading.value = false;
  return grafanaURL.value;
}
getGrafanaUrl();

async function getGPUInfo() {
  loadingCard.value = true;

  const grid = await getGrid(profileManager.profile!);
  if (grid) {
    const nodeId = await grid.zos.capacity.getNodeIdFromContractId(
      contract.value.contractId,
      profileManager.profile!.mnemonic,
    );

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
    return Boolean(v);
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
    return "Disk";
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

  if (index === 0 && getMetadata(contract).projectName === "kubernetes") {
    return "Master";
  }

  if (index !== 0) {
    return "Worker";
  }
}
</script>

<script lang="ts">
import { useProfileManager } from "@/stores/profile_manager";
import { GrafanaStatistics } from "@/utils/getMetricsUrl";
import { getGrid } from "@/utils/grid";

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
