<template>
  <v-card>
    <section class="d-flex align-center">
      <div>
        <v-card-title v-if="$slots.title" class="font-weight-bold d-flex align-center title">
          <img
            :src="baseUrl + titleImage"
            alt="title image"
            v-if="titleImage"
            :style="{ filter: `brightness(${$vuetify.theme.global.name === 'light' ? 0.2 : 1})` }"
          />
          <slot name="title" />
        </v-card-title>
        <v-card-subtitle v-if="$slots.subtitle" :style="{ whiteSpace: 'initial' }">
          <slot name="subtitle" />
        </v-card-subtitle>
      </div>
      <v-spacer />
      <div class="mr-4" v-if="$slots['header-actions']">
        <slot name="header-actions" :hasProfile="!!profileManager.profile" />
      </div>
    </section>

    <v-divider :class="{ 'mb-2': true, 'mt-5': !!$slots.subtitle, 'mt-2': !$slots.subtitle }" />

    <v-card-text>
      <slot v-if="disableAlerts" />
      <template v-else>
        <v-alert variant="tonal" type="info" v-show="!profileManager.profile"> Please connect your wallet </v-alert>

        <v-alert variant="tonal" v-show="profileManager.profile && status" :type="alertType">
          {{ message }}
        </v-alert>

        <div v-show="profileManager.profile && !status">
          <slot v-if="profileManager.profile" />
        </div>
      </template>
    </v-card-text>

    <template v-if="dedicated && !status">
      <v-alert class="mb-4 mx-4" type="info" variant="tonal">
        You need to rent a dedicated node from our
        <a :href="dashboardURL" target="_blank" class="app-link"> Dashboard </a>
        before deploying on it.
      </v-alert>
    </template>

    <template v-if="$slots['footer-actions'] && (profileManager.profile || disableAlerts)">
      <v-alert
        v-show="!status"
        class="mx-4"
        :style="{ fontSize: '1.2rem' }"
        type="info"
        variant="tonal"
        v-if="showPrice"
      >
        <div v-if="ipv4 && dedicated">
          <span>
            There are no fees will be added since the selected node is rented by you and the cost already included in
            the rent contract. <br />Please be aware that an additional fee of
            <span class="font-weight-black">
              {{ costLoading ? "Calculating..." : normalizeBalance(onlyIPV4TftPrice) }}
            </span>
            TFTs or approximately
            <span class="font-weight-black">
              {{ costLoading ? "Calculating..." : normalizeBalance(onlyIPV4UsdPrice) }}
            </span>
            USD per month.
          </span>
        </div>
        <div v-else-if="!ipv4 && dedicated">
          <span>
            There are no fees will be added since the selected node is rented by you and the cost already included in
            the rent contract.
          </span>
        </div>
        <div v-else>
          Based on the cloud resources you have selected (CPU: {{ cpu }} Cores, RAM: {{ memory }} MB, SSD:
          {{ disk }} GB{{ ipv4 ? ", Public IP: Enabled" : "" }}) your deployment costs
          <span class="font-weight-black">{{ costLoading ? "Calculating..." : normalizeBalance(tft) }}</span> TFTs or
          approximately
          <span class="font-weight-black">{{ costLoading ? "Calculating..." : normalizeBalance(usd) }}</span> USD per
          month.
        </div>

        <a href="https://manual.grid.tf/cloud/cloudunits_pricing.html" target="_blank" class="app-link">
          Learn more about the pricing and how to unlock discounts.
        </a>
      </v-alert>
      <v-divider class="mt-5" />
      <v-card-actions>
        <v-spacer />
        <slot name="footer-actions" v-if="!status" />
        <v-btn v-else color="secondary" variant="text" :loading="status === 'deploy'" @click="reset"> Back </v-btn>
      </v-card-actions>
    </template>
  </v-card>

  <DeploymentDataDialog
    :data="dialogData"
    :environments="environments"
    :onlyJson="onlyJson"
    v-if="dialogData"
    @close="dialogData = environments = undefined"
  />
</template>

<script lang="ts" setup>
import { events, type GridClient } from "@threefold/grid_client";
import debounce from "lodash/debounce.js";
import { computed, ref, watch } from "vue";

import { useProfileManager } from "../stores";
import { getGrid, loadBalance } from "../utils/grid";
import { getDashboardURL, normalizeBalance } from "../utils/helpers";

const props = defineProps({
  disableAlerts: {
    type: Boolean,
    required: false,
    default: false,
  },
  cpu: {
    type: Number,
    required: false,
  },
  memory: {
    type: Number,
    required: false,
  },
  disk: {
    type: Number,
    required: false,
  },
  titleImage: {
    type: String,
    required: false,
  },
  ipv4: {
    type: Boolean,
    required: false,
    default: () => false,
  },
  certified: {
    type: Boolean,
    required: false,
    default: () => false,
  },
  dedicated: {
    type: Boolean,
    required: false,
    default: () => false,
  },
});
const emits = defineEmits<{ (event: "mount"): void; (event: "back"): void }>();
const baseUrl = import.meta.env.BASE_URL;
const profileManager = useProfileManager();

const status = ref<WebletStatus>();
const message = ref<string>();
function onLogMessage(msg: string) {
  if (typeof msg === "string") {
    message.value = msg;
  }
}

const network = process.env.NETWORK || window.env.NETWORK;
const dashboardURL = getDashboardURL(network);

