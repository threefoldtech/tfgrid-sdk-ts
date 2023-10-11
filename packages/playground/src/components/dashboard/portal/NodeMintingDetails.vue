<template>
  <v-container>
    <v-row>
      <v-col cols="3">
        <v-menu ref="menu" v-model="showMenu" :close-on-content-click="true" transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-text-field v-model="selectedData" label="Filter by month" readonly v-bind="props"></v-text-field>
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
          <div class="receipt-body" v-if="receipts?.length">
            <v-card outlined v-for="receipt in receipts" :key="receipt.hash">
              <v-container>
                <v-row>
                  <v-col cols="10">
                    <v-card-text>
                      <span class="font-weight-bold">Date of Payout :</span>
                      {{ getDateFromTimestamp(receipt.endPeriodTimestamp) }}
                      <br />
                      <span class="font-weight-bold">Node TFT Amount :</span> {{ receipt.tft || 0 }} TFT
                      <span v-if="receipt.fixupReward">+ {{ receipt.fixupReward || 0 }} TFT FixedUp</span>
                      <br />
                      <span class="font-weight-bold">Cloud Units :</span>
                      <ul>
                        <li inset v-for="(val, key) in receipt.cloud_units" :key="key">
                          <b style="text-transform: uppercase">{{ key }}:</b> {{ val }}
                        </li>
                      </ul>
                    </v-card-text>
                  </v-col>
                  <v-col cols="2">
                    <v-chip class="ma-4 me-auto" small :color="getChipColor(receipt.type)">{{ receipt.type }} </v-chip>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </div>
          <div v-else>
            <v-card-text class="font-weight-bold">No receipts found for this month</v-card-text>
          </div>
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
import { ref } from "vue";

import { generateReceipt, type receiptInterface } from "@/utils/node";

export default {
  name: "NodeMintingDetails",
  props: ["node"],
  setup(props) {
    const showMenu = ref(false);
    const selectedData = ref();
    const minDate = ref();
    const maxDate = ref();
    const receipts = ref<receiptInterface[]>();

    function downloadNodeReceipt() {
      let doc = new jsPDF();
      doc = generateReceipt(doc, props.node);
      doc.save(`node_${props.node.nodeId}_receipts.pdf`);
    }

    function formatDate(date: Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");

      return `${year}-${month}`;
    }
    function getDates() {
      const firstReceiptData = props.node.receipts.value[props.node.receipts.length - 1].startPeriodTimestamp;
      const lastReceiptData = props.node.receipts.value[0].startPeriodTimestamp;

      minDate.value = formatDate(getDateFromTimestamp(firstReceiptData));
      maxDate.value = formatDate(getDateFromTimestamp(lastReceiptData));

      selectedData.value = maxDate;
    }

    function getChipColor(type: string) {
      switch (type) {
        case "MINTING":
          return "green";
        case "FIXUP":
          return "red";
        default:
          return "grey";
      }
    }

    function getDateFromTimestamp(timestamp: number) {
      return new Date(timestamp * 1000);
    }

    function getMonthReceipt() {
      const selectedDate = new Date(selectedData.value);
      receipts.value = filterReceiptsByMonth(props.node.receipts, selectedDate.getFullYear(), selectedDate.getMonth());
    }

    function filterReceiptsByMonth(receipts: receiptInterface[], year: number, month: number): receiptInterface[] {
      const startDate = new Date(year, month - 1, 20);
      const endDate = new Date(year, month, 20);

      const filteredReceipts = receipts.filter(receipt => {
        const receiptDate = getDateFromTimestamp(receipt.startPeriodTimestamp);
        return receiptDate >= startDate && receiptDate < endDate;
      });

      return filteredReceipts;
    }
    return {
      showMenu,
      selectedData,
      minDate,
      maxDate,
      receipts,
      getDateFromTimestamp,
      downloadNodeReceipt,
      getDates,
      getChipColor,
      getMonthReceipt,
    };
  },
};
</script>
