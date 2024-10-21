<template>
  <v-dialog
    fullscreen
    :model-value="moduleValue"
    @update:model-value="handleUpdateDialog($event)"
    width="100%"
    class="w-100 h-100 d-flex justify-center align-center"
  >
    <v-card v-if="loading" class="d-flex justify-center align-center h-screen">
      <div class="d-flex my-6 align-center justify-center">
        <v-progress-circular indeterminate />
      </div>
      <p>Connecting to a verification service</p>
    </v-card>

    <iframe
      id="iframe"
      v-if="token"
      allowfullscreen
      style="width: 100%; height: 100%; border: none"
      :src="`https://ui.idenfy.com/?authToken=${token}`"
      allow="camera"
    />
  </v-dialog>
</template>
<script lang="ts">
import { KYC } from "@threefold/grid_client";
import { onMounted, ref } from "vue";

import { useGrid } from "@/stores";

export default {
  name: "KycVerifier",
  props: {
    moduleValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:moduleValue"],
  setup(props, { emit }) {
    const gridStore = useGrid();
    const token = ref("");
    const loading = ref(false);
    const handleUpdateDialog = (event: boolean) => {
      emit("update:moduleValue", event);
    };

    const getToken = async () => {
      const KycVerifier = new KYC(
        "kyc1.gent01.dev.grid.tf",
        gridStore.client._mnemonic,
        gridStore.client.clientOptions.keypairType,
      );
      try {
        token.value = await KycVerifier.getToken();
      } catch (e) {
        console.log(e, "error");
      }
    };

    onMounted(getToken);
    return {
      handleUpdateDialog,
      loading,
      token,
    };
  },
};
</script>
