<template>
  <v-card>
    <section class="d-flex align-center">
      <div>
        <v-card-title v-if="$slots.title" class="font-weight-bold">
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
        <v-alert variant="tonal" type="info" v-show="!profileManager.profile">
          Please activate a profile from the profile manager
        </v-alert>

        <v-alert variant="tonal" v-show="profileManager.profile && status" :type="alertType">
          {{ message }}
        </v-alert>

        <div v-show="profileManager.profile && !status">
          <slot v-if="profileManager.profile" />
        </div>
      </template>
    </v-card-text>

    <template v-if="$slots['footer-actions'] && (profileManager.profile || disableAlerts)">
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
import { computed, ref, watch } from "vue";

import { useProfileManager } from "../stores";
import { loadBalance } from "../utils/grid";

const props = defineProps({
  disableAlerts: {
    type: Boolean,
    required: false,
    default: false,
  },
});
const emits = defineEmits<{ (event: "mount"): void; (event: "back"): void }>();

const profileManager = useProfileManager();

const status = ref<WebletStatus>();
const message = ref<string>();
function onLogMessage(msg: string) {
  if (typeof msg === "string") {
    message.value = msg;
  }
}

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
  openDialog(data: any, envs?: { [key: string]: string | boolean } | false, json?: boolean): void;
  status: ComputedRef<WebletStatus>;
  reloadDeploymentsList(): void;
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
