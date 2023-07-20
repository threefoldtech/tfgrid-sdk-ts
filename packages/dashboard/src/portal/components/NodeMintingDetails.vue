<template>
  <v-container>
    <v-row>
      <v-col cols="3">
        <v-menu ref="menu" v-model="showMenu" :close-on-content-click="true" transition="scale-transition">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="selectedData"
              label="Filter by month"
              readonly
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>

          <v-date-picker
            v-model="selectedData"
            type="month"
            class="mt-4"
            color="blue lighten-1"
            :min="minDate"
            :max="maxDate"
            no-title
            scrollable
          ></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="9">
        <v-card outlined>
          <v-card-title>
            <span class="headline">Minting Details</span>
          </v-card-title>
          <v-card-text>
            <span class="font-weight-bold">Date of Payout :</span>
            {{ getDateFromTimestamp(receipt.payoutDate) }}
            <br />
            <span class="font-weight-bold">Node TFT Amount :</span> {{ receipt.tft || 0 }} TFT
            <br />
            <span class="font-weight-bold">Cloud Units :</span>
            <ul>
              <li inset v-for="(val, key) in receipt.clould_units" :key="key">
                <b style="text-transform: uppercase">{{ key }}:</b> {{ val }}
              </li>
            </ul>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue" @click="downloadNodeReceipt">Download Node Receipt</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { jsPDF } from "jspdf";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { nodeInterface } from "../lib/farms";
import { generateReceipt, receiptInterface } from "../lib/nodes";

@Component({ name: "NodeMintingDetails" })
export default class NodeMintingDetails extends Vue {
  @Prop({ required: true })
  node!: nodeInterface;

  showMenu = false;
  selectedData = "";
  minDate = "";
  maxDate = "";
  receipt: receiptInterface = {
    type: "minting",
    hash: "",
    clould_units: {
      cu: 0,
      su: 0,
      nu: 0,
    },
    payoutDate: 0,
  };

  @Watch("selectedData")
  onDateChange() {
    this.getMonthReceipt();
  }

  downloadNodeReceipt() {
    let doc = new jsPDF();
    doc = generateReceipt(doc, this.node);
    doc.save(`node_${this.node.nodeId}_receipts.pdf`);
  }

  formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
  }

  getDates() {
    const firstReceiptData = this.node.receipts[this.node.receipts.length - 1].payoutDate;
    const lastReceiptData = this.node.receipts[0].payoutDate;

    this.minDate = this.formatDate(this.getDateFromTimestamp(firstReceiptData));
    this.maxDate = this.formatDate(this.getDateFromTimestamp(lastReceiptData));

    this.selectedData = this.maxDate;
  }

  mounted() {
    this.getDates();
    this.getMonthReceipt();
    for (let i = 0; i < this.node.receipts.length; i++) {
      if (this.node.receipts[i].clould_units.cu > 0) {
        console.log(this.node.receipts[i]);
      }
    }
  }

  getDateFromTimestamp(timestamp: number) {
    return new Date(timestamp * 1000);
  }

  getMonthReceipt() {
    const selectedDate = new Date(this.selectedData);
    for (let i = 0; i < this.node.receipts.length; i++) {
      const receiptDate = this.getDateFromTimestamp(this.node.receipts[i].payoutDate);
      if (selectedDate.getMonth() === receiptDate.getMonth()) {
        this.receipt = this.node.receipts[i];
        break;
      }
    }
  }
}
</script>
