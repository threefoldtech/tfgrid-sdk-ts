<template>
  <VCard
    class="rounded-0 w-100 pb-3"
    :class="{ 'selected-node': status !== 'Init' }"
    :color="
      status === 'Valid'
        ? 'rgba(var(--v-theme-primary), 0.1)'
        : status === 'Invalid'
        ? 'rgba(var(--v-theme-error), 0.1)'
        : status === 'Pending'
        ? 'rgba(var(--v-theme-warning), 0.01)'
        : undefined
    "
    :flat="flat"
    v-bind="{
      onClick: selectable
        ? () => {
            if (status === 'Init' && node) {
              $emit('node:select', (node as NodeInfo));
            }
          }
        : undefined,
    }"
  >
    <template #loader>
      <VProgressLinear indeterminate color="primary" height="2" v-if="status === 'Pending'" />
    </template>

    <template #prepend>
      <VTooltip :text="node?.location.country" :disabled="!node">
        <template #activator="{ props }">
          <VAvatar size="40">
            <span v-if="countryFlagSrc.length === 0" class="flag-avatar">NA</span>
            <img
              v-else
              :src="countryFlagSrc"
              class="h-100"
              :alt="(node?.location.country ?? 'node') + '-flag'"
              v-bind="props"
            />
          </VAvatar>
        </template>
      </VTooltip>
    </template>

    <template #title>
      Node ID: {{ node?.nodeId }}
      <VTooltip text="Node Serial Number" v-if="node && serialNumber">
        <template #activator="{ props }">
          <VChip size="x-small" v-bind="props">
            <span class="font-weight-bold" v-text="checkSerialNumber(serialNumber)" />
          </VChip>
        </template>
      </VTooltip>
      <VTooltip text="Node Country" v-if="node && node.location.country" location="left">
        <template #activator="{ props }">
          <VChip class="ml-2" size="x-small" v-bind="props">
            <span class="font-weight-bold" v-text="node?.location.country" />
          </VChip>
        </template>
      </VTooltip>
    </template>

    <template #subtitle>
      <span v-if="node"> Farm: <span class="font-weight-bold" v-text="node.farmName" /> </span>
      <span class="ml-2" v-if="node">
        Uptime: <span class="font-weight-bold" v-text="toReadableDate(node.uptime)" />
      </span>
    </template>

    <template #append>
      <template v-if="node">
        <div class="d-flex">
          <VChip class="mr-2" :color="dedicated ? 'success' : 'secondary'" :text="dedicated ? 'Dedicated' : 'Shared'" />
          <VChip :color="node?.status === 'up' ? 'success' : 'error'" class="mr-2" :text="capitalize(node?.status)" />

          <VChip v-if="num_gpu" class="mr-2" color="secondary" :text="num_gpu + ' GPU'" />
          <VChip v-if="rentable || rented" class="mr-2" color="secondary" :text="rentable ? 'Rentable' : 'Rented'" />

          <VChip
            class="mr-2"
            color="primary"
            :text="node?.certificationType === 'Diy' ? node?.certificationType.toUpperCase() : node?.certificationType"
          />
          <span v-if="speed?.upload && speed?.download" class="speed-chip mr-2 grey-darken-3">
            <span>
              <v-icon icon="mdi-arrow-up"></v-icon>
              <span class="mx-1"> {{ formatSpeed(speed.upload) }}</span>
            </span>
            <span>
              <v-icon icon="mdi-arrow-down"></v-icon>
              <span class="mx-1">{{ formatSpeed(speed.download) }}</span>
            </span>
          </span>
        </div>
      </template>
    </template>

    <template #text>
      <VRow>
        <VCol>
          <ResourceDetails
            name="CPU"
            :used="node?.used_resources.cru ?? 0"
            :total="node?.total_resources.cru ?? 0"
            :text="cruText"
            :cpuType="dmi?.processor[0]?.version"
          />
        </VCol>
        <VCol>
          <ResourceDetails
            name="Memory"
            :used="node?.used_resources.mru ?? 0"
            :total="node?.total_resources.mru ?? 0"
            :text="mruText"
            :memoryType="dmi?.memory[0]?.type"
          />
        </VCol>
      </VRow>

      <VRow>
        <VCol>
          <ResourceDetails
            name="SSD Disks"
            :used="node?.used_resources.sru ?? 0"
            :total="node?.total_resources.sru ?? 0"
            :text="sruText"
          />
        </VCol>
        <VCol>
          <ResourceDetails
            name="HDD Disks"
            :used="node?.used_resources.hru ?? 0"
            :total="node?.total_resources.hru ?? 0"
            :text="hruText"
          />
        </VCol>
      </VRow>
      <div class="mt-5 ml-auto text-right">
        <span v-if="price_usd" class="font-weight-bold">{{ price_usd }} USD/Month</span>
        <reserve-btn
          v-if="node?.dedicated && node?.status !== 'down'"
          class="ml-4"
          :node="(node as GridNode)"
          @updateTable="$emit('reloadTable')"
        />
      </div>
    </template>
  </VCard>
