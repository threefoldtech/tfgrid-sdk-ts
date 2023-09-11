<template>
  <div class="pdf-viewer">
    <!-- Loading Spinner Component -->
    <div v-if="loadingPdf" class="flex justify-center items-center h-screen" role="status">
      <LoadingSpinnerComponent loading-message="Loading PDF File..." />
    </div>

    <!-- Error Alert Component -->
    <div v-else-if="isError" class="mt-4">
      <CustomAlertComponent :message="errorMessage" title="Response Error" :_type="alertType.error" />
    </div>

    <!-- PDF Viewer -->
    <div v-else class="view-pdf">
      <!-- PDF Viewer Container -->
      <div @scroll="onScroll" class="overflow-x-hidden w-95% mx-auto p-5" style="height: 85vh">
        <!-- Display PDF Pages -->
        <VuePdf v-for="page in numOfPages" :key="page" :src="pdfSrc" :page="page" class="pdf-page" />
        <div ref="bottomEl"></div>
      </div>

      <!-- Accept Button Section -->
      <div class="bg-black/10 text-black font-sans text-xl w-100 ml-16 mr-16 p-3 grid justify-center align-middle">
        Please scroll down to accept
        <svg
          class="w-full mt-2 mb-2 animate-bounce h-6 text-black"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>

        <!-- Accept Button -->
        <button
          @click="acceptPDF"
          type="button"
          :class="`${
            isAcceptDisabled ? 'opacity-50 cursor-not-allowed' : ''
          } bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`"
          :disabled="isAcceptDisabled"
        >
          <!-- Loading Spinner for Accept Button -->
          <LoadingSpinnerComponent v-if="loadingAcceptBtn" :is-btn="true" />
          <div v-if="responseData" class="">{{ responseData }}</div>
          {{ loadingAcceptBtn ? "" : "Accept" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import { createLoadingTask, VuePdf } from "vue3-pdfjs";
import { type VuePdfPropsType } from "vue3-pdfjs/components/vue-pdf/vue-pdf-props";

import { KeypairType } from "@/utils/sign";
import ThreefoldPDFSigner from "@/utils/threefoldPDFSignerScript";
import { AlertType, type ErrorType, type IThreefoldProvider } from "@/utils/types";

import ThreefoldConnector from "../utils/threefoldConnectorScript";
import CustomAlertComponent from "./CustomAlertComponent.vue";
import LoadingSpinnerComponent from "./LoadingSpinnerComponent.vue";

export default {
  name: "PDFSignerViewComponent",
  props: ["pdfurl", "dest", "network"],
  components: {
    VuePdf,
    CustomAlertComponent,
    LoadingSpinnerComponent,
  },
  setup(props) {
    const alertType = AlertType;

    const numOfPages = ref<number>(0);
    const loadingPdf = ref<boolean>(false);
    const isError = ref<boolean>(false);
    const errorMessage = ref<string>("");
    const pdfData = ref<string>("");
    const responseData = ref<string>("");
    const isAcceptDisabled = ref<boolean>(!import.meta.env.DEV);
    const loadingAcceptBtn = ref<boolean>(false);

    let provider: IThreefoldProvider = new ThreefoldPDFSigner();

    const pdfSrc = ref<VuePdfPropsType["src"]>(props.pdfurl);

    onMounted(async () => {
      loadingPdf.value = true;
      const IS_ENV_MNEMONIC = import.meta.env.VITE_MNEMONIC;

      if (!IS_ENV_MNEMONIC) {
        provider = new ThreefoldConnector();
      }

      const useProvider = await provider.use(props);
      if (useProvider.isError) {
        loadingPdf.value = false;
        return showError(useProvider);
      }

      const loadingTask = createLoadingTask(props.pdfurl);
      const pdf = await loadingTask.promise;
      const data = await pdf.getData();

      pdfData.value = data.toString();
      numOfPages.value = pdf.numPages;
      loadingPdf.value = false;
    });

    const acceptPDF = async () => {
      isAcceptDisabled.value = loadingAcceptBtn.value = true;
      const accepted = await provider.acceptAndSign(pdfData.value, KeypairType.ed25519);
      if (accepted.isError) {
        return showError(accepted);
      }
      loadingAcceptBtn.value = false;
    };

    const onScroll = (e: UIEvent) => {
      const target = e.target as HTMLElement;
      if (target.scrollTop + target.clientHeight >= target.scrollHeight) {
        if (!loadingAcceptBtn.value) {
          isAcceptDisabled.value = false;
        }
      }
    };

    const showError = (error: ErrorType): ErrorType => {
      isError.value = error.isError;
      errorMessage.value = error.errorMessage;
      return error;
    };

    return {
      isError,
      alertType,
      errorMessage,
      loadingPdf,
      numOfPages,
      pdfSrc,
      isAcceptDisabled,
      pdfData,
      loadingAcceptBtn,
      responseData,
      onScroll,
      acceptPDF,
    };
  },
};
</script>
