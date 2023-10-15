<template>
  <card-details
    :isMap="true"
    :loading="loading"
    title="Location Details"
    :items="locationFields"
    icon="mdi-google-maps"
    :node="$props.node"
  />
</template>

<script lang="ts">
// TODO: Update the map location...
import type { GridNode } from "@threefold/gridproxy_client";
import { type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/explorer/utils/types";

import CardDetails from "./card_details.vue";

export default {
  name: "LocationDetailsCard",
  components: { CardDetails },
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
  },

  setup() {
    const loading = ref<boolean>(false);
    const locationFields = ref<NodeDetailsCard[]>();

    return {
      locationFields,
      loading,
    };
  },
};
</script>
