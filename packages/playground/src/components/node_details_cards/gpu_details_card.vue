<template>
  <card-details
    :is-list-items="true"
    :loading="loading"
    title="GPUs Details"
    :items="gpuFields"
    icon="mdi-credit-card-settings-outline"
  >
    <template #gpu-hint-message>
      <div v-if="cardsLength > 0" class="mb-3">
        <v-chip class="d-flex justify-center ma-4 mt-1" color="info">
          Select a GPU card ID from the below selection to load its data.
        </v-chip>
        <v-row class="bb-gray">
          <v-col class="ml-3 d-flex justify-start align-center">
            Card ID
            <v-chip class="ml-4" :color="selectedCard.contract ? 'warning' : 'primary'">
              {{ selectedCard.contract ? "Reserved" : "Available" }}
            </v-chip>
          </v-col>
          <v-col class="mr-3 d-flex justify-end align-center">
            <v-select
              chips
              density="compact"
              clearable
              hide-details="auto"
              v-model="cardId"
              :items="cardsIds"
              variant="outlined"
            />
            <v-icon class="ml-1" :icon="'mdi-content-copy'" @click="copy(cardId)" />
          </v-col>
        </v-row>
      </div>
      <div v-else>
        <v-card class="d-flex justify-center align-center">
          <div class="text-center">
            <v-icon variant="tonal" color="error" style="font-size: 50px" icon="mdi-close-circle-outline" />
            <p class="mt-4 mb-4 font-weight-bold text-error">
              {{ errorMessage }}
            </p>
            <v-btn :loading="loading" class="mr-4" @click="RerequestNode" text="Try Again" />
          </div>
        </v-card>
      </div>
    </template>
  </card-details>
</template>

<script lang="ts">
import type { GPUCard, GridNode } from "@threefold/gridproxy_client";
import { onMounted, type PropType, ref } from "vue";
import { watch } from "vue";

import type { NodeDetailsCard } from "@/types";
import type { GridProxyRequestConfig } from "@/types";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { getNode } from "@/utils/get_nodes";

import CardDetails from "./card_details.vue";

export default {
  name: "GPUDetailsCard",
  components: { CardDetails },
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
    nodeOptions: {
      type: Object as PropType<GridProxyRequestConfig>,
      required: false,
    },
  },

  setup(props) {
    const loading = ref<boolean>(false);
    const gpuFields = ref<NodeDetailsCard[]>([]);
    const cardsIds = ref<string[]>([]);
    const cardId = ref<string>("");
    const selectedCard = ref<GPUCard>(props.node.cards[0]);
    const isError = ref<boolean>(false);
    const errorMessage = ref<string>("");
    const node = ref(props.node);
    const nodeOptions = ref(props.nodeOptions);
    const cardsLength = ref(0);

    watch(cardId, newCardId => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      selectedCard.value = node.value.cards.find(card => card.id === newCardId)!;
      gpuFields.value = getNodeTwinDetailsCard();
    });

    const mount = () => {
      loading.value = true;
      if (node.value.cards?.length > 0) {
        cardsLength.value = node.value.cards?.length;
        selectedCard.value = node.value.cards[0];
        node.value.cards.map((card: GPUCard) => {
          cardsIds.value.push(card.id);
        });
        cardId.value = cardsIds.value[0];
        gpuFields.value = getNodeTwinDetailsCard();
        isError.value = false;
        errorMessage.value = ``;
      } else {
        isError.value = true;
        errorMessage.value = `Failed to load node with ID ${node.value.nodeId}. The node might be offline or unresponsive. You can try requesting it again.`;
      }
      loading.value = false;
    };

    onMounted(mount);

    async function RerequestNode() {
      if (node.value.nodeId > 0 && nodeOptions.value) {
        loading.value = true;
        nodeOptions.value.loadGpu = true;
        try {
          const _node: GridNode = await getNode(node.value.nodeId, nodeOptions.value);
          node.value = _node;
          loading.value = false;
          mount();
        } catch (_) {
          isError.value = true;
          errorMessage.value = `Failed to load node with ID ${node.value.nodeId}. The node might be offline or unresponsive. You can try requesting it again.`;
        } finally {
          loading.value = false;
        }
      } else {
        loading.value = true;
        setTimeout(() => {
          loading.value = false;
        }, 3000);
      }
    }
    const copy = (value: string) => {
      navigator.clipboard.writeText(value);
      createCustomToast("Copied!", ToastType.success);
    };

    const getNodeTwinDetailsCard = (): NodeDetailsCard[] => {
      return [
        {
          name: "Vendor",
          value: selectedCard.value.vendor,
          hint: selectedCard.value.vendor,
        },
        {
          name: "Device",
          value: selectedCard.value.device,
          hint: selectedCard.value.device,
        },
        {
          name: "Contract ID",
          value: selectedCard.value.contract === 0 ? "N/A" : selectedCard.value.contract.toString(),
        },
      ];
    };

    return {
      gpuFields,
      loading,
      cardsIds,
      cardId,
      selectedCard,
      isError,
      errorMessage,
      cardsLength,
      copy,
      RerequestNode,
    };
  },
};
</script>

<style scoped>
.bb-gray {
  border-bottom: 1px solid gray;
}
</style>
