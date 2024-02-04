<template>
  <card-details
    v-if="node.healthy"
    :loading="loading"
    title="Network Speed Test"
    :items="IperfDetails"
    icon="mdi-speedometer"
  />
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/types";
import { createCustomToast, ToastType } from "@/utils/custom_toast";

import { useGrid } from "../../stores";
import formatResourceSize from "../../utils/format_resource_size";
import CardDetails from "./card_details.vue";

export default {
  name: "IPerfCard",
  components: { CardDetails },
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
  },

  setup(props) {
    const gridStore = useGrid();
    const loading = ref<boolean>(false);
    const IperfDetails = ref<NodeDetailsCard[]>();

    onMounted(async () => {
      if (props.node.healthy) {
        try {
          loading.value = true;
          await getNodeIPerfCard();
        } catch (error) {
          createCustomToast("Failed to load IPerf details. Please try again later.", ToastType.danger);
        } finally {
          loading.value = false;
        }
      }
    });

    const getNodeIPerfCard = async (): Promise<NodeDetailsCard[]> => {
      const res = await gridStore.grid.zos.getNodeIPerfTest({ nodeId: props.node.nodeId });
      const { download_speed, upload_speed } = res.result[0];
      IperfDetails.value = [
        { name: "Download Speed", value: formatResourceSize(download_speed) || "-" },
        { name: "Upload Speed", value: formatResourceSize(upload_speed) || "-" },
      ];
      return IperfDetails.value;
    };

    return {
      IperfDetails,
      loading,
    };
  },
};
</script>
