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
      >
        Export
      </v-btn>
      <v-btn class="mr-2" @click="openDialog(SSHCreationMethod.Generate)" prepend-icon="mdi-key-plus" color="primary">
        Generate
      </v-btn>
    </v-col>
  </v-card>

  <v-alert v-if="isMigratingError" type="warning" class="mb-3">
    We apologize for the inconvenience. The keys currently displayed here are your old keys and have not yet been
    migrated to our new system. To access your updated keys, please refresh the page or reach out to our support team
    for assistance. Thank you for your patience.
  </v-alert>

  <ssh-table
    v-if="!migrating"
    @active="setActiveKey"
    @inactive="setInactiveKey"
    @delete="deleteKey"
    @update:keys="updateKeys($event)"
    @view="viewSelectedKey"
    @export="exportKeys($event)"
    :header-icon="'mdi-key-chain-variant'"
    :header-title="'Active Keys'"
    :ssh-keys="activeKeys"
    :loading="loading"
  />

  <ssh-table
    v-if="!migrating"
    @active="setActiveKey"
    @inactive="setInactiveKey"
    @delete="deleteKey"
    @update:keys="updateKeys({ keys: $event, removeSelected: true })"
    @view="viewSelectedKey"
    @export="exportKeys($event)"
    :header-icon="'mdi-key-chain'"
    :header-title="'All Keys'"
    :ssh-keys="allKeys"
    :loading="loading || migrating"
  />

  <!-- Dialogs -->
  <!-- Generate -->
  <ssh-form-dialog
    :open="dialogType === SSHCreationMethod.Generate"
    :all-keys="allKeys"
    :dialog-type="dialogType"
    :generating="generatingSSH"
    :generated-ssh-key="generatedSSHKey"
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
    @save="addKey($event)"
    @close="closeDialog"
    @generate="generateSSHKeys($event)"
  />

  <!-- View -->
  <ssh-data-dialog :open="isViewKey" :selected-key="selectedKey" @close="closeDialog" />
</template>

<script lang="ts">
import { Buffer } from "buffer";
import crypto from "crypto";
import { computed, defineComponent, ref } from "vue";
import { generateKeyPair } from "web-ssh-keygen";

import SshDataDialog from "@/components/ssh_keys/SshDataDialog.vue";
import SshFormDialog from "@/components/ssh_keys/SshFormDialog.vue";
import SshTable from "@/components/ssh_keys/SshTable.vue";
import { useProfileManager } from "@/stores";
import { SSHCreationMethod, SSHKeyData } from "@/types";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { formatSSHKeyTableCreatedAt } from "@/utils/date";
import { getGrid, getMetadata, storeSSH } from "@/utils/grid";
import { downloadAsJson } from "@/utils/helpers";

