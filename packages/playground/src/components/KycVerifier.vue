<template>
  <v-dialog
    fullscreen
    :model-value="moduleValue"
    @update:model-value="handleUpdateDialog($event)"
    width="100%"
    class="w-100 h-100 d-flex justify-center align-center"
  >
    <v-card v-if="loading || !token" class="d-flex justify-center align-center h-screen">
      <div class="d-flex my-6 align-center justify-center">
        <v-progress-circular indeterminate />
      </div>
      <p>Connecting to a verification service</p>
    </v-card>

    <iframe
      id="iframe"
      allowfullscreen
      style="width: 100%; height: 100%; border: none"
      :src="`https://ui.idenfy.com/?authToken=${token}`"
      allow="camera"
    />
  </v-dialog>
</template>
<script lang="ts">
import { KycStatus } from "@threefold/grid_client";
import { onMounted, ref } from "vue";

import { useKYC } from "@/stores/kyc";
import { createCustomToast, ToastType } from "@/utils/custom_toast";

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
    const kyc = useKYC();
    const token = ref("");
    const loading = ref(false);
    const handleUpdateDialog = (event: boolean) => {
      emit("update:moduleValue", event);
    };

    const getToken = async () => {
      loading.value = true;
      await kyc.updateStatus();
      if (kyc.status == KycStatus.verified) {
        createCustomToast("Already verified", ToastType.info);
        handleUpdateDialog(false);
        return;
      }
      try {
        if (!kyc.client) throw new Error("KYC client is not initialized");
        token.value = await kyc.client.getToken();
      } catch (e) {
        handleUpdateDialog(false);
        const message = "Failed to get authentication token";
        createCustomToast(`${message}, Please try again later`, ToastType.danger);
        console.error(message, e);
      } finally {
        loading.value = false;
      }
    };

    const handleReceiveMessage = (event: MessageEvent) => {
      handleUpdateDialog(false); // close the dialog
      if (!event.data.status) console.error("Can't check the verification status", event.data);
      const status = (event.data.status as string).toLowerCase();
      if (status === "approved") {
        createCustomToast("Verification completed, Changes may take a few minutes to reflect", ToastType.success);
        kyc.updateStatus();
      } else if (status === "failed") createCustomToast("Verification failed, Please try again", ToastType.danger);
      else if (status === "unverified") createCustomToast("Verification canceled", ToastType.info);
    };
    window.addEventListener("message", handleReceiveMessage, false);
    onMounted(getToken);
    return {
      handleUpdateDialog,
      loading,
      token,
    };
  },
};
</script>
