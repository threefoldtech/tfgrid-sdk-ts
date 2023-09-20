<template>
  <div class="table-content">
    <v-row>
      <v-col>
        <v-data-table-server
          :loading="loading"
          loading-text="Loading nodes..."
          :headers="headers"
          :items="modelValue"
          :items-length="count"
          :items-per-page="$props.size"
          :items-per-page-options="[
            { value: 5, title: '5' },
            { value: 10, title: '10' },
            { value: 15, title: '15' },
            { value: 50, title: '50' },
          ]"
          :page="$props.page"
          @update:page="$emit('update:page', $event)"
          @update:items-per-page="$emit('update:size', $event)"
          class="elevation-1 v-data-table-header"
          density="compact"
          :disable-sort="true"
          hide-default-header
          :hover="true"
          @click:row="openSheet"
        >
          <template v-slot:headers="{ columns }: any">
            <tr>
              <template v-for="column in columns" :key="column.key">
                <th>
                  <v-tooltip location="bottom">
                    <template v-slot:activator="{ props }">
                      <span v-bind="props">{{ column.title }}</span>
                    </template>
                    <span>{{ column.description || column.title }}</span>
                  </v-tooltip>
                </th>
              </template>
            </tr>
          </template>

          <template v-slot:[`item.totalPublicIPs`]="{ item }">
            {{ toFixedCsSize(item?.columns?.totalPublicIPs) }}
          </template>

          <template v-slot:[`item.freePublicIPs`]="{ item }">
            {{ toFixedCsSize(item?.columns?.freePublicIPs) }}
          </template>

          <template v-slot:[`item.total_resources.cru`]="{ item }">
            {{ toFixedCsSize(item?.columns?.total_resources?.cru) }}
          </template>

          <template v-slot:[`item.total_resources.mru`]="{ item }">
            {{ toFixedCsSize(item?.columns?.total_resources?.mru) }}
          </template>

          <template v-slot:[`item.total_resources.sru`]="{ item }">
            {{ toFixedCsSize(item?.columns?.total_resources?.sru) }}
          </template>

          <template v-slot:[`item.total_resources.hru`]="{ item }">
            {{ toFixedCsSize(item?.columns?.total_resources?.hru) }}
          </template>

          <template v-slot:[`item.uptime`]="{ item }">
            {{ secondToRedable(item?.columns?.uptime) }}
          </template>

          <template v-slot:[`item.status`]="{ item }">
            <p class="text-left mt-1 mb-0">
              <v-chip :color="getStatus(item).color">
                <span>
                  {{ getStatus(item).status }}
                </span>
              </v-chip>
            </p>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { type GridNode, NodeStatus } from "@threefold/gridproxy_client";
import type { PropType } from "vue";

import secondToRedable from "@/utils/second_to_redable";
import toFixedCsSize from "@/utils/to_fixed_cs_size";

export default {
  emits: ["update:page", "update:size", "update:selectedNode"],
  props: {
    size: {
      required: true,
      type: Number,
    },
    page: {
      required: true,
      type: Number,
    },
    modelValue: {
      required: true,
      type: [] as PropType<GridNode[]>,
    },
    selectedNode: {
      required: false,
      type: Object as PropType<GridNode>,
    },
    count: {
      required: true,
      type: Number,
    },
    loading: {
      required: true,
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    const nodeStatusOptions = [NodeStatus.Up, NodeStatus.Down];

    const headers: any = [
      { title: "ID", key: "nodeId" },
      { title: "Farm ID", key: "farmId", align: "center" },
      {
        title: "Total Public IPs",
        key: "totalPublicIPs",
        align: "center",
      },
      { title: "Free Public IPs", key: "freePublicIPs", align: "center" },
      { title: "CRU", key: "total_resources.cru", align: "center", description: "Total Cores" },
      { title: "MRU", key: "total_resources.mru", align: "center", description: "Total Memory" },
      { title: "SRU", key: "total_resources.sru", align: "center", description: "Total SSD" },
      { title: "HRU", key: "total_resources.hru", align: "center", description: "Total HDD" },
      { title: "GPU", key: "num_gpu", align: "center", description: "GPU card" },
      { title: "Up Time", key: "uptime", align: "left" },
      { title: "Status", key: "status", align: "center" },
    ];

    const getStatus = (node: any) => {
      if (node.props.title.status === NodeStatus.Up.toLocaleLowerCase()) {
        return { color: "green", status: NodeStatus.Up };
      } else {
        return { color: "red", status: NodeStatus.Down };
      }
    };

    const openSheet = (_e: any, { item }: any) => {
      emit("update:selectedNode", item.props.title);
    };

    return {
      headers,
      nodeStatusOptions,
      secondToRedable,
      getStatus,
      toFixedCsSize,
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
  line-height: 45px;
}
.v-data-table__thead {
  line-height: 60px;
}
</style>
