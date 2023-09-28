<template>
  <container>
    <v-dialog v-model="openUnreserveDialog" max-width="600">
      <v-card>
        <v-card-title> Are you sure you want to unreserve this dedicated node? </v-card-title>
        <v-card-text>This will free up the node for others on the chain</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn :loading="loadingUnreserveNode">Yes</v-btn>
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
    >
      Reserve
    </v-btn>
    <v-btn small outlined color="red" style="background: #1aa18f" v-if="rentedByTwinId === twinId"> Unreserve </v-btn>
    <v-btn small outlined disabled color="gray" v-if="rentedByTwinId !== 0 && rentedByTwinId !== twinId"> Taken </v-btn>
  </container>
</template>

<script lang="ts">
import { ref } from "vue";

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
  setup() {
    const openUnreserveDialog = ref(false);
    const loadingUnreserveNode = ref(false);
    const loadingReserveNode = ref(false);

    // async function unReserveNode() {
    //   try {
    //     loadingUnreserveNode.value = true;
    //     //show toast
    //   } catch (e) {
    //     console.log("Error ", e);
    //   }
    // }
    // function removeReserve(nodeId: string) {}

    // function reserveNode(nodeId: string) {}
    return {
      openUnreserveDialog,
      loadingUnreserveNode,
      //   unReserveNode,
      loadingReserveNode,
      //   reserveNode,
      //   removeReserve,
    };
  },
};
</script>
