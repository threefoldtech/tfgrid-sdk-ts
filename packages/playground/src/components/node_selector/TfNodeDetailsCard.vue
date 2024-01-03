<template>
  <VCard class="rounded-0 w-100" flat>
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
      <VChip color="secondary" :text="(node.hasGPU ? 'Has' : 'No') + ' GPU'" />
      <VChip class="mx-2" color="primary" :text="node.certificationType" />
      <VChip
        :color="node.rentedByTwinId === 0 ? 'secondary' : 'success'"
        :text="node.rentedByTwinId === 0 ? 'Shared' : 'Dedicated'"
      />
    </template>

    <template #text>
      <p class="font-weight-bold text-h6">Resources</p>

      <VRow>
        <VCol>
          <InputTooltip tooltip="CPU can be greater than 100% because overprovisioning." align-center>
            <ResourceDetails name="CPU" :used="node.used_resources.cru" :total="node.total_resources.cru" />
          </InputTooltip>
        </VCol>
        <VCol>
          <ResourceDetails name="Memory" :used="node.used_resources.mru" :total="node.total_resources.mru" />
        </VCol>
        <VCol>
          <ResourceDetails name="SSD Disks" :used="node.used_resources.sru" :total="node.total_resources.sru" />
        </VCol>
        <VCol>
          <ResourceDetails name="HDD Disks" :used="node.used_resources.hru" :total="node.total_resources.hru" />
        </VCol>
      </VRow>

      <!-- <VContainer>
        <VRow>
          <span v-text="'CPU (Cores)'" />
          <VSpacer />
          <p class="font-weight-bold">
            {{ parseInt(((node.used_resources.cru / node.total_resources.cru) * 10000).toString()) / 100 }} %
          </p>
        </VRow>
      </VContainer>
      <VProgressLinear model-value="20" color="primary" />

      <VContainer class="mt-4">
        <VRow>
          <span v-text="'CPU (Cores)'" />
          <VSpacer />
          {{ node.used_resources.cru }} | {{ node.total_resources.cru }} |
          <p>{{ node.used_resources.cru / node.total_resources.cru }}</p>
        </VRow>
      </VContainer>
      <VProgressLinear model-value="20" color="primary" /> -->
    </template>

    <VDivider v-if="appendDivider" />
  </VCard>
</template>

<script lang="ts">
import type { NodeInfo } from "@threefold/grid_client";
import { byCountry } from "country-code-lookup";
import { computed, type PropType } from "vue";

import ResourceDetails from "./node_details_internals/ResourceDetails.vue";

export default {
  name: "TfNodeDetailsCard",
  components: { ResourceDetails },
  props: {
    node: { type: Object as PropType<NodeInfo>, required: true },
    appendDivider: { type: Boolean, default: () => false },
  },
  setup(props) {
    // console.log(props.node);

    const flag = computed(() => {
      const { country } = props.node.location;
      const code = byCountry(country)?.internet || byCountry(country.toLowerCase())?.internet;
      return code
        ? `https://www.worldatlas.com/r/w425/img/flag/${code.toLowerCase()}-flag.jpg`
        : `https://placehold.co/30x20`;
    });

    return { flag };
  },
};
</script>
