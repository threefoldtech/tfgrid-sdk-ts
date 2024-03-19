<template>
  <v-card variant="tonal" class="pa-6 mb-4">
    <div>
      <h2 class="text-info">
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

  <v-card class="mb-3" variant="outlined">
    <v-col class="d-flex justify-start">
      <v-btn variant="tonal" class="mr-2" prepend-icon="mdi-export" color="primary"> Export all keys </v-btn>
      <v-btn variant="tonal" @click="() => (openAddNewSSHDialog = true)" prepend-icon="mdi-key-plus" color="primary">
        Generate SSH Keys
      </v-btn>
    </v-col>
  </v-card>

  <ssh-table
    @active="setActiveKey"
    @inactive="setInactiveKey"
    @delete="deleteKey"
    :header-icon="'mdi-key-chain-variant'"
    :header-title="'Active Keys'"
    :ssh-keys="activeKeys"
  />

  <ssh-table
    @active="setActiveKey"
    @inactive="setInactiveKey"
    @delete="deleteKey"
    :header-icon="'mdi-key-chain'"
    :header-title="'All Keys'"
    :ssh-keys="allKeys"
  />

  <!-- Dialogs -->
  <add-new-ssh-key-dialog
    :open="openAddNewSSHDialog"
    :all-keys="allKeys"
    @save="addKey($event)"
    @close="() => (openAddNewSSHDialog = false)"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ref } from "vue";

import AddNewSshKeyDialog from "@/components/ssh_keys/AddNewSshKeyDialog.vue";
import SshTable from "@/components/ssh_keys/SshTable.vue";
import { SSHKeyData } from "@/types";

export default defineComponent({
  props: [],
  components: {
    SshTable,
    AddNewSshKeyDialog,
  },

  data() {
    return {
      openAddNewSSHDialog: false,
    };
  },

  methods: {
    addKey(key: SSHKeyData) {
      this.allKeys.push(key);
      this.updateKeys(key);
    },

    updateKeys(key: SSHKeyData, isDeleted?: boolean) {
      if (key.isActive) {
        this.activeKeys.push(key);
      } else {
        this.activeKeys = this.activeKeys.filter(_key => _key.id !== key.id);
      }

      if (isDeleted) {
        this.activeKeys = this.activeKeys.filter(_key => _key.id !== key.id);
        this.allKeys = this.allKeys.filter(_key => _key.id !== key.id);
      }
    },

    setActiveKey(key: SSHKeyData) {
      key.isActive = true;
      this.updateKeys(key);
    },

    setInactiveKey(key: SSHKeyData) {
      key.isActive = false;
      this.updateKeys(key);
    },

    deleteKey(key: SSHKeyData) {
      this.updateKeys(key, true);
    },
  },
  setup() {
    const allKeys = ref<SSHKeyData[]>([
      {
        id: 1,
        key: "",
        name: "Test key",
        createdAt: "2011-05-14",
        lastUsed: "2014-09-15",
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
        lastUsed: "2022-02-02",
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
        lastUsed: "2020-01-01",
        fingerPrint: "@$$@s4ad#@$saj4h5@asf",
        isActive: false,
        activating: false,
        deleting: false,
      },
    ]);

    const activeKeys = ref<SSHKeyData[]>(allKeys.value.filter(key => key.isActive === true));

    return { allKeys, activeKeys };
  },
});
</script>
