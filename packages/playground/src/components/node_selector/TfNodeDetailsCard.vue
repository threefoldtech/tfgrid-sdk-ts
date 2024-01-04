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
            <img :src="flag" class="h-100" :alt="(node?.location.country ?? 'node') + '-flag'" v-bind="props" />
          </VAvatar>
        </template>
      </VTooltip>
    </template>

    <template #title>
      Node ID({{ node?.nodeId }})
      <VTooltip text="Node Serial Number" v-if="node">
        <template #activator="{ props }">
          <VChip size="x-small" v-bind="props">
            <span class="font-weight-bold" v-text="node.serialNumber" />
          </VChip>
        </template>
      </VTooltip>
    </template>

    <template #subtitle>
      <span v-text="'Farm ID: ' + (node?.farmId ?? '') + ' '" />
      <VTooltip v-if="node" :text="'Farm is ' + (node?.inDedicatedFarm ? 'Dedicated' : 'Shared')">
        <template #activator="{ props }">
          <VChip
            v-bind="props"
            :color="node?.inDedicatedFarm ? 'success' : 'secondary'"
            size="x-small"
            :text="node?.inDedicatedFarm ? 'Dedicated' : 'Shared'"
          />
        </template>
      </VTooltip>
    </template>

    <template #append>
      <template v-if="node">
        <VTooltip text="Node Details" location="left center">
          <template #activator="{ props }">
            <VContainer v-bind="props">
              <VRow align="center">
                <VChip v-if="node?.hasGPU" color="secondary" text="Has GPU" />
                <VChip class="mx-2" color="primary" :text="node?.certificationType" />
                <VChip
                  :color="node?.rentedByTwinId === 0 ? 'secondary' : 'success'"
                  :text="node?.rentedByTwinId === 0 ? 'Shared' : 'Dedicated'"
                />
              </VRow>
            </VContainer>
          </template>
        </VTooltip>
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
import { byCountry } from "country-code-lookup";
import { computed, type PropType } from "vue";

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
    const flag = computed(() => {
      const country = props.node?.location.country ?? "";
      const code = byCountry(country)?.internet || byCountry(country.toLowerCase())?.internet;
      return code
        ? `https://www.worldatlas.com/r/w425/img/flag/${code.toLowerCase()}-flag.jpg`
        : `https://placehold.co/30x20?text=TF`;
    });

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

    const cruText = computed(() =>
      props.node ? `${props.node.used_resources.cru} / ${props.node.total_resources.cru} (Cores)` : "",
    );
    const mruText = computed(normalizeBytesResourse("mru"));
    const sruText = computed(normalizeBytesResourse("sru"));
    const hruText = computed(normalizeBytesResourse("hru"));

    return { flag, cruText, mruText, sruText, hruText };
  },
};
</script>
