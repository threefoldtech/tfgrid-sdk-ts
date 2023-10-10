<template>
  <container>
    <v-dialog v-model="openUnreserveDialog" max-width="600">
      <v-card>
        <v-card-title> Are you sure you want to unreserve this dedicated node? </v-card-title>
        <v-card-text>This will free up the node for others on the chain</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn @click="unReserveNode" :loading="loadingUnreserveNode">Yes</v-btn>
          <v-btn @click="openUnreserveDialog = false">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-btn
      small
      outlined
      :loading="loadingReserveNode"
      color="#064663"
      style="background: #1aa18f"
      v-if="rentedByTwinId === 0"
      @click="reserveNode"
    >
      Reserve
    </v-btn>
    <v-btn
      small
      outlined
      color="red"
      style="background: #1aa18f"
      v-if="rentedByTwinId === twinId"
      @click="removeReserve"
    >
      Unreserve
    </v-btn>
    <v-btn small outlined disabled color="gray" v-if="rentedByTwinId !== 0 && rentedByTwinId !== twinId"> Taken </v-btn>
  </container>
</template>

<script lang="ts">
import { ref } from "vue";

import { gridProxyClient } from "../clients";
import { useProfileManager } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { getGrid } from "../utils/grid";

const profileManager = useProfileManager();

export default {
  name: "ReserveBtn",
  props: {
    rentedByTwinId: {
      type: Number,
      required: true,
    },
    nodeId: {
      type: String,
      required: true,
    },
    twinId: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const openUnreserveDialog = ref(false);
    const loadingUnreserveNode = ref(false);
    const loadingReserveNode = ref(false);

    function removeReserve() {
      openUnreserveDialog.value = true;
    }

    async function unReserveNode() {
      loadingUnreserveNode.value = true;
      try {
        const grid = await getGrid(profileManager.profile!);
        createCustomToast("check for contracts on node ${props.nodeId}", ToastType.info);

        const result = (await grid?.contracts.getActiveContracts({ nodeId: +props.nodeId })) as any;
        if (result.length > 0) {
          createCustomToast("node ${props.nodeId} has active contracts", ToastType.info);
          loadingUnreserveNode.value = false;
          openUnreserveDialog.value = false;
        } else {
          createCustomToast("unreserving node ${props.nodeId}", ToastType.info);
          await grid?.nodes.unreserve({ nodeId: +props.nodeId });
          createCustomToast("Transaction succeeded node ${props.nodeId} Unreserved", ToastType.success);
          loadingUnreserveNode.value = false;
          openUnreserveDialog.value = false;
          createCustomToast("Table may take sometime to update the changes", ToastType.info);
          emit("updateTable");
        }
      } catch (e) {
        console.log("Error: ", e);
        createCustomToast(e as string, ToastType.danger);
        loadingUnreserveNode.value = false;
        openUnreserveDialog.value = false;
      }
    }

    async function reserveNode() {
      loadingReserveNode.value = true;
      try {
        const grid = await getGrid(profileManager.profile!);
        createCustomToast("Transaction Submitted", ToastType.info);
        await grid?.nodes.reserve({ nodeId: +props.nodeId });
        loadingReserveNode.value = false;
        createCustomToast("Transaction succeeded node ${props.nodeId} Reserved", ToastType.success);
        createCustomToast("Table may take sometime to update the changes", ToastType.info);

        emit("updateTable");
      } catch (e) {
        console.log("Error: ", e);
        createCustomToast(e as string, ToastType.danger);
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
    };
  },
};
</script>