export default defineComponent({
  name: "SSHView",
  components: {
    SshTable,
    SshFormDialog,
    SshDataDialog,
  },

  data() {
    return {
      isViewKey: false,
      isExporting: false,
      generatingSSH: false,
      generatedSSHKey: "",
      selectedKey: {
        id: 0,
        key: "",
        name: "",
        createdAt: "",
        fingerPrint: "",
        isActive: false,
      },
      migrating: false,
    };
  },

  methods: {
    openDialog(type: SSHCreationMethod) {
      this.dialogType = type;
    },

    closeDialog() {
      this.dialogType = SSHCreationMethod.None;
      this.generatedSSHKey = "";
    },

    async addKey(key: SSHKeyData) {
      this.storeSSHKey(key);
      createCustomToast(`The created ${key.name} key has been saved.`, ToastType.success);
    },

    viewSelectedKey(key: SSHKeyData) {
      this.selectedKey = key;
      this.isViewKey = true;
    },

    updateKeys(options: { key?: SSHKeyData; keys?: SSHKeyData[]; isDeleted?: boolean; removeSelected?: boolean }) {
      if (options.keys && options.removeSelected) {
        this.allKeys = options.keys;
      }

      if (options.key && options.isDeleted) {
        this.allKeys = this.allKeys.filter(_key => _key.id !== options.key?.id);
      }
    },

    setActiveKey(key: SSHKeyData) {
      key.isActive = true;
      this.updateKeys({ key });
      createCustomToast(`The activation of ${key.name} key has been enabled.`, ToastType.success);
    },

    setInactiveKey(key: SSHKeyData) {
      key.isActive = false;
      this.updateKeys({ key });
      createCustomToast(`The activation of ${key.name} key has been disabled.`, ToastType.success);
    },

    deleteKey(key: SSHKeyData) {
      this.updateKeys({ key, isDeleted: true });
      createCustomToast(`${key.name} key has been successfully removed.`, ToastType.success);
    },

    async generateSSHKeys(key: SSHKeyData) {
      this.generatingSSH = true;
      const keys = await generateKeyPair({
        alg: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
        name: key.name,
        size: 4096,
      });

      this.generatedSSHKey = keys.publicKey;
      key.fingerPrint = this.calculateFingerprint(keys.publicKey);
      downloadAsJson([key], `ssh_keys.json`);
      createCustomToast(`${key.name} key has been generated successfully.`, ToastType.success);
      this.generatingSSH = false;
    },

    parsePublicKey(publicKey: string) {
      const parts = publicKey.split(" ");
      return {
        type: parts[0],
        data: parts[1],
        comment: parts[2],
      };
    },

    calculateFingerprint(publicKey: string) {
      if (publicKey.length) {
        const sshPublicKey = this.parsePublicKey(publicKey);
        const md5 = crypto.createHash("md5");
        md5.update(sshPublicKey.data);
        const fingerprint = md5
          .digest("hex")
          .replace(/(.{2})(?=.)/g, "$1:")
          .toUpperCase();
        return fingerprint;
      }
      return "-";
    },

    async exportKeys(keys: SSHKeyData[] | number[]) {
      this.isExporting = true;
      let exportKeys: SSHKeyData[] = [];

      if (Array.isArray(keys) && keys.length > 0 && typeof keys[0] === "number") {
        exportKeys = this.allKeys.filter(key => keys.includes(key.id as SSHKeyData & number));
      } else {
        exportKeys = keys as SSHKeyData[];
      }

      exportKeys.forEach(key => {
        delete key.deleting;
        delete key.activating;
      });

      downloadAsJson(exportKeys, `ssh_keys.json`);
      this.isExporting = false;
    },

    async migrateOldKey(publicSSHKey: string) {
      this.migrating = true;
      this.isMigratingError = false;
      const parts = publicSSHKey.split(" ");
      const keyName = parts[parts.length - 1];

      const newKey: SSHKeyData = {
        createdAt: formatSSHKeyTableCreatedAt(new Date()),
        name: keyName,
        id: 1,
        isActive: true,
        key: publicSSHKey,
        fingerPrint: this.calculateFingerprint(publicSSHKey),
      };

      try {
        await this.storeSSHKey(newKey);
      } catch (error: any) {
        this.isMigratingError = true;
        createCustomToast("Error while migrating the old keys to the chain due: " + error.message, ToastType.danger);
      } finally {
        this.migrating = false;
      }
    },

    async storeSSHKey(sshKey: SSHKeyData) {
      this.allKeys.push(sshKey);
      const profileManager = useProfileManager();
      const grid = await getGrid(profileManager.profile!);
      await getMetadata(grid!);
      await storeSSH(grid!, this.allKeys);
      profileManager.updateSSH(this.allKeys);
    },

    // async loadKeys() {
    //   const profileManager = useProfileManager();
    //   const userKeys = JSON.parse(profileManager.profile!.ssh);
    //   this.allKeys = userKeys;
    // },
  },

  async mounted() {
    const profileManager = useProfileManager();
    // const grid = await getGrid(profileManager.profile!);
    // let metadata = await grid!.kvstore.get({ key: "metadata" });
    // await grid!.kvstore.remove({ key: "metadata" });
    // metadata = await grid!.kvstore.get({ key: "metadata" });
    // console.log("metadata: ", metadata);

    const userSshKey: SSHKeyData[] | string = profileManager.profile!.ssh;
    console.log("userSshKey.value", profileManager.profile!.ssh);
    if (typeof userSshKey === "string") {
      await this.migrateOldKey(userSshKey);
      return;
    }
    this.allKeys = profileManager.profile!.ssh as unknown as SSHKeyData[];
  },

  setup() {
    const loading = ref<boolean>(false);
    const isMigratingError = ref<boolean>(false);
    const allKeys = ref<SSHKeyData[]>([]);
    const activeKeys = computed(() => allKeys.value.filter(key => key.isActive));
    const dialogType = ref(SSHCreationMethod.None);

    return {
      loading,
      allKeys,
      activeKeys,
      SSHCreationMethod,
      dialogType,
      isMigratingError,
    };
  },
});
</script>
