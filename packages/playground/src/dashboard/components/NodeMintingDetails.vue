<template>
  <v-container>
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
    <v-card outlined class="pa-2 border">
      <div class="receipt-body" v-if="receipts?.length">
        <v-row>
          <v-col
            class="text-start"
            cols="12"
            md="12"
            :lg="receipts.length > 1 ? '6' : '12'"
            v-for="receipt in receipts"
            :key="receipt.hash"
          >
            <v-card style="box-shadow: none" outlined>
              <v-container>
                <v-row>
                  <v-list class="custom-list" density="compact">
                    <h3 class="mb-1 font-weight-medium">
                      Minting Details<v-chip class="ma-2 me-auto" small :color="getChipColor(receipt.type)"
                        >{{ receipt.type }}
                      </v-chip>
                    </h3>
                    <div class="border">
                      <v-row class="row-style">
                        <v-col class="py-1" cols="4" sm="4" style="min-width: fit-content justify-end">
                          <v-list-item> Date of Payout :</v-list-item>
                        </v-col>
                        <v-col class="py-1">
                          <v-list-item>
                            <div style="display: flex; justify-content: end">
                              {{ getDateFromTimestamp(receipt.endPeriodTimestamp) }}
                            </div>
                          </v-list-item>
                        </v-col>
                      </v-row>
                      <v-row class="row-style">
                        <v-col class="py-1" cols="1" sm="2" style="min-width: fit-content">
                          <v-list-item> Node TFT Amount :</v-list-item>
                        </v-col>
                        <v-col class="py-1">
                          <v-list-item>
                            <div style="display: flex; justify-content: end">
                              {{ receipt.tft || 0 }} TFT<span v-if="receipt.fixupReward"
                                >+ {{ receipt.fixupReward || 0 }} TFT FixedUp</span
                              >
                            </div>
                          </v-list-item>
                        </v-col>
                      </v-row>
                      <v-row v-for="(val, key) in receipt.cloud_units" :key="key" class="row-style">
                        <v-col class="py-1" cols="1" sm="2" style="min-width: fit-content">
                          <v-list-item style="text-transform: uppercase"> {{ key }} :</v-list-item>
                        </v-col>
                        <v-col class="py-1">
                          <v-list-item>
                            <div style="display: flex; justify-content: end">
                              {{ val }}
                            </div>
                          </v-list-item>
                        </v-col>
                      </v-row>
                    </div>
                  </v-list>
                </v-row>
              </v-container>
            </v-card>
          </v-col>
        </v-row>
      </div>
      <div v-else>
        <v-card-text class="font-weight-bold">No receipts found for this month</v-card-text>
      </div>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" variant="outlined" @click="downloadNodeReceipt" :disabled="!node.receipts"
          >Download Node Receipt</v-btn
        >
      </v-card-actions>
    </v-card>
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
<style scoped>
.custom-list {
  overflow: hidden;
  font-size: 0.875rem;
  padding: 10px;
  width: 100%;
}

.row-style {
  border-bottom: 0.1px solid #4e4e4e;
  margin: auto;
}
</style>
