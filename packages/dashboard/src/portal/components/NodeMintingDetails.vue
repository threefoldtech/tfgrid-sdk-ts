<template>
  <v-container>
    <v-select v-model="month" :nodes="months" label="Filter by Month"></v-select>

    <v-card>
      <v-container fluid>
        <v-row :justify="'start'">
          <v-col cols="8">
            <v-row>
              <v-flex xs3 class="text-left pr-2">Payout Address</v-flex>
              <v-flex class="text-truncate font-weight-bold">
                <span>{{ node.nodeId }}</span>
              </v-flex>
            </v-row>
            <v-row>
              <v-flex xs3 class="text-left pr-2">Farm ID</v-flex>
              <v-flex class="text-truncate font-weight-bold">
                <span>{{ node.farmId }}</span>
              </v-flex>
            </v-row>
            <v-row>
              <v-flex xs3 class="text-left pr-2">Twin ID</v-flex>
              <v-flex class="text-truncate font-weight-bold">
                <span>{{ node.twinId }}</span>
              </v-flex>
            </v-row>
            <v-row>
              <v-flex xs3 class="text-left pr-2">Twin ID</v-flex>
              <v-flex class="text-truncate font-weight-bold">
                <span>{{ node.twinId }}</span>
              </v-flex>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
    <br />
    <v-btn @click="downloadNodeReceipt">Download Receipts</v-btn>
  </v-container>
</template>

<script lang="ts">
import { jsPDF } from "jspdf";
import { Component, Prop, Vue } from "vue-property-decorator";

import { nodeInterface } from "../lib/farms";
import { generateReceipt } from "../lib/nodes";

@Component({ name: "NodeMintingDetails" })
export default class NodeMintingDetails extends Vue {
  @Prop({ required: true })
  node!: nodeInterface;

  month = "";
  months = [
    "All",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  downloadNodeReceipt() {
    let doc = new jsPDF();
    doc = generateReceipt(doc, this.node);
    doc.save(`node_${this.node.nodeId}_receipts.pdf`);
  }
}
</script>
