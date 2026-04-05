<template>
  <div class="border px-4 pb-4 rounded position-relative">
    <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-account-switch-outline</v-icon>
      <v-card-title class="pa-0">Transfer Twin Ownership</v-card-title>
    </v-card>

    <!-- Intro / Confirmation step -->
    <v-card v-if="step === Steps.Confirm" class="pa-5 my-5" flat>
      <v-alert type="warning" variant="tonal" class="mb-4">
        <p class="font-weight-bold mb-2">This will transfer your twin identity to a newly created, secure account.</p>
        <p class="mb-2">The process involves the following steps:</p>
        <ol class="ml-4">
          <li>A new account is created and you accept the Terms & Conditions.</li>
          <li>You securely back up the new mnemonic (seed phrase).</li>
          <li>A transfer request is submitted from your current account.</li>
          <li>The transfer is accepted using the new account.</li>
        </ol>
        <p class="mt-3">
          <strong>Important:</strong> Your existing contracts, farms, and resources associated with this twin will be
          transferred to the new account. All reserved balance will also be moved. After the transfer, you must use the
          new mnemonic to log in.
        </p>
      </v-alert>
      <v-card-actions class="justify-end">
        <v-btn color="secondary" :loading="loading" @click="startTransfer"> Start Transfer </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Step: Show mnemonic and back it up -->
    <v-card v-if="step === Steps.BackupMnemonic" class="pa-5 my-5" flat>
      <v-alert type="info" variant="tonal" class="mb-4">
        <p class="font-weight-bold mb-2">Back up your new mnemonic</p>
        <p>
          Write down or securely store the mnemonic below. This is the
          <strong>only way</strong> to access your new account. Losing it means
          <strong>permanent loss of access</strong> to your twin and all associated resources.
        </p>
      </v-alert>

      <v-textarea :model-value="newMnemonic" label="New Mnemonic" readonly rows="3" variant="outlined" class="mb-2">
        <template #append-inner>
          <v-icon
            class="cursor-pointer"
            :icon="mnemonicCopied ? 'mdi-check' : 'mdi-content-copy'"
            @click="copyMnemonic"
          />
        </template>
      </v-textarea>

      <v-checkbox v-model="mnemonicBackedUp" label="I have securely backed up my new mnemonic" color="secondary" />

      <v-card-actions class="justify-end">
        <v-btn color="secondary" :disabled="!mnemonicBackedUp" :loading="loading" @click="executeTransfer">
          Continue Transfer
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Step: Transfer in progress -->
    <v-card v-if="step === Steps.Processing" class="pa-5 my-5" flat>
      <div class="d-flex flex-column align-center">
        <v-progress-circular indeterminate color="secondary" size="64" class="mb-4" />
        <p class="text-h6 mb-2">Processing Transfer</p>
        <p class="text-body-2 text-medium-emphasis">{{ processingMessage }}</p>
      </div>
    </v-card>

    <!-- Step: Success -->
    <v-card v-if="step === Steps.Success" class="pa-5 my-5" flat>
      <v-alert type="success" variant="tonal" class="mb-4">
        <p class="font-weight-bold mb-2">Twin ownership transferred successfully!</p>
        <p>
          Your twin (ID: {{ profile?.twinId }}) has been transferred to the new account. You must now log in with the
          new mnemonic to continue using the dashboard.
        </p>
      </v-alert>

      <v-textarea :model-value="newMnemonic" label="New Mnemonic (save it!)" readonly rows="3" variant="outlined">
        <template #append-inner>
          <v-icon
            class="cursor-pointer"
            :icon="mnemonicCopied ? 'mdi-check' : 'mdi-content-copy'"
            @click="copyMnemonic"
          />
        </template>
      </v-textarea>

      <v-alert type="info" variant="tonal" class="mb-4">
        Please note that deploying new workloads or listing existing deployments may be temporarily unavailable for up
        to 1 hour while the network propagates the ownership change.
      </v-alert>

      <v-card-actions class="justify-end">
        <v-btn color="secondary" @click="logout"> Logout & Re-login </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Step: Error -->
    <v-card v-if="step === Steps.Error" class="pa-5 my-5" flat>
      <v-alert type="error" variant="tonal" class="mb-4">
        <p class="font-weight-bold mb-2">Transfer Failed</p>
        <p>{{ errorMessage }}</p>
      </v-alert>
      <v-card-actions class="justify-end">
        <v-btn color="anchor" @click="reset"> Try Again </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { Client as TFChainClient } from "@threefold/tfchain_client";
import axios from "axios";
import { generateMnemonic } from "bip39";
import md5 from "crypto-js/md5";
import { ref } from "vue";

import { useGrid, useProfileManager } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { normalizeError } from "../utils/helpers";

const TC_DOCUMENT_LINK =
  "https://raw.githubusercontent.com/threefoldtech/info_grid/development/labs/docs/knowledge_base/terms_conditions_all3/terms_conditions_all3.md";

