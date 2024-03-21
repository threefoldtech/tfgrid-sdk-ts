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

  <v-card class="mb-3 pa-3" color="transparent">
    <v-col class="d-flex justify-end">
      <v-btn
        variant="outlined"
        class="mr-2"
        @click="() => (isImportDialogOpen = true)"
        prepend-icon="mdi-key-plus"
        color="secondary"
      >
        Import
      </v-btn>
      <v-btn
        :loading="isExporting"
        @click="() => exportData(allKeys)"
        variant="outlined"
        class="mr-2"
        prepend-icon="mdi-export"
        color="secondary"
      >
        Export
      </v-btn>
      <v-btn class="mr-2" @click="() => (isNewDialogOpen = true)" prepend-icon="mdi-key-plus" color="primary">
        Generate
      </v-btn>
    </v-col>
  </v-card>

  <ssh-table
    @active="setActiveKey"
    @inactive="setInactiveKey"
    @delete="deleteKey"
    @update:keys="updateKeys($event)"
    @view="viewSelectedKey"
    @export="exportData($event)"
    :header-icon="'mdi-key-chain-variant'"
    :header-title="'Active Keys'"
    :ssh-keys="activeKeys"
    :loading="loading"
  />

  <ssh-table
    @active="setActiveKey"
    @inactive="setInactiveKey"
    @delete="deleteKey"
    @update:keys="updateKeys({ keys: $event, removeSelected: true })"
    @view="viewSelectedKey"
    @export="exportData($event)"
    :header-icon="'mdi-key-chain'"
    :header-title="'All Keys'"
    :ssh-keys="allKeys"
    :loading="loading"
  />

  <!-- Dialogs -->
  <!-- Generate -->
  <ssh-form-dialog
    :open="isNewDialogOpen"
    :all-keys="allKeys"
    :dialog-type="SSHCreationMethod.new"
    :generating="generatingSSH"
    :generated-ssh-key="generatedSSHKey"
    @save="addKey($event)"
    @close="closeFormDialog"
    @generate="generateSSHKeys($event)"
  />

  <!-- Import -->
  <ssh-form-dialog
    :open="isImportDialogOpen"
    :all-keys="allKeys"
    :dialog-type="SSHCreationMethod.import"
    @save="addKey($event)"
    @close="() => (isImportDialogOpen = false)"
  />

  <!-- View -->
  <ssh-data-dialog :open="isViewKey" :selected-key="selectedKey" @close="() => (isViewKey = false)" />
</template>

<script lang="ts">
import { GridClient } from "@threefold/grid_client";
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
import { getGrid, storeSSH } from "@/utils/grid";
import { downloadAsFile, downloadAsJson } from "@/utils/helpers";
import { generateSSHKeyName } from "@/utils/strings";