</template>
<script lang="ts">
import type { NodeInfo } from "@threefold/grid_client";
import type { GridNode } from "@threefold/gridproxy_client";
import { computed, ref } from "vue";
import { capitalize } from "vue";

import ReserveBtn from "@/dashboard/components/reserve_action_btn.vue";
import { getCountryCode } from "@/utils/get_nodes";
import toReadableDate from "@/utils/to_readable_data";

import formatResourceSize from "../../utils/format_resource_size";
import ResourceDetails from "./node_details_internals/ResourceDetails.vue";

export default {
  name: "TfNodeDetailsCard",
  components: { ResourceDetails, ReserveBtn },
  props: {
    node: Object as () => NodeInfo | GridNode,
    status: String as () => "Init" | "Pending" | "Invalid" | "Valid",
    selectable: Boolean,
    flat: Boolean,
  },
  emits: {
    "node:select": (node: NodeInfo) => true || node,
    reloadTable: () => true,
  },
  setup(props) {
    const node = ref(props.node);
    const countryFlagSrc = computed(() => {
      const countryCode = getCountryCode(props.node as GridNode);
      if (countryCode.length > 2) {
        return "";
      }

      const imageUrl =
        countryCode.toLowerCase() !== "ch"
          ? `https://www.worldatlas.com/r/w425/img/flag/${countryCode.toLowerCase()}-flag.jpg`
          : `https://www.worldatlas.com/r/w425/img/flag/${countryCode.toLowerCase()}-flag.png`;

      return imageUrl;
    });

    // A guard to check node type
    function isGridNode(node: unknown): node is GridNode {
      return !!node && typeof node === "object" && "num_gpu" in node;
    }

    const dedicated = computed(() => {
      if (isGridNode(node.value)) {
        return node.value?.dedicated;
      }
      return null;
    });

    const serialNumber = computed(() => {
      if (isGridNode(node.value)) {
        return null;
      }
      return node.value?.serialNumber;
    });

    const num_gpu = computed(() => {
      if (isGridNode(node.value)) {
        return node.value?.num_gpu;
      }
      return node.value?.hasGPU;
    });

    const rentable = computed(() => {
      if (isGridNode(node.value)) {
        return node.value?.rentable;
      }
      return null;
    });

    const rented = computed(() => {
      if (isGridNode(node.value)) {
        return node.value?.rented;
      }
      return null;
    });

    const speed = computed(() => {
      if (isGridNode(node.value)) {
        return node.value?.speed;
      }
      return null;
    });

    const price_usd = computed(() => {
      if (isGridNode(node.value)) {
        return node.value?.price_usd;
      }
      return null;
    });

    const dmi = computed(() => {
      if (isGridNode(node.value)) {
        return node.value?.dmi;
      }
      return null;
    });

    function normalizeBytesResource(name: "mru" | "sru" | "hru") {
      return () => {
        if (!props.node) {
          return "";
        }

        const used = formatResourceSize(props.node.used_resources[name]);
        const total = formatResourceSize(props.node.total_resources[name]);

        if (total === "0") return "";

        return `${used} / ${total}`;
      };
    }

    function checkSerialNumber(serialNumber: string) {
      if (/\d/.test(serialNumber)) {
        return serialNumber;
      } else {
        return "Unknown";
      }
    }

    const cruText = computed(() =>
      props.node ? `${props.node.used_resources.cru} / ${props.node.total_resources.cru} (Cores)` : "",
    );
    const mruText = computed(normalizeBytesResource("mru"));
    const sruText = computed(normalizeBytesResource("sru"));
    const hruText = computed(normalizeBytesResource("hru"));

    function formatSpeed(speed: number): string {
      return formatResourceSize(speed).toLocaleLowerCase() + "ps";
    }

    return {
      cruText,
      mruText,
      sruText,
      hruText,
      countryFlagSrc,
      toReadableDate,
      dedicated,
      serialNumber,
      num_gpu,
      rentable,
      rented,
      speed,
      price_usd,
      dmi,
      checkSerialNumber,
      capitalize,
      formatResourceSize,
      formatSpeed,
    };
  },
};
</script>

<style scoped>
.flag-avatar {
  padding: 20px;
  background-color: var(--primary);
  border-radius: 50%;
  color: white;
  font-weight: 700;
}

.speed-chip {
  display: flex;
  flex-direction: column !important;
  font-size: 0.7rem;
  background-color: #424242;
  padding: 5px 12px;
  border-radius: 9999px;
}
</style>
