<template>
  <v-card class="pa-6 mb-4">
    <div>
      <h2 class="text-light">
        <v-icon> mdi-cog-sync </v-icon>
        Manage SSH Keys
      </h2>
      <p class="mt-2">
        Facilitating access to deployed machines involves the incorporation or adaptation of SSH keys, with the
        flexibility to manage multiple keys seamlessly, allowing users to switch between them. Moreover, users can
        activate individual keys or enable them all, streamlining the process of distributing them to the machines and
        effectively managing accessibility to the deployed nodes.
      </p>
    </div>
  </v-card>

  <div v-if="migrating">
    <v-progress-linear color="info" indeterminate></v-progress-linear>
    <v-alert type="info" class="mb-3 pa-6" variant="tonal">
      Migrating the old key. This process may require 15 to 30 seconds. Thank you for your patience.
    </v-alert>
  </div>

  <v-card v-else class="mb-3 pa-3" color="transparent">
    <v-col class="d-flex justify-end">
      <v-btn
        variant="outlined"
        class="mr-2"
        @click="() => openDialog(SSHCreationMethod.Import)"
        prepend-icon="mdi-key-plus"
        color="secondary"
        :disabled="loading"
      >
        Import
      </v-btn>
      <v-btn
        :loading="isExporting"
        @click="exportKeys(allKeys)"
        variant="outlined"
        class="mr-2"
        prepend-icon="mdi-export"
        color="secondary"
        :disabled="!allKeys || allKeys.length === 0 || loading"
      >
        Export
      </v-btn>
      <v-btn
        class="mr-2"
        :disabled="loading"
        @click="openDialog(SSHCreationMethod.Generate)"
        prepend-icon="mdi-key-plus"
        color="primary"
      >
        Generate
      </v-btn>
    </v-col>
  </v-card>

  <ssh-table
    v-if="!migrating"
    @active="setActiveKey"
    @inactive="setInactiveKey"
    @delete="deleteKey($event)"
    @view="viewSelectedKey"
    @export="exportKeys($event)"
    :header-icon="'mdi-key-chain-variant'"
    :header-title="'Active Keys'"
    :ssh-keys="activeKeys"
    :loading="loading"
    :deleting="deleting"
  />

  <ssh-table
    v-if="!migrating"
    @active="setActiveKey"
    @inactive="setInactiveKey"
    @delete="deleteKey($event)"
    @view="viewSelectedKey"
    @export="exportKeys($event)"
    :header-icon="'mdi-key-chain'"
    :header-title="'All Keys'"
    :ssh-keys="allKeys"
    :loading="loading"
    :deleting="deleting"
  />

  <!-- Dialogs -->
  <!-- Generate -->
  <ssh-form-dialog
    :open="dialogType === SSHCreationMethod.Generate"
    :all-keys="allKeys"
    :dialog-type="dialogType"
    :generating="generatingSSH"
    :generated-ssh-key="generatedSSHKey"
    :saving-key="savingKey"
    @save="addKey($event)"
    @close="closeDialog"
    @generate="generateSSHKeys($event)"
  />

  <!-- Import -->
  <ssh-form-dialog
    :open="dialogType === SSHCreationMethod.Import"
    :all-keys="allKeys"
    :dialog-type="dialogType"
    :generating="generatingSSH"
    :generated-ssh-key="generatedSSHKey"
    :saving-key="savingKey"
    @save="addKey($event)"
    @close="closeDialog"
    @generate="generateSSHKeys($event)"
  />

  <!-- View -->
  <ssh-data-dialog :open="isViewKey" :selected-key="selectedKey" @close="isViewKey = false" />
</template>

<script lang="ts">
import type { GridClient } from "@threefold/grid_client";
import crypto from "crypto";
import { computed, defineComponent, ref } from "vue";
import { onMounted } from "vue";
import { generateKeyPair } from "web-ssh-keygen";

import SshDataDialog from "@/components/ssh_keys/SshDataDialog.vue";
import SshFormDialog from "@/components/ssh_keys/SshFormDialog.vue";
import SshTable from "@/components/ssh_keys/SshTable.vue";
import { useProfileManager } from "@/stores";
import { SSHCreationMethod, type SSHKeyData } from "@/types";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { formatSSHKeyTableCreatedAt } from "@/utils/date";
import { getMetadata, storeSSH } from "@/utils/grid";
import { downloadAsFile, downloadAsJson } from "@/utils/helpers";

import { useGrid } from "../stores";