export default defineComponent({
  name: "SSHView",
  props: [],
  components: {
    SshTable,
    SshFormDialog,
    SshDataDialog,
  },

  data() {
    return {
      isNewDialogOpen: false,
      isImportDialogOpen: false,
      isViewKey: false,
    };
  },

  methods: {
    closeFormDialog() {
      // this.createdKeyFingerPrint = "";
      this.generatedSSHKey = "";
      this.isNewDialogOpen = false;
      if (this.isNewDialogOpen) {
        this.isNewDialogOpen = false;
      } else if (this.isImportDialogOpen) {
        this.isImportDialogOpen = false;
      }
    },

    addKey(key: SSHKeyData) {
      this.allKeys.push(key);
      // Close the opened dialog
      // this.closeFormDialog();

      createCustomToast(`The created ${key.name} key has been saved.`, ToastType.success);
      // this.createdKeyFingerPrint = "";
    },

    viewSelectedKey(key: SSHKeyData) {
      this.selectedKey = key;
      this.isViewKey = true;
    },

    updateKeys(options: { key?: SSHKeyData; keys?: SSHKeyData[]; isDeleted?: boolean; removeSelected?: boolean }) {
      this.loading = true;
      if (options.keys && options.removeSelected) {
        setTimeout(() => {
          if (options.keys && options.removeSelected) {
            this.allKeys = options.keys;
          }
        }, 3000);
      }
      this.loading = false;

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
      downloadAsFile("id_rsa", keys.privateKey);
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

    calculateFingerprint(publicKey: any) {
      const sshPublicKey = this.parsePublicKey(publicKey);
      const md5 = crypto.createHash("md5");
      md5.update(sshPublicKey.data);
      const fingerprint = md5
        .digest("hex")
        .replace(/(.{2})(?=.)/g, "$1:")
        .toUpperCase();
      return fingerprint;
    },

    exportData(keys: SSHKeyData[] | number[]) {
      this.isExporting = true;
      let exportKeys: SSHKeyData[] = [];

      if (Array.isArray(keys) && keys.length > 0 && typeof keys[0] === "number") {
        // If keys is an array of numbers, filter out keys with matching IDs
        exportKeys = this.allKeys.filter(key => keys.includes(key.id as unknown as SSHKeyData & number));
      } else {
        // If keys is an array of SSHKeyData objects, directly assign it to exportKeys
        exportKeys = keys as SSHKeyData[];
      }

      // Remove 'deleting' and 'activating' properties from each key
      exportKeys.forEach(key => {
        delete key.deleting;
        delete key.activating;
      });

      downloadAsJson(exportKeys, `ssh_keys.json`);
      this.isExporting = false;
    },

    async migrateOldKey(publicSSHKey: string) {
      const now = new Date();
      // Get the name from the exacting ssh key.
      const parts = publicSSHKey.split(" ");
      const keyName = parts[parts.length - 1];

      const newKey: SSHKeyData = {
        createdAt: formatSSHKeyTableCreatedAt(now),
        name: keyName,
        id: 1,
        isActive: true,
        key: publicSSHKey,
        fingerPrint: this.calculateFingerprint(publicSSHKey),
      };

      return await this.storeSSHKey(newKey);
    },

    async storeSSHKey(sshKey: SSHKeyData) {
      const profileManager = useProfileManager();
      const grid = await getGrid(profileManager.profile!);
      const key = JSON.stringify(sshKey);
      // console.log("key: ", key);

      await storeSSH(
        grid!,
        key,
        // "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCF3JezThwSchTvkF2oPtn8X6chevNsfE58dIY3/eg5zK9tKgNYIB2saoFh12a0AJU424sAeLO0HghhNhe/Co62xkzHhk6EpXWNSFkrlzw+FVn1FKDZbbOZH47sC3n6p5a3YhM4dALssZ/aZdpaKBgXkzk91usJ+GVa+eOnpMRBlHgi9PpvowyzPSKeH9ZcVRBPnVU+nQGyV+kd6RahNBoNgNrHu/QFI92yg/y/7Szus1IS0U92cWKf/K/Sot7O10kSjmj06lMGOO8zdENk/xrtUtRHzemCj+mq0Q/3KUMCGvdb/tH0TDeNenxvibummiym4VTcnYqbm+RDXWG8HUc/RPfEVBl8p1NGZnkBt6QJl5hddHaYwx8CCmf3maSrQFcmrWYtlUDBXYkPyrv0qmy2gM1PScntF/X9zhIfnELlyAVAKXfzVwixrBh7oOIAqefydSVcwWtCXoH38F5q/zo9bQv+eHntI83mZrUUT7JGirQF64fpJKbCZPhv0kUm9bF7DVQMiyRZdk748cgVp7dEzMVlrfZ2eIvZag5zmuJTPB7bw00+Ik9jNaOIhEoCWEaYBw7KmrLonesV8rWUkEAwWPe28bXCVmUZlgZbWJi7BFWCst2Z/j2WgScHbdAv28gAcneDW4yQmt2YaYqXqmwgSVCaD/irq5FSO4upmo5u0Q== mahmmoud.hassanein@gmail.com",
      );
      profileManager.updateSSH(
        key,
        // "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCF3JezThwSchTvkF2oPtn8X6chevNsfE58dIY3/eg5zK9tKgNYIB2saoFh12a0AJU424sAeLO0HghhNhe/Co62xkzHhk6EpXWNSFkrlzw+FVn1FKDZbbOZH47sC3n6p5a3YhM4dALssZ/aZdpaKBgXkzk91usJ+GVa+eOnpMRBlHgi9PpvowyzPSKeH9ZcVRBPnVU+nQGyV+kd6RahNBoNgNrHu/QFI92yg/y/7Szus1IS0U92cWKf/K/Sot7O10kSjmj06lMGOO8zdENk/xrtUtRHzemCj+mq0Q/3KUMCGvdb/tH0TDeNenxvibummiym4VTcnYqbm+RDXWG8HUc/RPfEVBl8p1NGZnkBt6QJl5hddHaYwx8CCmf3maSrQFcmrWYtlUDBXYkPyrv0qmy2gM1PScntF/X9zhIfnELlyAVAKXfzVwixrBh7oOIAqefydSVcwWtCXoH38F5q/zo9bQv+eHntI83mZrUUT7JGirQF64fpJKbCZPhv0kUm9bF7DVQMiyRZdk748cgVp7dEzMVlrfZ2eIvZag5zmuJTPB7bw00+Ik9jNaOIhEoCWEaYBw7KmrLonesV8rWUkEAwWPe28bXCVmUZlgZbWJi7BFWCst2Z/j2WgScHbdAv28gAcneDW4yQmt2YaYqXqmwgSVCaD/irq5FSO4upmo5u0Q== mahmmoud.hassanein@gmail.com",
      );
    },

    async loadKeys() {
      const profileManager = useProfileManager();
      console.log("User key is", JSON.parse(profileManager.profile!.ssh));
    },
  },

  async mounted() {
    const profileManager = useProfileManager();
    const userSshKey = ref<string>(profileManager.profile!.ssh);

    try {
      JSON.parse(userSshKey.value);
    } catch (e) {
      // Old key is still string.
      this.migrateOldKey(userSshKey.value);
    }

    this.loadKeys();
  },

  setup() {
    const profileManager = useProfileManager();
    const loading = ref<boolean>(false);
    const generatedSSHKey = ref<string>("");
    const generatingSSH = ref<boolean>(false);
    const isExporting = ref<boolean>(false);
    const selectedKey = ref<SSHKeyData>({
      id: 0,
      key: "",
      name: "",
      createdAt: "",
      fingerPrint: "",
      isActive: false,
      deleting: false,
      activating: false,
    });

    const allKeys = ref<SSHKeyData[]>([JSON.parse(profileManager.profile!.ssh)]);

    const activeKeys = computed(() => {
      return allKeys.value.filter(key => key.isActive === true);
    });

    return {
      loading,
      generatedSSHKey,
      generatingSSH,
      allKeys,
      activeKeys,
      SSHCreationMethod,
      selectedKey,
      isExporting,
    };
  },
});
</script>
