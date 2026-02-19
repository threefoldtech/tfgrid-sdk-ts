<template>
  <span>
    <v-tooltip text="Opt Out of V3 Billing">
      <template #activator="{ props: tooltipProps }">
        <v-icon
          class="mx-1"
          v-bind="tooltipProps"
          size="large"
          :disabled="loading"
          :loading="loading"
          @click.stop="showDialog = true"
        >
          mdi-cash-off
        </v-icon>
      </template>
    </v-tooltip>

    <v-dialog v-model="showDialog" max-width="600" attach="#modals">
      <v-card>
        <v-card-title class="bg-primary">Opt Out of V3 Billing</v-card-title>
        <v-card-text>
          <v-alert type="warning" class="mb-4"> <strong>Warning:</strong> This action cannot be undone. </v-alert>
          <p>
            By opting out of billing for node {{ nodeId }}, you are giving up control of the node to Threefold admins.
            Billing flows will be stopped, and only users in the Threefold admin list will be able to create contracts
            on this node.
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
import { ref } from "vue";

import { useGrid } from "../../stores";
import { createCustomToast, ToastType } from "../../utils/custom_toast";

export default {
  name: "OptOutV3Billing",
  props: {
    nodeId: { type: Number, required: true },
  },
  setup(props) {
    const showDialog = ref(false);
    const loading = ref(false);
    const gridStore = useGrid();

    async function handleOptOut() {
      try {
        loading.value = true;
        await gridStore.grid.contracts.optOutV3Billing({ nodeId: props.nodeId });
        createCustomToast("Successfully opted out of billing for this node.", ToastType.success);
        showDialog.value = false;
      } catch (error) {
        console.error("Opt out billing error:", error);
        createCustomToast("Failed to opt out of billing.", ToastType.danger);
      } finally {
        loading.value = false;
      }
    }

    return { showDialog, loading, handleOptOut };
  },
};
</script>
