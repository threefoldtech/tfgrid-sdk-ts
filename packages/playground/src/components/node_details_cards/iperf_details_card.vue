<template>
  <card-details
    :iperf="true"
    :loading="loading"
    title="Network Speed Test"
    :items="IperfDetails"
    icon="mdi-speedometer"
    :error="errorMessage"
  />
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/types";

import { gridProxyClient } from "../../clients";
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
    const loading = ref<boolean>(false);
    const IperfDetails = ref<NodeDetailsCard[]>();
    const errorMessage = ref("");
    onMounted(async () => {
      if (props.node.healthy) {
        errorMessage.value = "";
        try {
          loading.value = true;
          await getNodeIPerfCard();
        } catch (error) {
          console.log(error);
          errorMessage.value = "Failed to load IPerf details. Please try again later.";
        } finally {
          loading.value = false;
        }
      }
    });

    function format(speed: number) {
      return formatResourceSize(speed, true).toLocaleLowerCase() + "ps" || "-";
    }

    const getNodeIPerfCard = async (): Promise<NodeDetailsCard[]> => {
      const { speed } = await gridProxyClient.nodes.byId(props.node.nodeId);
      const upload = format(speed.upload);
      const download = format(speed.download);
      IperfDetails.value = [
        {
          name: "Speed",
          uploadSpeed: upload,
          downloadSpeed: download,
        },
      ];
      return IperfDetails.value;
    };

    return {
      IperfDetails,
      loading,
      errorMessage,
    };
  },
};
</script>
