<template>
  <VCard
    class="rounded-0 w-100"
    :class="{ 'selected-node': selected }"
    :color="selected ? 'rgba(var(--v-theme-primary), 0.1)' : undefined"
    flat
    @click="
      () => {
        if (!selected) {
          $emit('node:select', node);
        }
      }
    "
  >
    <template #prepend>
      <VTooltip :text="node.location.country">
        <template #activator="{ props }">
          <VAvatar size="40">
            <img :src="flag" class="h-100" :alt="node.location.country + '-flag'" v-bind="props" />
          </VAvatar>
        </template>
      </VTooltip>
    </template>

    <template #title>
      Node ID({{ node.nodeId }})
      <VTooltip text="Node Serial Number">
        <template #activator="{ props }">
          <VChip size="x-small" v-bind="props">
            <span class="font-weight-bold" v-text="node.serialNumber" />
          </VChip>
        </template>
      </VTooltip>
    </template>

    <template #subtitle>
      <span v-text="'Farm ID: ' + node.farmId + ' '" />
      <VChip
        :color="node.inDedicatedFarm ? 'success' : 'secondary'"
        size="x-small"
        :text="node.inDedicatedFarm ? 'Dedicated' : 'Shared'"
      />
    </template>

    <template #append>
      <VChip v-if="node.hasGPU" color="secondary" text="Has GPU" />
      <VChip class="mx-2" color="primary" :text="node.certificationType" />
      <VChip
        :color="node.rentedByTwinId === 0 ? 'secondary' : 'success'"
        :text="node.rentedByTwinId === 0 ? 'Shared' : 'Dedicated'"
      />
    </template>

    <template #text>
      <VRow>
        <VCol>
          <InputTooltip tooltip="CPU can be greater than 100% because overprovisioning." align-center>
            <ResourceDetails
              name="CPU"
              :used="node.used_resources.cru"
              :total="node.total_resources.cru"
              :text="cruText"
            />
          </InputTooltip>
        </VCol>
        <VCol>
          <ResourceDetails
            name="Memory"
            :used="node.used_resources.mru"
            :total="node.total_resources.mru"
            :text="mruText"
          />
        </VCol>
      </VRow>

      <VRow>
        <VCol>
          <ResourceDetails
            name="SSD Disks"
            :used="node.used_resources.sru"
            :total="node.total_resources.sru"
            :text="sruText"
          />
        </VCol>
        <VCol>
          <ResourceDetails
            name="HDD Disks"
            :used="node.used_resources.hru"
            :total="node.total_resources.hru"
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
    node: { type: Object as PropType<NodeInfo>, required: true },
    selected: Boolean,
  },
  emits: {
    "node:select": (node: NodeInfo) => true || node,
  },
  setup(props) {
    const flag = computed(() => {
      const { country } = props.node.location;
      const code = byCountry(country)?.internet || byCountry(country.toLowerCase())?.internet;
      return code
        ? `https://www.worldatlas.com/r/w425/img/flag/${code.toLowerCase()}-flag.jpg`
        : `https://placehold.co/30x20`;
    });

    function normalizeBytesResourse(name: "mru" | "sru" | "hru") {
      return () => {
        const used = formatResourceSize(props.node.used_resources[name]);
        const total = formatResourceSize(props.node.total_resources[name]);

        if (total === "0") return "";

        return `${used} / ${total}`;
      };
    }

    const cruText = computed(() => `${props.node.used_resources.cru} / ${props.node.total_resources.cru} (Cores)`);
    const mruText = computed(normalizeBytesResourse("mru"));
    const sruText = computed(normalizeBytesResourse("sru"));
    const hruText = computed(normalizeBytesResourse("hru"));

    return { flag, cruText, mruText, sruText, hruText };
  },
};
</script>
