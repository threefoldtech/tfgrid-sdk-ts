<template>
  <v-card>
    <v-alert v-if="hasEnoughBalance" type="info" variant="tonal" class="ma-4">
      Updating or generating SSH key will cost you up to 0.01 TFT
    </v-alert>
    <v-alert v-else-if="balance" type="warning" variant="tonal" class="ma-4">
      Your balance is not enough to {{ profileManager.profile?.ssh ? "update the" : `generate a` }} SSH key. Please make
      sure you have at least 0.01 TFT.
    </v-alert>
    <VTooltip
      text="SSH Keys are used to authenticate you to the deployment instance for management purposes. If you don't have an SSH Key or are not familiar, we can generate one for you."
      location="top right"
      max-width="600px"
    >
      <template #activator="{ props }">
        <CopyInputWrapper :data="profileManager.profile?.ssh" #="{ props: copyInputProps }">
          <VTextarea
            class="mx-4"
            label="Public SSH Key"
            no-resize
            :spellcheck="false"
            v-model.trim="ssh"
            v-bind="{ ...props, ...copyInputProps }"
            :readonly="!hasEnoughBalance"
            :disabled="updatingSSH || generatingSSH"
            :hint="
              updatingSSH
                ? 'Updating your public ssh key.'
                : generatingSSH
                ? 'Generating a new public ssh key.'
                : SSHKeyHint
            "
            :persistent-hint="updatingSSH || generatingSSH || !!SSHKeyHint"
            :rules="sshRules(ssh)"
          />
        </CopyInputWrapper>

        <div class="d-flex justify-end mb-5 mx-4">
          <VBtn
            class="mr-2 text-subtitle-2"
            color="secondary"
            variant="outlined"
            :disabled="!!ssh || updatingSSH || generatingSSH || !hasEnoughBalance"
            :loading="generatingSSH"
            @click="generateSSH"
          >
            Generate SSH Keys
          </VBtn>
          <VBtn
            class="text-subtitle-2"
            color="secondary"
            variant="outlined"
            @click="updateSSH"
            :disabled="!ssh || profileManager.profile?.ssh === ssh || updatingSSH || !hasEnoughBalance"
            :loading="updatingSSH"
          >
            Update Public SSH Key
          </VBtn>
        </div>
      </template>
    </VTooltip>
  </v-card>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import { computed } from "vue";
import { generateKeyPair } from "web-ssh-keygen";

import { isValidSSHKey } from "@/utils/validators";

import { useProfileManager } from "../stores";
import type { Profile } from "../stores/profile_manager";
import { type Balance, getGrid, loadBalance, storeSSH } from "../utils/grid";
import { downloadAsFile } from "../utils/helpers";
import { isEnoughBalance } from "../utils/helpers";

const balance = ref<Balance>();
const SSHKeyHint = ref("");
const generatingSSH = ref(false);
const profileManager = useProfileManager();
const ssh = ref(profileManager.profile!.ssh);
const updatingSSH = ref(false);
const loadingBalance = ref(false);

const hasEnoughBalance = computed(() => isEnoughBalance(balance.value, 0.01));
let interval: any;

async function __loadBalance(profile?: Profile, tries = 1) {
  profile = profile || profileManager.profile!;
  if (!profile) return;

  try {
    loadingBalance.value = true;
    const grid = await getGrid(profile);
    balance.value = await loadBalance(grid!);
    loadingBalance.value = false;
  } catch {
    if (tries > 10) {
      loadingBalance.value = false;
      return;
    }

    setTimeout(() => __loadBalance(profile, tries + 1), Math.floor(Math.exp(tries) * 1_000));
  }
}
watch(
  () => profileManager.profile,
  profile => {
    if (profile) {
      __loadBalance(profile);
      if (interval) clearInterval(interval);
      interval = setInterval(__loadBalance.bind(undefined, profile), 1000 * 60 * 2);
    } else {
      if (interval) clearInterval(interval);
      balance.value = undefined;
    }
  },
  { immediate: true, deep: true },
);
async function updateSSH() {
  updatingSSH.value = true;
  const grid = await getGrid(profileManager.profile!);
  await storeSSH(grid!, ssh.value);
  profileManager.updateSSH(ssh.value);
  updatingSSH.value = false;
  SSHKeyHint.value = "SSH key updated successfully.";
}
async function generateSSH() {
  generatingSSH.value = true;
  const keys = await generateKeyPair({
    alg: "RSASSA-PKCS1-v1_5",
    hash: "SHA-256",
    name: "Threefold",
    size: 4096,
  });
  const grid = await getGrid(profileManager.profile!);
  await storeSSH(grid!, keys.publicKey);
  profileManager.updateSSH(keys.publicKey);
  ssh.value = profileManager.profile!.ssh;
  downloadAsFile("id_rsa", keys.privateKey);
  generatingSSH.value = false;
  SSHKeyHint.value = "SSH key generated successfully.";
}

function sshRules(value: any) {
  return [
    (v: any) => !!v || "SSH key is required.",
    (v: string) =>
      isValidSSHKey(v) ||
      "The SSH key you provided is not valid. Please double-check that it is copied correctly and follows the correct format.",
  ];
}
</script>
<script lang="ts">
export default {
  name: "SSHkey",
};
</script>
