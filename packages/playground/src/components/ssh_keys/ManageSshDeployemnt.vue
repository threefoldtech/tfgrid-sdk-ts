<template>
  <div ref="inputElement">
    <v-card class="my-6" variant="outlined">
      <v-card-title>
        <v-icon>mdi-key-chain</v-icon>
        Manage SSH keys
      </v-card-title>
      <v-card-text>
        SSH grants secure remote access to your deployed machine for seamless management and execution of commands.
        <v-alert v-if="selectedKeys.length === 0" type="warning" class="mt-2">
          Attention: It appears that no SSH keys have been selected. In order to access your deployment, you must send
          at least one SSH key. You can manage your SSH keys from the
          <router-link :to="DashboardRoutes.Deploy.SSHKey">SSH keys management page</router-link> and add more as
          needed.
        </v-alert>
      </v-card-text>

      <VDivider />

      <v-card-actions>
        <VSpacer />
        <v-btn
          color="secondary"
          variant="outlined"
          @click="openManageDialog = true"
          class="mr-2 my-1"
          :disabled="sshKeysManagement.list() && sshKeysManagement.list().length === 0"
        >
          Manage SSH keys
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>

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
          The keys selected here will be forwarded to your deployment. To change keys, simply toggle on the keys you
          wish to select/deselect.
        </v-alert>

        <v-row>
          <v-tooltip
            v-for="_key of sshKeysManagement.list()"
            :key="_key.id"
            :text="isKeySelected(_key) ? 'Selected' : 'Not selected'"
            location="bottom"
          >
            <template #activator="{ props }">
              <v-chip
                class="pa-5 ml-5 mt-5"
                :variant="isKeySelected(_key) ? 'flat' : 'outlined'"
                :color="
                  isKeySelected(_key) ? 'primary' : theme.name.value === AppThemeSelection.light ? 'primary' : 'white'
                "
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
        <v-btn
          class="mt-2 mb-2 mr-2"
          variant="outlined"
          color="anchor"
          text="Close"
          @click="openManageDialog = false"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- View SSH Key -->
  <ssh-data-dialog
    :open="isViewSSHKey"
    :selected-key="selectedKey"
    :all-keys="selectedKeys"
    @close="onCloseSelectKey"
  />
</template>

<script lang="ts">
import { noop } from "lodash";
import { capitalize, defineComponent, getCurrentInstance, nextTick, onMounted, ref, watch } from "vue";
import { onUnmounted } from "vue";
import { useTheme } from "vuetify";

import SshDataDialog from "@/components/ssh_keys/SshDataDialog.vue";
import { useForm, ValidatorStatus } from "@/hooks/form_validator";
import type { InputValidatorService } from "@/hooks/input_validator";
import { DashboardRoutes } from "@/router/routes";
import type { SSHKeyData } from "@/types";
import { AppThemeSelection } from "@/utils/app_theme";
import SSHKeysManagement from "@/utils/ssh";

export default defineComponent({
  name: "ManageSshDeployemnt",
  emits: ["selectedKeys"],
  components: {
    SshDataDialog,
  },

  setup(_, { emit }) {
    const inputElement = ref<HTMLElement>();
    const defaultKeyData = { createdAt: "", id: 0, publicKey: "", name: "", isActive: false };
    const openManageDialog = ref<boolean>(false);
    const selectedKey = ref<SSHKeyData>(defaultKeyData);
    const selectedKeys = ref<SSHKeyData[]>([]);
    const isViewSSHKey = ref<boolean>(false);
    const sshKeysManagement = new SSHKeysManagement();
    const theme = useTheme();

    // Each key will be added then add `\n` as a new line.
    const selectedKeysString = ref<string>("");

    onMounted(() => {
      selectedKeys.value = sshKeysManagement.list().filter(_key => _key.isActive === true);
      handleKeys();
      emit("selectedKeys", selectedKeysString.value);
    });

    const isKeySelected = (key: SSHKeyData) => {
      return selectedKeys.value.some(selectedKey => selectedKey.id === key.id);
    };

    function selectKey(key: SSHKeyData) {
      if (isKeySelected(key)) {
        const index = selectedKeys.value.findIndex(selectedKey => selectedKey.id === key.id);
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

    /* interact with form_validator */
    const { uid } = getCurrentInstance() as { uid: number };
    const form = useForm();

    const fakeService: InputValidatorService = {
      validate: () => Promise.resolve(true),
      setStatus: noop,
      reset: noop,
      status: ValidatorStatus.Init,
      error: null,
      $el: inputElement,
    };

    onMounted(() => form?.register(`${uid}`, fakeService));
    onUnmounted(() => form?.unregister(`${uid}`));

    watch(
      () => selectedKeys.value.length,
      num => {
        const status = num === 0 ? ValidatorStatus.Init : ValidatorStatus.Valid;
        fakeService.status = status;
        form?.updateStatus(`${uid}`, status);
      },
      { immediate: true },
    );

    return {
      inputElement,
      openManageDialog,
      selectedKeys,
      selectedKey,
      isViewSSHKey,
      defaultKeyData,
      selectedKeysString,
      DashboardRoutes,
      sshKeysManagement,
      theme,
      AppThemeSelection,

      capitalize,
      onSelectKey,
      onCloseSelectKey,
      selectKey,
      isKeySelected,
    };
  },
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.v-card-title,
.v-card-text {
  padding: 10px;
}

.v-theme--light .v-card--variant-outlined {
  border-color: #b9b9b9;
}
.v-theme--dark .v-card--variant-outlined {
  border-color: #5d5d5d;
}
</style>
