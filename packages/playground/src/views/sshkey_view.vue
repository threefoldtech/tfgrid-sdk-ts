<template>
  <view-layout>
    <v-card color="primary" class="d-flex justify-center items-center pa-3 mb-3 text-center">
      <v-icon size="30" class="pr-3">mdi-key-plus</v-icon>
      <v-card-title class="pa-0">SSH keys</v-card-title>
    </v-card>
    <v-alert type="info"> Multiple keys support is coming up soon </v-alert>

    <v-card class="mt-3 mb-1" color="transparent">
      <v-col class="px-0 d-flex justify-end">
        <v-btn
          class="mr-2"
          @click="() => openDialog(SSHCreationMethod.Import)"
          prepend-icon="mdi-key-plus"
          color="secondary"
          :disabled="loading || deleting || generatingSSH || savingKey || activating"
        >
          Import
        </v-btn>

        <v-btn
          @click="exportAllKeys"
          class="mr-2"
          prepend-icon="mdi-export"
          color="secondary"
          :disabled="
            !allKeys ||
            allKeys.length === 0 ||
            loading ||
            deleting ||
            generatingSSH ||
            savingKey ||
            isExporting ||
            activating
          "
          :loading="isExporting"
        >
          Export all
        </v-btn>

        <v-btn
          class=""
          variant="elevated"
          :disabled="loading || deleting || generatingSSH || savingKey || activating"
          @click="openDialog(SSHCreationMethod.Generate)"
          prepend-icon="mdi-key-plus"
        >
          Generate
        </v-btn>
      </v-col>
    </v-card>

    <ssh-table
      @delete="deleteKey"
      @view="viewSelectedKey"
      @export="exportSelectedKeys"
      @update:activation="updateActivation"
      :ssh-keys="allKeys"
      :loading="loading"
      :loading-message="tableLoadingMessage"
      :deleting="deleting"
    />

    <!-- Dialogs -->
    <!-- Generate -->
    <ssh-form-dialog
      v-if="dialogType === SSHCreationMethod.Generate"
      :open="dialogType === SSHCreationMethod.Generate"
      :all-keys="allKeys"
      :dialog-type="dialogType"
      :generating="generatingSSH"
      :saving-key="savingKey"
      @save="addKey($event)"
      @close="closeDialog"
      @generate="generateSSHKeys($event)"
    />

    <!-- Import -->
    <ssh-form-dialog
      v-if="dialogType === SSHCreationMethod.Import"
      :open="dialogType === SSHCreationMethod.Import"
      :all-keys="allKeys"
      :dialog-type="dialogType"
      :generating="generatingSSH"
      :saving-key="savingKey"
      @save="addKey($event)"
      @close="closeDialog"
      @generate="generateSSHKeys($event)"
    />

    <!-- View -->
    <ssh-data-dialog
      :open="isViewKey"
      :all-keys="allKeys"
      :selected-key="selectedKey"
      @close="isViewKey = false"
      @update="updateKeys"
    />
  </view-layout>
</template>

<script lang="ts" setup>
import { InsufficientBalanceError } from "@threefold/types";
import { defineComponent, onMounted, ref } from "vue";
import { generateKeyPair } from "web-ssh-keygen";

import SshDataDialog from "@/components/ssh_keys/SshDataDialog.vue";
import SshFormDialog from "@/components/ssh_keys/SshFormDialog.vue";
import SshTable from "@/components/ssh_keys/SshTable.vue";
import { SSHCreationMethod, type SSHKeyData } from "@/types";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { downloadAsFile } from "@/utils/helpers";
import SSHKeysManagement from "@/utils/ssh";

const loading = ref<boolean>(false);
const savingKey = ref<boolean>(false);
const deleting = ref<boolean>(false);
const activating = ref<boolean>(false);
const isViewKey = ref<boolean>(false);
const isExporting = ref<boolean>(false);
const generatingSSH = ref<boolean>(false);

const allKeys = ref<SSHKeyData[]>([]);
const dialogType = ref<SSHCreationMethod>(SSHCreationMethod.None);
const tableLoadingMessage = ref("");

const selectedKey = ref<SSHKeyData>({
  id: 0,
  publicKey: "",
  name: "",
  createdAt: "",
  isActive: false,
});

const sshKeysManagement = new SSHKeysManagement();

onMounted(async () => {
  loading.value = true;
  if (!sshKeysManagement.migrated()) {
    tableLoadingMessage.value = "Migrating your old key...";
    const migrationInterval = setInterval(async () => {
      const migrated = !sshKeysManagement.migrated();
      if (migrated) {
        clearInterval(migrationInterval);
        allKeys.value = sshKeysManagement.list();
        tableLoadingMessage.value = "";
      }
    }, 1000);
  } else {
    allKeys.value = sshKeysManagement.list();
    tableLoadingMessage.value = "";
  }
  loading.value = false;
});

const openDialog = (type: SSHCreationMethod) => {
  dialogType.value = type;
};

const closeDialog = () => {
  dialogType.value = SSHCreationMethod.None;
};

const exportAllKeys = () => {
  isExporting.value = true;
  sshKeysManagement.export(allKeys.value);
  isExporting.value = false;
};

