<template>
  <div class="table-content">
    <v-row>
      <v-col>
        <v-data-table-server
          :loading="loading"
          loading-text="Loading farms..."
          :headers="headers"
          :items="modelValue"
          :items-length="count"
          :items-per-page-options="[
            { value: 5, title: '5' },
            { value: 10, title: '10' },
            { value: 15, title: '15' },
            { value: 50, title: '50' },
          ]"
          class="elevation-1 v-data-table-header"
          density="compact"
          :disable-sort="true"
          hide-default-header
          :hover="true"
        >
          <template #loading />
        </v-data-table-server>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import type { Farm } from "@threefold/gridproxy_client";
import type { PropType } from "vue";
import type { VDataTable } from "vuetify/labs/VDataTable";

const props = defineProps({
  modelValue: {
    required: true,
    type: [] as PropType<Farm[]>,
  },
  count: {
    required: true,
    type: Number,
  },
  loading: {
    required: true,
    type: Boolean,
  },
});

const emit = defineEmits<{
  (e: "update", value: string): void;
}>();

const headers: VDataTable["headers"] = [
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

<script lang="ts">
export default {
  name: "Farms table",
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
