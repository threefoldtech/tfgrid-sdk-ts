<template>
  <v-card class="" variant="tonal">
    <v-card-title>
      <v-icon>mdi-key-chain</v-icon>
      Manage SSH keys
    </v-card-title>
    <v-card-text>
      SSH grants secure remote access to your deployed machine for seamless management and execution of commands.
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" variant="flat" @click="openManageDialog = true">Manage SSH keys</v-btn>
      <v-btn>Learn more</v-btn>
    </v-card-actions>
  </v-card>

  <v-dialog v-model="openManageDialog" max-width="850">
    <v-card>
      <v-toolbar color="primary" class="custom-toolbar">
        <p class="mb-5">
          <v-icon>mdi-cog-sync</v-icon>
          Manage SSH keys
        </p>
      </v-toolbar>

      <v-card-text>
        <v-alert type="info" class="mb-5">
          The keys you've chosen will be forwarded to your deployment. To make changes, simply tap on the key you wish
          to cancel or add.
        </v-alert>

        <v-alert v-if="selectedKeys.length === 0" type="warning" class="mb-5">
          Attention: It appears that no SSH keys have been selected. In order to access your deployment, you must send
          at least one SSH key. You can manage your SSH keys from the
          <router-link :to="DashboardRoutes.Deploy.SSHKey">SSH keys management page</router-link> and add more as
          needed.
        </v-alert>
        <v-row>
          <v-tooltip
            v-for="_key of sshKeys"
            :key="_key.id"
            :text="selectedKeys.includes(_key) ? 'Selected' : 'Not selected'"
            location="bottom"
          >
            <template #activator="{ props }">
              <v-chip
                class="pa-5 ml-5 mt-5"
                :variant="selectedKeys.includes(_key) ? 'flat' : 'outlined'"
                :color="selectedKeys.includes(_key) ? 'primary' : 'white'"
                v-bind="props"
                @click="selectKey(_key)"
              >
                <div class="d-flex justify-center">
                  <v-icon>mdi-key-variant</v-icon>
                </div>
                <div class="d-flex justify-center">
                  <p class="ml-2">
                    {{ capitalize(_key.name) }}
                  </p>
                </div>
              </v-chip>
            </template>
          </v-tooltip>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="mt-2 mb-2 mr-2" variant="outlined" color="white" text="Close" @click="openManageDialog = false" />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- View SSH Key -->
  <ssh-data-dialog :open="isViewSSHKey" :selected-key="selectedKey" @close="onCloseSelectKey" />
</template>

<script lang="ts">
import { capitalize, defineComponent, nextTick, onMounted, ref } from "vue";

import SshDataDialog from "@/components/ssh_keys/SshDataDialog.vue";
import { DashboardRoutes } from "@/router/routes";
import { useProfileManager } from "@/stores";
import type { SSHKeyData } from "@/types";

export default defineComponent({
  name: "ManageSshDeployemnt",
  emits: ["selectedKeys"],
  components: {
    SshDataDialog,
  },

  setup(_, { emit }) {
    const defaultKeyData = { createdAt: "", id: 0, publicKey: "", name: "", isActive: false };
    const openManageDialog = ref<boolean>(false);
    const profileManager = useProfileManager();
    const sshKeys = profileManager.profile?.ssh as SSHKeyData[];
    const selectedKey = ref<SSHKeyData>(defaultKeyData);
    const selectedKeys = ref<SSHKeyData[]>([]);
    const isViewSSHKey = ref<boolean>(false);

    // Each key will be added then add `\n` as a new line.
    const selectedKeysString = ref<string>("");

    onMounted(() => {
      selectedKeys.value = sshKeys.filter(_key => _key.isActive === true);
      handleKeys();
      emit("selectedKeys", selectedKeysString.value);
    });

    function selectKey(key: SSHKeyData) {
      if (selectedKeys.value.includes(key)) {
        const index = selectedKeys.value.indexOf(key);
        if (index !== -1) {
          selectedKeys.value.splice(index, 1);
        }
      } else {
        selectedKeys.value.push(key);
      }
      handleKeys();
      emit("selectedKeys", selectedKeysString.value);
    }

    function onSelectKey(key: SSHKeyData) {
      selectedKey.value = key;
      isViewSSHKey.value = true;
    }

    function onCloseSelectKey() {
      isViewSSHKey.value = false;
      nextTick(() => {
        selectedKey.value = defaultKeyData;
      });
    }

    function handleKeys() {
      selectedKeysString.value = selectedKeys.value.map(_key => _key.publicKey).join("\n\n");
    }

    return {
      openManageDialog,
      sshKeys,
      selectedKeys,
      selectedKey,
      isViewSSHKey,
      defaultKeyData,
      selectedKeysString,
      DashboardRoutes,

      capitalize,
      onSelectKey,
      onCloseSelectKey,
      selectKey,
    };
  },
});
</script>

<style>
.cursor-pointer {
  cursor: pointer;
}
</style>
