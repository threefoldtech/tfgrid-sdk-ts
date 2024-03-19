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
        @click="() => (openImportSSHDialog = true)"
        prepend-icon="mdi-key-plus"
        color="secondary"
      >
        Import
      </v-btn>
      <v-btn variant="outlined" class="mr-2" prepend-icon="mdi-export" color="secondary"> Export </v-btn>
      <v-btn class="mr-2" @click="() => (openAddNewSSHDialog = true)" prepend-icon="mdi-key-plus" color="primary">
        Generate
      </v-btn>
    </v-col>
  </v-card>

  <ssh-table
    @active="setActiveKey"
    @inactive="setInactiveKey"
    @delete="deleteKey"
    @update:keys="updateKeys($event)"
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
    :header-icon="'mdi-key-chain'"
    :header-title="'All Keys'"
    :ssh-keys="allKeys"
    :loading="loading"
  />

  <!-- Dialogs -->
  <add-new-ssh-key-dialog
    :open="openAddNewSSHDialog"
    :all-keys="allKeys"
    :generated-sshkey="userSshKey"
    @save="addKey($event)"
    @close="() => (openAddNewSSHDialog = false)"
    @generate="generateSSHKeys($event)"
  />

  <import-ssh-key-dialog
    :open="openImportSSHDialog"
    :all-keys="allKeys"
    :generated-sshkey="userSshKey"
    @save="addKey($event)"
    @close="() => (openImportSSHDialog = false)"
    @generate="generateSSHKeys($event)"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { ref } from "vue";
import { generateKeyPair } from "web-ssh-keygen";

import AddNewSshKeyDialog from "@/components/ssh_keys/AddNewSshKeyDialog.vue";
import ImportSshKeyDialog from "@/components/ssh_keys/ImportSshKeyDialog.vue";
import SshTable from "@/components/ssh_keys/SshTable.vue";
import { useProfileManager } from "@/stores";
import { SSHKeyData } from "@/types";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { getGrid, storeSSH } from "@/utils/grid";
import { downloadAsFile } from "@/utils/helpers";

export default defineComponent({
  props: [],
  components: {
    SshTable,
    AddNewSshKeyDialog,
    ImportSshKeyDialog,
  },

  data() {
    return {
      openAddNewSSHDialog: false,
      openImportSSHDialog: false,
    };
  },

  methods: {
    addKey(key: SSHKeyData) {
      this.allKeys.push(key);
    },

    updateKeys(options: { key?: SSHKeyData; keys?: SSHKeyData[]; isDeleted?: boolean; removeSelected?: boolean }) {
      this.loading = true;
      if (options.keys && options.removeSelected) {
        setTimeout(() => {
          if (options.keys && options.removeSelected) {
            console.log("options.keys", options.keys);

            this.allKeys = options.keys;
            this.loading = false;
          }
        }, 3000);
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

    async generateSSHKeys(keyName: string) {
      this.generatingSSH = true;
      const keys = await generateKeyPair({
        alg: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
        name: keyName,
        size: 4096,
      });
      const grid = await getGrid(this.profileManager.profile!);
      await storeSSH(grid!, keys.publicKey);
      this.profileManager.updateSSH(keys.publicKey);
      this.userSshKey = this.profileManager.profile!.ssh;
      downloadAsFile("id_rsa", keys.privateKey);
      this.generatingSSH = false;
      createCustomToast(`${keyName} key has been generated successfully.`, ToastType.success);
    },
  },
  setup() {
    const loading = ref<boolean>(false);
    const profileManager = useProfileManager();
    const userSshKey = ref(profileManager.profile!.ssh);
    const generatingSSH = ref<boolean>(false);

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

    return { allKeys, activeKeys, loading, generatingSSH, profileManager, userSshKey };
  },
});
</script>
