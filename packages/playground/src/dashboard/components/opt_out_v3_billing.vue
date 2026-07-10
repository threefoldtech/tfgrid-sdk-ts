<template>
  <span>
    <v-tooltip :text="tooltipText">
      <template #activator="{ props: tooltipProps }">
        <span class="d-inline-block mx-1" v-bind="tooltipProps">
          <v-icon
            size="large"
            :disabled="loading || isOptedOut"
            :loading="loading"
            @click.stop="!isOptedOut && (showDialog = true)"
          >
            mdi-cash-off
          </v-icon>
        </span>
      </template>
    </v-tooltip>

    <v-dialog v-model="showDialog" max-width="600" attach="#modals">
      <v-card>
        <v-card-title class="bg-primary">Opt Out of V3 Billing</v-card-title>
        <v-card-text>
          <v-alert type="warning" class="mb-4"> <strong>Warning:</strong> This action cannot be undone. </v-alert>
          <p>
            By opting out of billing for node {{ nodeId }}, you are giving up control of the node to Threefold admins.
            Billing flows will be stopped, and only Threefold admins will be able to create contracts on this node.
          </p>
        </v-card-text>
        <v-card-actions class="justify-end my-1 mr-2">
          <v-btn color="anchor" :disabled="loading" @click="showDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="loading" :disabled="loading" @click="handleOptOut">Opt Out</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script lang="ts">
import { computed, ref } from "vue";

import { useGrid } from "../../stores";
import { createCustomToast, ToastType } from "../../utils/custom_toast";

export default {
  name: "OptOutV3Billing",
  props: {
    nodeId: { type: Number, required: true },
    isOptedOut: { type: Boolean, default: false },
  },
  emits: ["opted-out"],
  setup(props, { emit }) {
    const showDialog = ref(false);
    const loading = ref(false);
    const gridStore = useGrid();
    const tooltipText = computed(() =>
      props.isOptedOut ? "Opt Out of V3 Billing (already opted out)" : "Opt Out of V3 Billing",
    );

    async function handleOptOut() {
      try {
        loading.value = true;
        await gridStore.grid.contracts.optOutV3Billing({ nodeId: props.nodeId });
        createCustomToast("Successfully opted out of billing for this node.", ToastType.success);
        showDialog.value = false;
        emit("opted-out", props.nodeId);
      } catch (error) {
        console.error("Opt out billing error:", error);
        createCustomToast("Failed to opt out of billing.", ToastType.danger);
      } finally {
        loading.value = false;
      }
    }

    return { showDialog, loading, tooltipText, handleOptOut };
  },
};
</script>
