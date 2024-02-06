<template>
  <card-details
    v-if="node.healthy"
    :iperf="true"
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

    function format(speed: number) {
      return formatResourceSize(speed) + "/s" || "-";
    }

    function isIPv4(ip: string) {
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      return ipv4Regex.test(ip);
    }

    const getNodeIPerfCard = async (): Promise<NodeDetailsCard[]> => {
      const res = await gridStore.grid.zos.getNodeIPerfTest({ nodeId: props.node.nodeId });
      const array = res.result
        .filter((node: any, i) => !node.error && i < 4 && node.download_speed && node.upload_speed)
        .map(node => ({
          name: node.test_type.toLocaleUpperCase(),
          type: isIPv4(node.node_ip) ? "IPv4" : "IPv6",
          downloadSpeed: format(node.download_speed),
          uploadSpeed: format(node.upload_speed),
        }));
      IperfDetails.value = array;
      return IperfDetails.value;
    };

    return {
      IperfDetails,
      loading,
    };
  },
};
</script>
