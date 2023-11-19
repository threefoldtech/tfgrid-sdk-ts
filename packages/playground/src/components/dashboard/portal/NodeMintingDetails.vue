<template>
  <v-container>
    <v-row>
      <v-col cols="3">
        <v-menu ref="menu" v-model="showMenu" :close-on-content-click="false" transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-text-field v-bind="props" label="Select Month and Year" readonly :model-value="selectedData" />
          </template>

          <v-card>
            <v-card-text class="d-flex">
              <v-select v-model="selectedMonth" :items="months" label="Month"></v-select>

              <v-select v-model="selectedYear" :items="years" label="Year"></v-select>
            </v-card-text>
          </v-card>
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
            <v-btn color="blue" @click="downloadNodeReceipt" :disabled="!node.receipts">Download Node Receipt</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { jsPDF } from "jspdf";
import moment from "moment";
import { computed, type PropType, ref } from "vue";

import { generateReceipt, type NodeInterface, type receiptInterface } from "@/utils/node";

export default {
  name: "NodeMintingDetails",
  props: {
    node: {
      type: Object as PropType<NodeInterface>,
      required: true,
    },
  },
  setup(props) {
    const showMenu = ref(false);
    const menu = ref(false);
    const minDate = ref();
    const maxDate = ref();
    const selectedMonth = ref(moment().format("MMMM"));
    const selectedYear = ref(+moment().format("YYYY"));
    const receipts = computed(() => {
      return filterReceiptsByMonth(
        props.node.receipts,
        selectedYear.value,
        moment.months().indexOf(selectedMonth.value),
      );
    });
    const years = Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - 5 + index);
    const months = ref(moment.months());
    const selectedData = computed(() => [selectedMonth.value, selectedYear.value].filter(Boolean).join(", "));

    async function downloadNodeReceipt() {
      let doc = new jsPDF();
      doc = await generateReceipt(doc, props.node);
      doc.save(`node_${props.node.nodeId}_receipts.pdf`);
    }

    function getChipColor(type: string) {
      switch (type) {
        case "MINTING":
          return "primary";
        case "FIXUP":
          return "red";
        default:
          return "grey";
      }
    }

    function getDateFromTimestamp(timestamp: number) {
      return new Date(timestamp * 1000);
    }

    function filterReceiptsByMonth(receipts: receiptInterface[], year: number, month: number): receiptInterface[] {
      const filteredReceipts = receipts.filter(receipt => {
        const date = moment(receipt.endPeriodTimestamp * 1000);
        return date.month() === month && date.year() === year;
      });

      return filteredReceipts;
    }
    return {
      showMenu,
      minDate,
      maxDate,
      receipts,
      years,
      months,
      selectedMonth,
      selectedYear,
      menu,
      selectedData,
      getDateFromTimestamp,
      downloadNodeReceipt,
      getChipColor,
    };
  },
};
</script>
