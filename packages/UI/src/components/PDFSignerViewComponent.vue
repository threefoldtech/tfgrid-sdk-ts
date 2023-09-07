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
          @click="accept"
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
import axios from "axios";
import { type Account, ThreefoldWalletConnectorApi } from "tf-wallet-connector-api";
import { onMounted, ref } from "vue";
import { createLoadingTask, VuePdf } from "vue3-pdfjs";
import { type VuePdfPropsType } from "vue3-pdfjs/components/vue-pdf/vue-pdf-props";

import { KeypairType, sign, type SignReturn } from "@/utils/sign";
import { AlertType, type PDFPostData } from "@/utils/types";

import CustomAlertComponent from "./CustomAlertComponent.vue";
import LoadingSpinnerComponent from "./LoadingSpinnerComponent.vue";

export default {
  name: "PDFSignerViewComponent",
  props: ["pdfurl", "dest"],
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
    const isAcceptDisabled = ref<boolean>(true);
    const loadingAcceptBtn = ref<boolean>(false);
    const hasAccess = ref<boolean>(true);
    const isInstalled = ref<boolean>(true);

    const pdfSrc = ref<VuePdfPropsType["src"]>(props.pdfurl);

    onMounted(async () => {
      loadingPdf.value = true;

      try {
        if (!props.pdfurl) {
          showError("The 'pdfurl' property is missing and is required.");
          return;
        } else if (!props.dest) {
          showError("The 'dest' property is missing and is required.");
          return;
        }

        await checkExtensionInstalled();
        await checkExtensionAccess();

        if (!hasAccess.value || !isInstalled.value) {
          showError("Please make sure you have installed/linked the Threefold Connector extension.");
          return;
        }

        const loadingTask = createLoadingTask(props.pdfurl);
        const pdf = await loadingTask.promise;
        const data = await pdf.getData();
        pdfData.value = data.toString();
        numOfPages.value = pdf.numPages;
      } catch (error: any) {
        showError(
          `An error occurred while loading the PDF: ${error.message}` || "An error occurred while loading the PDF.",
        );
      } finally {
        loadingPdf.value = false;
      }
    });

    const checkExtensionAccess = async () => {
      try {
        await ThreefoldWalletConnectorApi.hasAccess();
      } catch (error) {
        console.error(error);
        hasAccess.value = false;
      }
    };

    const checkExtensionInstalled = async () => {
      try {
        await ThreefoldWalletConnectorApi.isInstalled();
      } catch (error) {
        console.error(error);
        isInstalled.value = false;
      }
    };

    const request = async (account: Account | null, data: SignReturn) => {
      if (account) {
        const requestBody: PDFPostData = {
          twinid: account?.twinId,
          pdfUrl: props.pdfurl,
          pubkey: data.publicKey,
          signature: data.signature,
        };

        try {
          const response = await axios.post(props.dest, requestBody);
          responseData.value = String(response.status);
          console.log(response);
        } catch (error: any) {
          console.log(error);
          showError(error.message);
        }
      } else {
        showError(
          "Failed to load account. Make sure you have installed the ThreeFold Connector extension and activated an account.",
        );
      }
    };

    const accept = async () => {
      isAcceptDisabled.value = loadingAcceptBtn.value = true;

      if (pdfData.value) {
        if (!hasAccess.value) {
          hasAccess.value = await ThreefoldWalletConnectorApi.requestAccess();
        }

        const account = await ThreefoldWalletConnectorApi.selectDecryptedAccount();
        const data = await sign(pdfData.value, account?.mnemonic ?? "", KeypairType.ed25519);

        if (!data.publicKey || !data.signature) {
          showError("Unexpected signing signature.");
          return;
        }

        await request(account, data);
      } else {
        showError("Cannot read the data from the provided PDF.");
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

    const showError = (message: string) => {
      isError.value = true;
      errorMessage.value = message;
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
      accept,
    };
  },
};
</script>
