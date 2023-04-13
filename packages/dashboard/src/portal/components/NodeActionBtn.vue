<template>
  <v-container>
    <v-dialog v-model="openUnreserveDialog" max-width="600">
      <v-card>
        <v-card-title> Are you sure you want to unreserve this dedicated node? </v-card-title>
        <v-card-text>This will free up the node for others on the chain</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn @click="unReserveNode()" :loading="loadingUnreserveNode">Yes</v-btn>
          <v-btn @click="openUnreserveDialog = false">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn
      small
      outlined
      :loading="loadingReserveNode"
      color="#064663"
      style="background: white"
      v-if="status === 'free'"
      @click="reserveNode(nodeId)"
    >
      Reserve
    </v-btn>
    <v-btn
      small
      outlined
      color="red"
      style="background: white"
      v-if="status === 'yours'"
      @click="removeReserve(nodeId)"
    >
      Unreserve
    </v-btn>
    <v-btn small outlined disabled color="gray" v-if="status === 'taken'"> Taken </v-btn>
  </v-container>
</template>
<script lang="ts">
import { cancelRentContract, createRentContract, getActiveContracts, getNodeByID } from "@/portal/lib/nodes";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  name: "NodeActionBtn",
})
export default class NodeActionBtn extends Vue {
  @Prop({ required: true })
  status!: string;
  loadingReserveNode = false;
  @Prop({ required: true })
  nodeId!: string;
  solutionProviderID = null;
  $api: any;
  openUnreserveDialog = false;
  nodeIDToUnreserve = "";
  loadingUnreserveNode = false;

  reserveNode(nodeId: string) {
    this.loadingReserveNode = true;
    console.log(`reserving node ${nodeId}`);
    createRentContract(
      this.$api,
      this.$route.params.accountID,
      nodeId,
      this.solutionProviderID,
      async (res: { status: { type: string; asFinalized: string; isFinalized: string } }) => {
        console.log(res);
        switch (res.status.type) {
          case "Ready":
            this.$toasted.show(`Transaction submitted: Reserving node ${nodeId}`);
            break;
          case "Finalized":
            this.$toasted.show(`Transaction succeeded: Node ${nodeId} reserved`);
            this.loadingReserveNode = false;
            this.$emit("node-status-changed");
            break;
        }
      },
    ).catch((err: { message: string }) => {
      console.log(err.message);
      console.log(`Error:  ${err.message}`, {
        type: "error",
      });
      this.loadingReserveNode = false;
    });
  }
  removeReserve(nodeId: string) {
    this.openUnreserveDialog = true;
    this.nodeIDToUnreserve = nodeId;
  }
  async unReserveNode() {
    this.loadingUnreserveNode = true;
    this.$toasted.show(`check for contracts on node ${this.nodeIDToUnreserve}`);
    const contracts = await getActiveContracts(this.$api, this.nodeIDToUnreserve);
    if (contracts.length > 0) {
      this.$toasted.show(`node ${this.nodeIDToUnreserve} has ${contracts.length} active contracts`);
      this.loadingUnreserveNode = false;
      this.openUnreserveDialog = false;
    } else {
      this.$toasted.show(`unreserving node ${this.nodeIDToUnreserve}`);
      const rentedNode = await getNodeByID(this.nodeIDToUnreserve);

      cancelRentContract(
        this.$api,
        this.$route.params.accountID,
        rentedNode.rentContractId,
        async (res: { status: { type: string; asFinalized: string; isFinalized: string } }) => {
          console.log(res);
          switch (res.status.type) {
            case "Ready":
              this.$toasted.show(`Transaction submitted: Unreserving node ${this.nodeIDToUnreserve}`);
              break;
            case "Finalized":
              this.$toasted.show(`Transaction succeeded: Node ${this.nodeIDToUnreserve} Unreserved`);
              this.loadingUnreserveNode = false;
              this.openUnreserveDialog = false;
              this.$emit("node-status-changed");
              break;
          }
        },
      ).catch((err: { message: string }) => {
        console.log(err.message);
        this.$toasted.show(`Error:  ${err.message}`, {
          type: "error",
        });
        this.loadingUnreserveNode = false;
        this.openUnreserveDialog = false;
      });
    }
  }
}
</script>
