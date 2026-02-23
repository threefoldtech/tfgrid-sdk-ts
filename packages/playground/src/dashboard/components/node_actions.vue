<template>
  <span>
    <PublicConfig
      class="me-2"
      :node-id="nodeId"
      :farm-id="farmId"
      @remove-config="$emit('remove-config', $event)"
      @add-config="$emit('add-config', $event)"
    />
    <SetExtraFee class="me-2" :node-id="nodeId" :is-opted-out="isOptedOut" />
    <OptOutV3Billing class="me-2" :node-id="nodeId" :is-opted-out="isOptedOut" @opted-out="markOptedOut" />
  </span>
</template>

<script lang="ts">
import { ref, watch } from "vue";
import { useGrid } from "../../stores";
import OptOutV3Billing from "./opt_out_v3_billing.vue";
import PublicConfig from "./public_config.vue";
import SetExtraFee from "./set_extra_fee.vue";

export default {
  name: "NodeActions",
  components: { OptOutV3Billing, PublicConfig, SetExtraFee },
  props: { nodeId: { type: Number, required: true }, farmId: { type: Number, required: true } },
  emits: ["add-config", "remove-config"],
  setup(props) {
    const gridStore = useGrid();
    const isOptedOut = ref(false);
    async function fetchOptedOut() {
      if (!gridStore.grid) return;
      try {
        isOptedOut.value = await gridStore.grid.contracts.isNodeOptedOutOfV3Billing({ nodeId: props.nodeId });
      } catch {
        isOptedOut.value = false;
      }
    }
    function markOptedOut() {
      isOptedOut.value = true;
    }
    watch(() => props.nodeId, fetchOptedOut, { immediate: true });
    return { isOptedOut, markOptedOut };
  },
};
</script>