watch(status, s => {
  if (s === "deploy") events.addListener("logs", onLogMessage);
  else events.removeListener("logs", onLogMessage);
});
const alertType = computed(() => {
  if (status.value === "deploy") return "info";
  else if (status.value === "failed") return "error";
  return "success";
});

const dialogData = ref();
const environments = ref();
const onlyJson = ref();
defineExpose({
  async validateBalance(grid: GridClient, min = 2) {
    message.value = "Checking your balance...";

    const balance = await loadBalance(grid);
    const b = balance.free - balance.locked;

    if (b < min) {
      throw new Error(`You have ${b.toFixed(2)} TFT but it's required to have at least ${min} TFT.`);
    }
    message.value = "You have enough TFT to continue...";
    return balance;
  },

  setStatus(s: WebletStatus, m?: string) {
    if (s !== "deploy" && !m) {
      throw new Error("Message need to be passed while settingStatus.");
    }

    message.value = m ? m : "Preparing to deploy...";
    status.value = s;
  },

  openDialog(data?: any, envs?: { [key: string]: string | boolean } | false, json?: boolean) {
    dialogData.value = data;
    environments.value = envs;
    onlyJson.value = json;
  },
  validateSSH() {
    if (!profileManager.profile!.ssh) {
      throw new Error("You must provide an SSH key to deploy");
    }
  },

  status: computed(() => status.value),

  reloadDeploymentsList,
});

function reset() {
  status.value = undefined;
  message.value = undefined;
  emits("back");
}

const deploymentListManager = useDeploymentListManager();
function reloadDeploymentsList() {
  deploymentListManager?.load();
}

watch(
  () => !!profileManager.profile || props.disableAlerts,
  (value, oldValue) => {
    if (value && value !== oldValue) {
      reset();
      emits("mount");
    }
  },
  { immediate: true },
);

/* Calculate Price */
const showPrice = computed(() => !!profileManager.profile && props.cpu && props.memory && props.disk);
const usd = ref<number>();
const tft = ref<number>();
const costLoading = ref(false);
const shouldUpdateCost = ref(false);
const onlyIPV4TftPrice = ref<number>();
const onlyIPV4UsdPrice = ref<number>();

watch(
  () => [props.cpu, props.memory, props.disk, props.ipv4, props.certified, props.dedicated],
  debounce((value, oldValue) => {
    if (
      oldValue &&
      value[0] === oldValue[0] &&
      value[1] === oldValue[1] &&
      value[2] === oldValue[2] &&
      value[3] === oldValue[3] &&
      value[4] === oldValue[4] &&
      value[5] === oldValue[5]
    )
      return;
    shouldUpdateCost.value = true;
  }, 500),
  { immediate: true },
);

watch(
  () => [profileManager.profile, costLoading.value, shouldUpdateCost.value] as const,
  ([profile, loading, shouldUpdate]) => {
    if (!profile || loading || !shouldUpdate) return;
    shouldUpdateCost.value = false;
    loadCost(profile);
  },
);

async function getIPv1Price(grid: GridClient) {
  const { sharedPrice } = await grid!.calculator.calculateWithMyBalance({
    sru: 0,
    mru: 0,
    cru: 0,
    ipv4u: props.ipv4,
    hru: 0,
    certified: false,
  });
  onlyIPV4UsdPrice.value = sharedPrice;
  onlyIPV4TftPrice.value = parseFloat((onlyIPV4UsdPrice.value / (await grid!.calculator.tftPrice())).toFixed(2));
}

async function loadCost(profile: { mnemonic: string }) {
  costLoading.value = true;
  const grid = await getGrid(profile);
  const { sharedPrice, dedicatedPrice } = await grid!.calculator.calculateWithMyBalance({
    cru: typeof props.cpu === "number" ? props.cpu : 0,
    sru: typeof props.disk === "number" ? props.disk : 0,
    mru: typeof props.disk === "number" ? (props.memory ?? 0) / 1024 : 0,
    hru: 0,
    ipv4u: props.ipv4,
    certified: props.certified,
  });
  await getIPv1Price(grid!);
  usd.value = props.dedicated ? dedicatedPrice : sharedPrice;
  tft.value = parseFloat((usd.value / (await grid!.calculator.tftPrice())).toFixed(2));
  costLoading.value = false;
}
</script>

<script lang="ts">
import type { ComputedRef, Ref } from "vue";

import type { Balance } from "../utils/grid";
import DeploymentDataDialog from "./deployment_data_dialog.vue";
import { useDeploymentListManager } from "./deployment_list_manager.vue";

export type WebletStatus = "deploy" | "success" | "failed";

export interface WebletLayout {
  validateBalance(grid: GridClient, min?: number): Promise<Balance>;
  setStatus(status: WebletStatus, message?: string): void;
  openDialog(
    data: any,
    envs?: { [key: string]: string | boolean | { label: string; type?: string } } | false,
    json?: boolean,
  ): void;
  status: ComputedRef<WebletStatus>;
  reloadDeploymentsList(): void;
  validateSSH(): void;
}

export function useLayout() {
  return ref() as Ref<WebletLayout>;
}

export default {
  name: "WebletLayout",
  components: {
    DeploymentDataDialog,
  },
};
</script>

<style>
.title img {
  margin-right: 5px;
  max-height: 24px;
}
</style>
