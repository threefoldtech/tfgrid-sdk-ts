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
        <v-row>
          <v-col cols="6" v-for="_key of sshKeys" :key="_key.id">
            <v-card class="pa-5" :variant="'tonal'" color="info">
              <div class="d-flex mb-3 justify-center">
                <v-icon>mdi-key-variant</v-icon>
              </div>
              <div class="d-flex mb-3 justify-center">
                {{ capitalize(_key.name) }}
              </div>
              <div class="d-flex mb-3 justify-center">
                <v-btn
                  class="mr-3"
                  width="150"
                  :variant="selectedKeys.includes(_key) ? 'flat' : 'outlined'"
                  :color="selectedKeys.includes(_key) ? 'primary' : 'white'"
                  @click="selectKey(_key)"
                >
                  {{ selectedKeys.includes(_key) ? "Selected" : "Select" }}
                </v-btn>
                <v-btn @click="onSelectKey(_key)" width="150" color="white" variant="outlined">View</v-btn>
              </div>
            </v-card>
          </v-col>
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
import { capitalize, defineComponent, nextTick, ref } from "vue";

import SshDataDialog from "@/components/ssh_keys/SshDataDialog.vue";
import { useProfileManager } from "@/stores";
import { SSHKeyData } from "@/types";

export default defineComponent({
  name: "ManageSshDeployemnt",
  props: {},
  emits: ["selectedKeys"],
  components: {
    SshDataDialog,
  },
  methods: {
    selectKey(key: SSHKeyData) {
      if (this.selectedKeys.includes(key)) {
        const index = this.selectedKeys.indexOf(key);
        if (index !== -1) {
          this.selectedKeys.splice(index, 1);
        }
      } else {
        this.selectedKeys.push(key);
      }
      this.handleKeys();
      this.$emit("selectedKeys", this.selectedKeysString);
    },
    onSelectKey(key: SSHKeyData) {
      this.selectedKey = key;
      this.isViewSSHKey = true;
    },
    onCloseSelectKey() {
      this.isViewSSHKey = false;
      nextTick(() => {
        this.selectedKey = this.defaultKeyData;
      });
    },
    handleKeys() {
      this.selectedKeysString = this.selectedKeys.map(_key => _key.publicKey).join("\n\n");
    },
  },
  mounted() {
    this.selectedKeys = this.sshKeys.filter(_key => _key.isActive === true);
    this.handleKeys();
    this.$emit("selectedKeys", this.selectedKeysString);
  },
  setup() {
    const defaultKeyData = { createdAt: "", id: 0, publicKey: "", name: "", isActive: false };
    const openManageDialog = ref<boolean>(false);
    const profileManager = useProfileManager();
    const sshKeys = profileManager.profile?.ssh as SSHKeyData[];
    const selectedKey = ref<SSHKeyData>(defaultKeyData);
    const selectedKeys = ref<SSHKeyData[]>([]);
    const isViewSSHKey = ref<boolean>(false);

    // Each key will be added then add `\n` as a new line.
    const selectedKeysString = ref<string>("");

    return {
      openManageDialog,
      sshKeys,
      selectedKeys,
      selectedKey,
      isViewSSHKey,
      defaultKeyData,
      selectedKeysString,
      capitalize,
    };
  },
});
</script>

<style>
.cursor-pointer {
  cursor: pointer;
}
</style>
