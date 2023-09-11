<template>
  <div>
    <div v-if="!(isInstalled && hasAccess)">
      <CustomAlertComponent
        message="Please make sure to install the TF Wallet extention and give access to the website before submitting the script."
        title="Be Warned"
        :_type="alertType.warning"
      />
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
import axios from "axios";
import { ThreefoldWalletConnectorApi } from "tf-wallet-connector-api";
import { onMounted, ref } from "vue";

import { KeypairType, sign } from "../utils/sign";
import { AlertType } from "../utils/types";
import CustomAlertComponent from "./CustomAlertComponent.vue";

export default {
  name: "ScriptEditor",
  props: ["dest", "network"],
  components: {
    CustomAlertComponent,
  },
  setup(props) {
    const alertType = AlertType;
    const text = ref(""); // Store the textarea content
    const lines = ref(["1"]); // Store lines for line numbers
    const isInstalled = ref();
    const hasAccess = ref();
    onMounted(async () => {
      isInstalled.value = await ThreefoldWalletConnectorApi.isInstalled();
      hasAccess.value = await ThreefoldWalletConnectorApi.hasAccess();
    });

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
        const account = await ThreefoldWalletConnectorApi.selectDecryptedAccount(props.network || "main");
        const { signature, publicKey } = await sign(text.value, account?.mnemonic ?? "", KeypairType.sr25519);
        const response = axios.post(props.dest, {
          content: text.value,
          signature,
          pubkey: publicKey,
          twinid: account?.metadata.twinId,
        });
        console.log(response);
      } catch (error) {
        console.log(error);
        throw new Error("Something went wrong while submitting the script.");
      }
    };

    return {
      isInstalled,
      hasAccess,
      text,
      alertType,
      lines,
      copyToClipboard,
      updateLines,
      submitScript,
    };
  },
};
</script>
