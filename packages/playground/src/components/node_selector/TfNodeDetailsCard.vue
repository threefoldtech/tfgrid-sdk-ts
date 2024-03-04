<template>
  <VCard
    class="rounded-0 w-100"
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
              $emit('node:select', node);
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
            <img
              :src="getCountryFlagSrc()"
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
      <VTooltip text="Node Serial Number" v-if="node && node.serialNumber">
        <template #activator="{ props }">
          <VChip size="x-small" v-bind="props">
            <span class="font-weight-bold" v-text="checkSerialNumber(node?.serialNumber)" />
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
    </template>

    <template #append>
      <template v-if="node">
        <VChip v-if="node?.hasGPU" color="secondary" text="Node Has GPU" />
        <VChip class="mx-2" color="primary" :text="node?.certificationType" />
        <VChip
          :color="node?.rentedByTwinId === 0 ? 'secondary' : 'success'"
          :text="(node?.rentedByTwinId === 0 ? 'Shared' : 'Dedicated') + ' Node'"
        />
      </template>
    </template>

    <template #text>
      <VRow>
        <VCol>
          <InputTooltip tooltip="CPU can be greater than 100% due to overprovisioning." align-center>
            <ResourceDetails
              name="CPU"
              :used="node?.used_resources.cru ?? 0"
              :total="node?.total_resources.cru ?? 0"
              :text="cruText"
            />
          </InputTooltip>
        </VCol>
        <VCol>
          <ResourceDetails
            name="Memory"
            :used="node?.used_resources.mru ?? 0"
            :total="node?.total_resources.mru ?? 0"
            :text="mruText"
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
    </template>
  </VCard>
</template>

<script lang="ts">
import type { NodeInfo } from "@threefold/grid_client";
import { GridNode } from "@threefold/gridproxy_client";
import { computed, type PropType } from "vue";

import { getCountryCode } from "@/utils/get_nodes";

import formatResourceSize from "../../utils/format_resource_size";
import ResourceDetails from "./node_details_internals/ResourceDetails.vue";

export default {
  name: "TfNodeDetailsCard",
  components: { ResourceDetails },
  props: {
    node: Object as PropType<NodeInfo>,
    status: String as PropType<"Init" | "Pending" | "Invalid" | "Valid">,
    selectable: Boolean,
    flat: Boolean,
  },
  emits: {
    "node:select": (node: NodeInfo) => true || node,
  },
  setup(props) {
    const getCountryFlagSrc = () => {
      const conuntryCode = getCountryCode(props.node as unknown as GridNode);
      return conuntryCode.toLocaleLowerCase() != "ch"
        ? `https://www.worldatlas.com/r/w425/img/flag/${conuntryCode?.toLocaleLowerCase()}-flag.jpg`
        : `https://www.worldatlas.com/r/w425/img/flag/${conuntryCode?.toLocaleLowerCase()}-flag.png`;
    };

    function normalizeBytesResourse(name: "mru" | "sru" | "hru") {
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
    const mruText = computed(normalizeBytesResourse("mru"));
    const sruText = computed(normalizeBytesResourse("sru"));
    const hruText = computed(normalizeBytesResourse("hru"));

    return { cruText, mruText, sruText, hruText, checkSerialNumber, getCountryFlagSrc };
  },
};
</script>
