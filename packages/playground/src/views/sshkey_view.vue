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
      <v-btn variant="outlined" class="mr-2" prepend-icon="mdi-export" color="secondary"> Export </v-btn>
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
import crypto from "crypto";
import { computed, defineComponent, ref } from "vue";
import { generateKeyPair } from "web-ssh-keygen";

import SshDataDialog from "@/components/ssh_keys/SshDataDialog.vue";
import SshFormDialog from "@/components/ssh_keys/SshFormDialog.vue";
import SshTable from "@/components/ssh_keys/SshTable.vue";
import { useProfileManager } from "@/stores";
import { SSHCreationMethod, SSHKeyData } from "@/types";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { getGrid, storeSSH } from "@/utils/grid";
import { downloadAsFile } from "@/utils/helpers";

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

      const profileManager = useProfileManager();
      const grid = await getGrid(profileManager.profile!);
      this.generatedSSHKey = keys.publicKey;
      await storeSSH(grid!, keys.publicKey);
      downloadAsFile("id_rsa", keys.privateKey);
      key.fingerPrint = this.calculateFingerprint(keys.publicKey);
      createCustomToast(`${key.name} key has been generated successfully.`, ToastType.success);
      this.generatingSSH = false;
      // this.profileManager.updateSSH(keys.publicKey);
      // this.userSshKey = this.profileManager.profile!.ssh;
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
  },

  setup() {
    const loading = ref<boolean>(false);
    const profileManager = useProfileManager();
    const userSshKey = ref<string>(profileManager.profile!.ssh);
    const generatedSSHKey = ref<string>("");
    const generatingSSH = ref<boolean>(false);
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

    console.log("userSshKey", userSshKey);

    const allKeys = ref<SSHKeyData[]>([
      {
        id: 1,
        key: "",
        name: "Test key",
        createdAt: "2011-05-14",
        fingerPrint: "524sad#!@$$@s4ad#@$saj4h5@asf",
        isActive: false,
        activating: false,
        deleting: false,
      },
      {
        id: 2,
        key: "",
        name: "Mahmoud's key",
        createdAt: "2020-09-25",
        fingerPrint: "524sad#!@$$@s4ad@asf",
        isActive: true,
        activating: false,
        deleting: false,
      },
      {
        id: 3,
        key: "",
        name: "Adham's key",
        createdAt: "2018-01-01",
        fingerPrint: "@$$@s4ad#@$saj4h5@asf",
        isActive: false,
        activating: false,
        deleting: false,
      },
    ]);

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
    };
  },
});
</script>
