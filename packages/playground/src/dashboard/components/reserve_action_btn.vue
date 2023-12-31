<template>
  <container>
    <v-dialog v-model="openUnreserveDialog" max-width="600" class="custom-dialog">
      <v-card>
        <v-card-title class="pt-4">
          <span style="display: flex; align-items: center">
            <v-icon class="mr-2" color="warning">mdi-alert</v-icon>
            Unreserve this dedicated node?
          </span>
        </v-card-title>
        <v-divider />
        <v-card-text>This will free up the node for others on the chain</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="outlined" color="anchor" @click="openUnreserveDialog = false">Close</v-btn>
          <v-btn variant="outlined" color="error" @click="unReserveNode" :loading="loadingUnreserveNode">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-btn
      size="small"
      outlined
      :loading="loadingReserveNode"
      :disabled="disableButton"
      v-if="node.rentedByTwinId === 0"
      color="primary"
      @click="reserveNode"
    >
      Reserve
    </v-btn>

    <v-btn
      size="small"
      outlined
      color="error"
      :loading="loadingUnreserveBtn"
      :disabled="disableButton"
      v-if="node.rentedByTwinId === profileManager.profile?.twinId"
      @click="removeReserve"
    >
      Unreserve
    </v-btn>
  </container>
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { InsufficientBalanceError } from "@threefold/types";
import { type PropType, ref } from "vue";

import { useProfileManager } from "@/stores";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { getGrid } from "@/utils/grid";
import { normalizeError } from "@/utils/helpers";

const profileManager = useProfileManager();

export default {
  name: "ReserveBtn",
  props: {
    node: {
      required: true,
      type: Object as PropType<GridNode>,
    },
  },
  setup(props, { emit }) {
    const openUnreserveDialog = ref(false);
    const loadingUnreserveNode = ref(false);
    const loadingUnreserveBtn = ref(false);
    const loadingReserveNode = ref(false);
    const disableButton = ref(false);

    function removeReserve() {
      openUnreserveDialog.value = true;
    }

    async function unReserveNode() {
      loadingUnreserveNode.value = true;
      try {
        const grid = await getGrid(profileManager.profile!);
        createCustomToast(`Verify contracts for node ${props.node.nodeId}`, ToastType.info);

        const result = (await grid?.contracts.getActiveContracts({ nodeId: +props.node.nodeId })) as any;
        if (result.length > 0) {
          createCustomToast(`node ${props.node.nodeId} has active contracts`, ToastType.info);
          loadingUnreserveNode.value = false;
          openUnreserveDialog.value = false;
        } else {
          createCustomToast(`unreserving node ${props.node.nodeId}`, ToastType.info);
          await grid?.nodes.unreserve({ nodeId: +props.node.nodeId });
          createCustomToast(`Transaction succeeded node ${props.node.nodeId} Unreserved`, ToastType.success);
          loadingUnreserveNode.value = false;
          openUnreserveDialog.value = false;
          loadingUnreserveBtn.value = true;
          createCustomToast("Table may take sometime to update the changes", ToastType.info);
          emit("updateTable");
          disableButton.value = true;
          setTimeout(() => {
            disableButton.value = false;
            loadingUnreserveBtn.value = false;
          }, 20000);
        }
      } catch (e) {
        if (e instanceof InsufficientBalanceError) {
          createCustomToast(`Can't delete rent contract due to Insufficient balance`, ToastType.danger);
        } else {
          console.log(e);
          createCustomToast("Failed to delete rent contract.", ToastType.danger);
        }
        loadingUnreserveNode.value = false;
        openUnreserveDialog.value = false;
      }
    }

    async function reserveNode() {
      loadingReserveNode.value = true;
      try {
        const grid = await getGrid(profileManager.profile!);
        createCustomToast("Transaction Submitted", ToastType.info);
        await grid?.nodes.reserve({ nodeId: +props.node.nodeId });
        createCustomToast(`Transaction succeeded node ${props.node.nodeId} Reserved`, ToastType.success);
        createCustomToast("Table may take sometime to update the changes", ToastType.info);
        emit("updateTable");
        disableButton.value = true;
        setTimeout(() => {
          disableButton.value = false;
          loadingReserveNode.value = false;
        }, 20000);
      } catch (e) {
        if (e instanceof InsufficientBalanceError) {
          createCustomToast(`Can't create rent contract due to Insufficient balance`, ToastType.danger);
        } else {
          console.log(e);
          createCustomToast("Failed to create rent contract.", ToastType.danger);
        }
        loadingReserveNode.value = false;
      }
    }
    return {
      openUnreserveDialog,
      loadingUnreserveNode,
      unReserveNode,
      loadingReserveNode,
      reserveNode,
      removeReserve,
      disableButton,
      loadingUnreserveBtn,
      profileManager,
    };
  },
};
</script>