export default defineComponent({
  name: "SSHView",
  components: {
    SshTable,
    SshFormDialog,
    SshDataDialog,
  },

  setup() {
    const isViewKey = ref(false);
    const isExporting = ref(false);
    const generatingSSH = ref(false);
    const generatedSSHKey = ref("");
    const selectedKey = ref<SSHKeyData>({
      id: 0,
      publicKey: "",
      name: "",
      createdAt: "",
      isActive: false,
    });
    const migrating = ref(false);
    const gridStore = useGrid();
    const grid = gridStore.client as GridClient;

    const openDialog = (type: SSHCreationMethod) => {
      dialogType.value = type;
    };

    const closeDialog = () => {
      dialogType.value = SSHCreationMethod.None;
      generatedSSHKey.value = "";
    };

    // Add SSH key
    const addKey = async (key: SSHKeyData) => {
      savingKey.value = true;
      if (!key.fingerPrint) {
        key.fingerPrint = calculateFingerprint(key.publicKey);
      }

      allKeys.value.push(key);
      await updateSSHKeysInChain();
      createCustomToast(`The created ${key.name} key has been saved.`, ToastType.success);
      savingKey.value = false;
      closeDialog();
    };

    const viewSelectedKey = (key: SSHKeyData) => {
      selectedKey.value = key;
      isViewKey.value = true;
    };

    const setActiveKey = async (key: SSHKeyData) => {
      key.activating = true;
      key.isActive = true;
      await updateSSHKeysInChain();
      createCustomToast(`The activation of ${key.name} key has been enabled.`, ToastType.success);
      key.activating = false;
    };

    const setInactiveKey = async (key: SSHKeyData) => {
      key.activating = true;
      key.isActive = false;
      await updateSSHKeysInChain();
      createCustomToast(`The activation of ${key.name} key has been disabled.`, ToastType.success);
      key.activating = false;
    };

    const deleteKey = async (selectedKeys: SSHKeyData[]) => {
      deleting.value = true;
      const ids: number[] = selectedKeys.map(key => key.id);
      allKeys.value = allKeys.value.filter(_key => !ids.includes(_key.id));
      selectedKeys.map(key => (key.deleting = true));
      await updateSSHKeysInChain();
      selectedKeys.map(key => (key.deleting = false));
      createCustomToast(
        `The selected ${selectedKeys.length > 1 ? "keys" : "key"} has been deleted successfully.`,
        ToastType.success,
      );
      deleting.value = false;
    };

    const generateSSHKeys = async (key: SSHKeyData) => {
      generatingSSH.value = true;
      const keys = await generateKeyPair({
        alg: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
        name: key.name,
        size: 4096,
      });

      generatedSSHKey.value = keys.publicKey;
      key.fingerPrint = calculateFingerprint(keys.publicKey);
      downloadAsFile("id_rsa", keys.privateKey);
      createCustomToast(`${key.name} key has been generated successfully.`, ToastType.success);
      generatingSSH.value = false;
    };

    const exportKeys = async (keys: SSHKeyData[] | number[]) => {
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

      downloadAsJson(exportKeys, `ssh_keys.json`);
      isExporting.value = false;
    };

    const migrateOldKey = async (publicSSHKey: string) => {
      migrating.value = true;
      const parts = publicSSHKey.split(" ");
      const keyName = parts[parts.length - 1];

      const newKey: SSHKeyData = {
        createdAt: formatSSHKeyTableCreatedAt(new Date()),
        name: keyName,
        id: 1,
        isActive: true,
        publicKey: publicSSHKey,
      };

      allKeys.value.push(newKey);
      await updateSSHKeysInChain();
      newKey.fingerPrint = calculateFingerprint(publicSSHKey);
      migrating.value = false;
    };

    const profileManager = useProfileManager();
    const userSshKey = ref<SSHKeyData[] | string>(profileManager.profile!.ssh);

    const loading = ref<boolean>(false);
    const savingKey = ref<boolean>(false);
    const deleting = ref<boolean>(false);
    const allKeys = ref<SSHKeyData[]>([]);
    const activeKeys = computed(() => (allKeys.value.length ? allKeys.value.filter(key => key.isActive) : []));
    const dialogType = ref<SSHCreationMethod>(SSHCreationMethod.None);

    const parsePublicKey = (publicKey: string) => {
      const parts = publicKey.split(" ");
      return {
        type: parts[0],
        data: parts[1],
        comment: parts[2],
      };
    };

    const calculateFingerprint = (publicKey: string) => {
      if (publicKey.length) {
        const sshPublicKey = parsePublicKey(publicKey);
        const md5 = crypto.createHash("md5");

        if (sshPublicKey.data) {
          md5.update(sshPublicKey.data);
          const fingerprint = md5
            .digest("hex")
            .replace(/(.{2})(?=.)/g, "$1:")
            .toUpperCase();
          return fingerprint;
        }
      }
      return "-";
    };

    const updateSSHKeysInChain = async () => {
      const copiedKeys = allKeys.value.map(key => {
        // Remove the fingerprint, activating, and deleting before saving the key to the chain
        const { fingerPrint, activating, deleting, ...keyWithoutSensitiveProps } = key;
        return keyWithoutSensitiveProps;
      });

      // Update the chain with the current sshkeys => this.allkeys
      await getMetadata(grid!);
      await storeSSH(grid!, copiedKeys);
      profileManager.updateSSH(copiedKeys);
    };

    onMounted(async () => {
      if (typeof userSshKey.value === "string") {
        migrateOldKey(userSshKey.value);
      } else {
        loading.value = true;
        if (!userSshKey.value) {
          profileManager.updateSSH(allKeys.value);
        }

        await getMetadata(grid!);

        allKeys.value = userSshKey.value || [];
        if (allKeys.value) {
          // Calculate the fingerprint for each key after saving them to the chain
          allKeys.value = allKeys.value.map(key => {
            const fingerprint = calculateFingerprint(key.publicKey);
            return { ...key, fingerPrint: fingerprint };
          });
        }
        loading.value = false;
      }
    });

    return {
      loading,
      deleting,
      allKeys,
      activeKeys,
      SSHCreationMethod,
      dialogType,
      savingKey,
      generatingSSH,
      migrating,
      isExporting,
      generatedSSHKey,
      isViewKey,
      selectedKey,

      openDialog,
      closeDialog,
      addKey,
      viewSelectedKey,
      setActiveKey,
      setInactiveKey,
      deleteKey,
      generateSSHKeys,
      exportKeys,
      migrateOldKey,
      calculateFingerprint,
      updateSSHKeysInChain,
    };
  },
});
</script>