enum Steps {
  Confirm,
  BackupMnemonic,
  Processing,
  Success,
  Error,
}

const profileManager = useProfileManager();
const gridStore = useGrid();
const profile = ref(profileManager.profile!);

const step = ref(Steps.Confirm);
const loading = ref(false);
const newMnemonic = ref("");
const newAccountAddress = ref("");
const mnemonicBackedUp = ref(false);
const mnemonicCopied = ref(false);
const processingMessage = ref("");
const errorMessage = ref("");

function reset() {
  step.value = Steps.Confirm;
  loading.value = false;
  newMnemonic.value = "";
  newAccountAddress.value = "";
  mnemonicBackedUp.value = false;
  mnemonicCopied.value = false;
  processingMessage.value = "";
  errorMessage.value = "";
}

async function copyMnemonic() {
  try {
    await navigator.clipboard.writeText(newMnemonic.value);
    mnemonicCopied.value = true;
    setTimeout(() => (mnemonicCopied.value = false), 3000);
  } catch {
    // fallback - the textarea is already selectable
  }
}

async function startTransfer() {
  loading.value = true;
  try {
    // Step 1: Generate new mnemonic
    const mnemonic = generateMnemonic();
    newMnemonic.value = mnemonic;

    // Step 2: Activate the new account (fund it via activation service)
    const newClient = new TFChainClient({
      url: window.env.SUBSTRATE_URL,
      mnemonicOrSecret: mnemonic,
      keypairType: profile.value.keypairType || "sr25519",
    });
    await newClient.connect();
    newAccountAddress.value = newClient.address;

    // Fund the account via activation service
    await axios.post(window.env.ACTIVATION_SERVICE_URL, {
      substrateAccountID: newClient.address,
    });

    // Wait for balance to arrive
    const start = Date.now();
    let balance = await newClient.balances.getMyBalance();
    while (Date.now() < start + 15000) {
      balance = await newClient.balances.getMyBalance();
      if (balance.free > 0) break;
      await new Promise(f => setTimeout(f, 1000));
    }
    if (balance.free <= 0) {
      await newClient.disconnect();
      throw new Error("Couldn't activate the new account. Please try again later.");
    }

    // Step 3: Accept Terms & Conditions with new account (do NOT create a twin)
    const tcDocument = await axios.get(TC_DOCUMENT_LINK);
    const documentHash = md5(tcDocument.data).toString();
    await (
      await newClient.termsAndConditions.accept({
        documentLink: TC_DOCUMENT_LINK,
        documentHash,
      })
    ).apply();

    await newClient.disconnect();

    // Move to mnemonic backup step
    step.value = Steps.BackupMnemonic;
  } catch (e) {
    errorMessage.value = normalizeError(e, "Failed to create and prepare the new account.");
    step.value = Steps.Error;
  } finally {
    loading.value = false;
  }
}

async function executeTransfer() {
  loading.value = true;
  step.value = Steps.Processing;

  let newClient: TFChainClient | null = null;

  try {
    // Step 4: Cancel any existing pending transfer, then request a new one
    const currentGrid = gridStore.grid;
    if (!currentGrid) throw new Error("Grid client not available. Please re-login.");

    processingMessage.value = "Checking for existing pending transfer requests...";
    const pendingRequestId = await currentGrid.tfclient.twins.getPendingTransferByTwin({ id: profile.value.twinId });
    if (pendingRequestId) {
      processingMessage.value = "Cancelling existing transfer request...";
      await (await currentGrid.tfclient.twins.cancelTransfer({ requestId: pendingRequestId })).apply();
    }

    processingMessage.value = "Submitting transfer request from current account...";
    const requestExtrinsic = await currentGrid.tfclient.twins.requestTransfer({
      newAccount: newAccountAddress.value,
    });
    const requestResult = await requestExtrinsic.apply();
    const requestId = requestResult.requestId;

    // Step 5: Accept transfer using new identity
    processingMessage.value = "Accepting transfer with new account...";
    newClient = new TFChainClient({
      url: window.env.SUBSTRATE_URL,
      mnemonicOrSecret: newMnemonic.value,
      keypairType: profile.value.keypairType || "sr25519",
    });
    await newClient.connect();
    await new Promise(f => setTimeout(f, 10000));
    await (await newClient.twins.acceptTransfer({ requestId })).apply();
    await newClient.disconnect();
    newClient = null;

    // Step 6: Success
    step.value = Steps.Success;
    createCustomToast("Twin ownership transferred successfully!", ToastType.success);
  } catch (e) {
    if (newClient) {
      try {
        await newClient.disconnect();
      } catch {
        // ignore disconnect error
      }
    }
    errorMessage.value = normalizeError(e, "Transfer failed. Your twin remains on the original account.");
    step.value = Steps.Error;
  } finally {
    loading.value = false;
  }
}

function logout() {
  profileManager.clear();
  window.location.reload();
}
</script>
