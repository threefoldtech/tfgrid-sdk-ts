<template>
  <div class="table-content">
    <v-row>
      <v-col>
        <v-data-table
          :loading="loading"
          :headers="headers"
          :items="items"
          :items-length="count"
          :items-per-page="$props.size"
          :items-per-page-options="[
            { value: 5, title: '5' },
            { value: 10, title: '10' },
            { value: 15, title: '15' },
          ]"
          class="elevation-1"
          @click:row="openSheet"
        >
          <template #loading />
        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import type { Farm } from "@threefold/gridproxy_client";
import type { PropType } from "vue";

import type { VDataTableHeader } from "../../types";
export default {
  props: {
    items: {
      required: false,
      type: Object as PropType<Farm[]>,
    },
    loading: {
      required: true,
      type: Boolean,
    },
    count: {
      required: true,
      type: Number,
    },
  },
  setup(props, { emit }) {
    const openSheet = (_e: any, { item }: any) => {
      emit("open-dialog", item.value);
    };

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

    return {
      headers,
      itemPerPage,
      openSheet,
    };
  },
};
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
