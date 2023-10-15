<template>
  <div class="table-content">
    <v-row>
      <v-col>
        <v-data-table
          :loading="loading"
          :items-per-page="itemPerPage"
          :headers="headers"
          :items="items"
          class="elevation-1"
          @click:row="openSheet"
        >
          <template #loading />
        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from "vue";
import { defineEmits } from "vue";

import type { VDataTableHeader } from "@/types";

import type { IFarm } from "../farms.vue";

const emit = defineEmits(["open-dialog"]);
const openSheet = (_e: any, { item }: any) => {
  emit("open-dialog", item.value);
};

defineProps({
  items: {
    required: true,
    type: Object as PropType<IFarm[]>,
  },
  loading: {
    required: true,
    type: Boolean,
  },
});

const itemPerPage = 10;
const headers: VDataTableHeader = [
  { title: "ID", key: "farmId" },
  { title: "Name", key: "name" },
  {
    title: "Total Public IPs",
    key: "totalPublicIp",
    align: "start",
    sortable: false,
  },
  {
    title: "Free Public IPs",
    key: "freePublicIp",
    align: "start",
    sortable: false,
  },
  {
    title: "Used Public IPs",
    key: "usedPublicIp",
    align: "start",
    sortable: false,
  },
  {
    title: "Certification Type",
    key: "certificationType",
    align: "start",
    sortable: false,
  },
  {
    title: "Pricing Policy",
    key: "pricingPolicyId",
    align: "start",
    sortable: false,
  },
];
</script>

<style>
.v-data-table-header th,
.v-data-table-header td {
  white-space: nowrap;
}
.v-data-table__tr {
  line-height: 55px;
}
.v-data-table__thead {
  line-height: 60px;
}
</style>