const exportSelectedKeys = (keys: SSHKeyData[]) => {
  isExporting.value = true;
  let exportKeys: SSHKeyData[] = [];

  if (Array.isArray(keys) && keys.length > 0 && typeof keys[0] === "number") {
    exportKeys = allKeys.value.filter(key => keys.includes(key.id as SSHKeyData & number));
  } else {
    exportKeys = keys as SSHKeyData[];
  }

  exportKeys.forEach(key => {
    delete key.deleting;
    delete key.activating;
  });

  sshKeysManagement.export(exportKeys);
  isExporting.value = false;
};

const updateActivation = async (key: SSHKeyData) => {
  activating.value = key.activating = true;

  try {
    key.isActive = !key.isActive;
    await sshKeysManagement.update(allKeys.value);
    createCustomToast(
      `The activation of ${key.name} key has been ${key.isActive ? "enabled" : "disabled"}.`,
      ToastType.success,
    );
    activating.value = key.activating = false;
  } catch (e: any) {
    key.isActive = !key.isActive;
    if (e instanceof InsufficientBalanceError) {
      createCustomToast(
        "Your wallet balance is insufficient to save your SSH key. To avoid losing your SSH key, please recharge your wallet.",
        ToastType.danger,
      );
    } else {
      createCustomToast(e.message, ToastType.danger);
    }

    activating.value = key.activating = false;
    return;
  }
};

const deleteKey = async (selectedKeys: SSHKeyData[]) => {
  deleting.value = true;
  const ids: number[] = selectedKeys.map(key => key.id);
  const keysToNotDelete = allKeys.value.filter(_key => !ids.includes(_key.id));
  selectedKeys.map(key => (key.deleting = true));

  try {
    await sshKeysManagement.update(keysToNotDelete);
  } catch (e: any) {
    if (e instanceof InsufficientBalanceError) {
      createCustomToast(
        "Your wallet balance is insufficient to save your SSH key. To avoid losing your SSH key, please recharge your wallet.",
        ToastType.danger,
      );
    } else {
      createCustomToast(e.message, ToastType.danger);
    }

    deleting.value = false;
    return;
  }

  selectedKeys.map(key => (key.deleting = false));
  allKeys.value = keysToNotDelete;
  createCustomToast(
    `The selected ${selectedKeys.length > 1 ? "keys have" : "key has"} been deleted successfully.`,
    ToastType.success,
  );
  deleting.value = false;
};

const addKey = async (key: SSHKeyData) => {
  savingKey.value = true;
  if (!key.fingerPrint) {
    key.fingerPrint = sshKeysManagement.calculateFingerprint(key.publicKey);
  }

  const copiedAllkeys = [...allKeys.value, key];

  try {
    await sshKeysManagement.update(copiedAllkeys);
  } catch (e: any) {
    if (e instanceof InsufficientBalanceError) {
      createCustomToast(
        "Your wallet balance is insufficient to save your SSH key. To avoid losing your SSH key, please recharge your wallet.",
        ToastType.danger,
      );
    } else {
      createCustomToast(e.message, ToastType.danger);
    }

    savingKey.value = false;
    return;
  }

  loading.value = true;
  allKeys.value = copiedAllkeys;
  savingKey.value = false;
  loading.value = false;
  closeDialog();
};

const updateKeys = async (updatedKey: SSHKeyData) => {
  const index = allKeys.value.findIndex(key => key.id === updatedKey.id);
  allKeys.value[index] = { ...updatedKey };
  try {
    await sshKeysManagement.update(allKeys.value);
    createCustomToast("SSH Key updated successfully.", ToastType.success);
  } catch (error) {
    createCustomToast("Failed to update the SSH Key.", ToastType.danger);
  } finally {
    isViewKey.value = false;
  }
};

const generateSSHKeys = async (key: SSHKeyData) => {
  generatingSSH.value = true;
  const keys = await generateKeyPair({
    alg: "RSASSA-PKCS1-v1_5",
    hash: "SHA-256",
    name: key.name,
    size: 4096,
  });

  key.fingerPrint = sshKeysManagement.calculateFingerprint(keys.publicKey);
  key.publicKey = keys.publicKey;

  const copiedAllkeys = [...allKeys.value, key];

  try {
    await sshKeysManagement.update(copiedAllkeys);
  } catch (e: any) {
    if (e instanceof InsufficientBalanceError) {
      createCustomToast(
        "Your wallet balance is insufficient to save your SSH key. To avoid losing your SSH key, please recharge your wallet.",
        ToastType.danger,
      );
    } else {
      createCustomToast(e.message, ToastType.danger);
    }

    generatingSSH.value = false;
    loading.value = false;
    return;
  }

  loading.value = true;
  downloadAsFile("id_rsa", keys.privateKey);
  createCustomToast(`${key.name} key has been generated successfully.`, ToastType.success);
  allKeys.value = copiedAllkeys;
  generatingSSH.value = false;
  loading.value = false;
  closeDialog();
};

const viewSelectedKey = (key: SSHKeyData) => {
  selectedKey.value = key;
  isViewKey.value = true;
};
</script>

<script lang="ts">
export default defineComponent({
  name: "SSHView",
});
</script>
