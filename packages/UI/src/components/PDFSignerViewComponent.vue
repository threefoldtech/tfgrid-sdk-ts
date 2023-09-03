<template>
  <div class="pdf-viewer">
    <div class="flex justify-center items-center h-screen" role="status" v-if="loadingPdf">
      <svg
        aria-hidden="true"
        class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span class="text-black text-center">Loading PDF File...</span>
    </div>
    <div v-else-if="isError">
      <div class="loading text-red-600">Error: {{ errorMessage }}</div>
    </div>
    <div v-else class="view-pdf">
      <div @scroll="onScroll" class="overflow-x-hidden w-95% mx-auto p-5" style="height: 85vh">
        <VuePdf v-for="page in numOfPages" :key="page" :src="pdfSrc" :page="page" class="pdf-page" />
        <div ref="bottomEl"></div>
      </div>
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
        <button
          @click="accept"
          type="button"
          :class="`${
            isAcceptDisabled ? 'opacity-50 cursor-not-allowed' : ''
          } bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`"
          :disabled="isAcceptDisabled"
        >
          <svg
            v-if="loadingAcceptBtn"
            aria-hidden="true"
            role="status"
            class="m-auto h-6 flex justify-center items-center text-white animate-spin"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="#E5E7EB"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentColor"
            />
          </svg>
          {{ loadingAcceptBtn ? "" : "Accept" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Keyring } from "@polkadot/keyring";
import { waitReady } from "@polkadot/wasm-crypto";
import { Buffer } from "buffer";
import MD5 from "crypto-js/md5";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { onMounted, ref } from "vue";
import { createLoadingTask, VuePdf } from "vue3-pdfjs";
import { type VuePdfPropsType } from "vue3-pdfjs/components/vue-pdf/vue-pdf-props"; // Prop type definitions can also be imported

const props = defineProps<{ pdfUrl: string }>();

const numOfPages = ref(0);
const loadingPdf = ref(false);
const isError = ref(false);
const errorMessage = ref("");
const pdfData = ref<Uint8Array>();
const isAcceptDisabled = ref(true);
const loadingAcceptBtn = ref(false);

const pdfSrc = ref<VuePdfPropsType["src"]>(props.pdfUrl);

const onScroll = (e: UIEvent) => {
  const target = e.target as HTMLElement;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight) {
    if (!loadingAcceptBtn.value) {
      isAcceptDisabled.value = false;
    }
    console.log(isAcceptDisabled);
  }
};

const accept = async () => {
  isAcceptDisabled.value = loadingAcceptBtn.value = true;
  if (pdfData.value) {
    const data = await sign(pdfData.value);
    console.log("Accepted", data);
  } else {
    isError.value = true;
    errorMessage.value = "Cannot read the data from the provided PDF.";
  }
};

onMounted(async () => {
  loadingPdf.value = true;
  try {
    const loadingTask = createLoadingTask(props.pdfUrl);
    const pdf: PDFDocumentProxy = await loadingTask.promise;
    const data = await pdf.getData();
    pdfData.value = data;
    numOfPages.value = pdf.numPages;
  } catch (error: any) {
    errorMessage.value =
      `An error occurred while loading the PDF: ${error.message}` || "An error occurred while loading the PDF.";
    console.error(error);
  } finally {
    loadingPdf.value = false; // Set loading to false when PDF is loaded or errored
  }
});

const sign = async (content: Uint8Array): Promise<string> => {
  const mnemonics = "actual reveal dish guilt inner film scheme between lonely myself material replace";
  const hash = MD5(content.toString());
  const message_bytes = Uint8Array.from(Buffer.from(hash.toString(), "hex"));
  const keyr = new Keyring({ type: "ed25519" });
  const key = keyr.addFromMnemonic(mnemonics);
  await waitReady();
  const signed = key.sign(message_bytes);
  return Buffer.from(signed).toString("hex");
};
</script>

<script lang="ts">
export default {
  name: "PDFSignerViewComponent",
};
</script>
