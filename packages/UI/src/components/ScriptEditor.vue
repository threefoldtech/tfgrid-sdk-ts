<template>
  <div>
    <!-- Error Alert Component -->
    <div v-if="isError" class="mt-4">
      <custom-alert-component :message="errorMessage" title="Response Error" :_type="alertOptions.error" />
    </div>
    <form class="container mx-auto" @submit.prevent="submitScript">
      <div class="font-sans hover:font-sans flex my-4 text-lg relative">
        <div class="line-numbers w-10 bg-gray-50 dark:bg-gray-700 text-white text-center py-4">
          <div v-for="(line, index) in lines" :key="index">{{ index + 1 }}</div>
        </div>
        <div class="flex-1">
          <textarea
            rows="8"
            class="w-full h-full p-4 outline-none resize-none dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
            placeholder="Write your script..."
            required
            v-model="text"
            @input="updateLines"
          ></textarea>
        </div>
        <button type="button" class="absolute right-4 top-4" @click="copyToClipboard" title="Copy to Clipboard">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
              fill="#ffffff"
            />
          </svg>
        </button>
      </div>
      <div style="display: flex; justify-content: flex-end">
        <button
          type="submit"
          class="font-sans hover:font-sans inline-flex px-5 py-2.5 text-center text-white bg-sky-700 rounded focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
        >
          Submit Script
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";

import { KeypairType } from "../utils/sign";
import ThreefoldConnector from "../utils/threefoldConnectorProvider";
import ThreefoldPDFSigner from "../utils/threefoldSignerProvider";
import { AlertOptions, type ErrorType, type ThreefoldProvider } from "../utils/types";
import CustomAlertComponent from "./CustomAlertComponent.vue";

export default {
  name: "ScriptEditor",
  props: ["dest", "network"],
  components: {
    CustomAlertComponent,
  },
  setup(props) {
    const alertOptions = AlertOptions;
    const text = ref(""); // Store the textarea content
    const lines = ref(["1"]); // Store lines for line numbers
    const isError = ref<boolean>(false);
    const errorMessage = ref();
    let provider: ThreefoldProvider = new ThreefoldPDFSigner();

    onMounted(async () => {
      const IS_ENV_MNEMONIC = import.meta.env.VITE_MNEMONIC;

      if (!IS_ENV_MNEMONIC) {
        provider = new ThreefoldConnector();
      }

      const useProvider = await provider.use(props);
      if (useProvider.isError) {
        return showError(useProvider);
      }
    });

    const showError = (error: ErrorType): ErrorType => {
      errorMessage.value = error.errorMessage;
      return error;
    };

    const copyToClipboard = () => {
      navigator.clipboard.writeText(text.value || "");
    };
    // Function to update lines when textarea input changes
    const updateLines = () => {
      const newText = text.value;
      const newLines = newText.split("\n");
      lines.value = newLines;
    };

    const submitScript = async () => {
      try {
        await provider.acceptAndSign({
          scriptContent: text.value,
          keypairType: KeypairType.sr25519,
        });
      } catch (error: any) {
        showError({ isError: true, errorMessage: error.message });
      }
    };

    return {
      text,
      alertOptions,
      lines,
      errorMessage,
      isError,
      copyToClipboard,
      updateLines,
      submitScript,
    };
  },
};
</script>
