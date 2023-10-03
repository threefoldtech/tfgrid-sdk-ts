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
      @click="removeReserve()"
    >
      Unreserve
    </v-btn>
    <v-btn small outlined disabled color="gray" v-if="rentedByTwinId !== 0 && rentedByTwinId !== twinId"> Taken </v-btn>
  </container>
</template>

<script lang="ts">
import { createToast } from "mosha-vue-toastify";
import { ref } from "vue";

import { gridProxyClient } from "../clients";
import { useProfileManager } from "../stores";
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
  setup(props) {
    const openUnreserveDialog = ref(false);
    const loadingUnreserveNode = ref(false);
    const loadingReserveNode = ref(false);

    function removeReserve() {
      console.log("Remove Reserve");
      openUnreserveDialog.value = true;
    }

    async function unReserveNode() {
      loadingUnreserveNode.value = true;
      try {
        const grid = await getGrid(profileManager.profile!);
        createToast(`check for contracts on node ${props.nodeId}`, {
          position: "top-right",
          hideProgressBar: true,
          toastBackgroundColor: "#1aa18f",
          timeout: 5000,
          showIcon: true,
          type: "info",
        });

        const result = (await grid?.contracts.getActiveContracts({ nodeId: +props.nodeId })) as any;
        console.log("Result Length", result.length);
        if (result.length > 0) {
          createToast(`node ${props.nodeId} has active contracts`, {
            position: "top-right",
            hideProgressBar: true,
            toastBackgroundColor: "#1aa18f",
            timeout: 5000,
            showIcon: true,
            type: "info",
          });
          loadingUnreserveNode.value = false;
          openUnreserveDialog.value = false;
        } else {
          createToast(`unreserving node ${props.nodeId}`, {
            position: "top-right",
            hideProgressBar: true,
            toastBackgroundColor: "#1aa18f",
            timeout: 5000,
            showIcon: true,
            type: "info",
          });

          const node = await gridProxyClient.nodes.byId(+props.nodeId);
          await grid?.contracts.cancel({ id: node.rentContractId });
          createToast(`Transaction succeeded node ${props.nodeId} Unreserved`, {
            position: "top-right",
            hideProgressBar: true,
            toastBackgroundColor: "#1aa18f",
            timeout: 5000,
            showIcon: true,
            type: "success",
          });

          loadingUnreserveNode.value = false;
          openUnreserveDialog.value = false;
        }
      } catch (e) {
        console.log("Error: ", e);
        createToast(e as string, {
          position: "top-right",
          hideProgressBar: true,
          toastBackgroundColor: "#FF5252",
          timeout: 5000,
          showIcon: true,
          type: "danger",
        });
        loadingUnreserveNode.value = false;
        openUnreserveDialog.value = false;
      }
    }

    async function reserveNode() {
      loadingReserveNode.value = true;
      try {
        const grid = await getGrid(profileManager.profile!);
        createToast(`Transaction Submitted`, {
          position: "top-right",
          hideProgressBar: true,
          toastBackgroundColor: "#1aa18f",
          timeout: 5000,
          showIcon: true,
          type: "info",
        });
        await grid?.contracts.createRent({ nodeId: +props.nodeId });
        loadingReserveNode.value = false;
        createToast(`Transaction succeeded node ${props.nodeId} Reserved`, {
          position: "top-right",
          hideProgressBar: true,
          toastBackgroundColor: "#1aa18f",
          timeout: 5000,
          showIcon: true,
          type: "success",
        });
      } catch (e) {
        console.log("Error: ", e);
        createToast(e as string, {
          position: "top-right",
          hideProgressBar: true,
          toastBackgroundColor: "#FF5252",
          timeout: 5000,
          showIcon: true,
          type: "danger",
        });
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
