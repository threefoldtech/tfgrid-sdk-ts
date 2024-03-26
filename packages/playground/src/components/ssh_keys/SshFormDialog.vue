<template>
  <v-dialog
    @click:outside="() => $emit('close')"
    @keydown.esc="() => $emit('close')"
    v-model="$props.open"
    max-width="750"
  >
    <template v-slot:default>
      <v-card>
        <v-toolbar color="primary" class="custom-toolbar">
          <p v-if="$props.dialogType === SSHCreationMethod.Generate" class="mb-5">Add new SSH Key</p>
          <p v-else-if="$props.dialogType === SSHCreationMethod.Import" class="mb-5">Import an exact SSH Key</p>
        </v-toolbar>

        <v-card-text>
          <input-tooltip
            width="500"
            location="top right"
            tooltip="Enter a descriptive name for your SSH key to easily identify it later, e.g., 'My-Laptop-Key' or 'Work-Server-Key'."
          >
            <v-text-field
              hint="Leave this field empty to generate a name automatically, or enter a custom name to save it with your key."
              :rules="[
                keyName.length < 15 || 'Please enter a key name with fewer than 15 characters.',
                !keyName.includes(' ') || 'Key names cannot include spaces. Please use a name without spaces.',
              ]"
              class="mb-4"
              hide-details="auto"
              v-model="keyName"
              label="name"
            />
          </input-tooltip>

          <v-alert width="95%" class="mb-4" type="info">
            Updating or generating SSH key will cost you up to 0.01 TFT
          </v-alert>

          <div v-if="$props.dialogType === SSHCreationMethod.Generate" class="create">
            <v-alert width="95%" type="info" class="mt-4">
              We will not keep your private key information. Be sure to save the private key downloaded after creation.
            </v-alert>
          </div>

          <div class="import" v-if="$props.dialogType === SSHCreationMethod.Import">
            <input-tooltip
              class="mt-4"
              width="500"
              location="top right"
              #="{ props }"
              tooltip="This key will be used for authentication when accessing remote servers securely via SSH protocol."
            >
              <CopyInputWrapper :data="sshKey" #="{ props: copyInputProps }">
                <v-textarea
                  hide-details="auto"
                  v-model.trim="sshKey"
                  no-resize
                  label="Public ssh key"
                  v-bind="{ ...props, ...copyInputProps }"
                  :rules="sshRules(sshKey)"
                >
                </v-textarea>
              </CopyInputWrapper>
            </input-tooltip>
          </div>
        </v-card-text>

        <v-card-actions class="custom-actions">
          <v-spacer></v-spacer>
          <div class="mt-3">
            <v-btn color="white" variant="outlined" text="Close" @click="$emit('close')"></v-btn>

            <v-btn
              v-if="$props.dialogType === SSHCreationMethod.Generate"
              @click="generateSSHKey"
              :loading="generating"
              :disabled="generating || !!generatedSshKey"
              variant="outlined"
              color="secondary"
            >
              Generate and Save
            </v-btn>

            <v-btn
              v-if="$props.dialogType === SSHCreationMethod.Import"
              :disabled="!sshKey || !isValidSSHKey(sshKey)"
              color="secondary"
              variant="outlined"
              text="Save"
              @click="createNewSSHKey"
            ></v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from "vue";

import { type Profile, useProfileManager } from "@/stores/profile_manager";
import { SSHCreationMethod, SSHKeyData } from "@/types";
import { formatSSHKeyTableCreatedAt } from "@/utils/date";
import { Balance, getGrid, loadBalance } from "@/utils/grid";
import { isEnoughBalance } from "@/utils/helpers";
import { generateSSHKeyName } from "@/utils/strings";
import { isValidSSHKey } from "@/utils/validators";

export default defineComponent({
  emits: ["close", "save", "generate"],
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    generating: {
      type: Boolean,
      required: false,
    },
    generatedSshKey: {
      type: String,
      required: false,
    },
    allKeys: {
      type: Object as PropType<SSHKeyData[]>,
      required: true,
    },
    dialogType: {
      type: Object as PropType<SSHCreationMethod>,
      required: true,
    },
  },

  setup(props, { emit }) {
    const profileManager = useProfileManager();
    const sshKey = ref<string>("");
    const keyName = ref<string>(generateUniqueSSHKeyName());
    const createdKey = ref<SSHKeyData | null>(null); // Initialize createdKey with null
    const balance = ref<Balance>();
    const hasEnoughBalance = computed(() => isEnoughBalance(balance.value, 0.01));
    const loadingBalance = ref<boolean>(false);
    let interval: any;

    watch(
      () => props.open,
      isOpen => {
        if (isOpen) {
          const now = new Date();
          const lastID = props.allKeys.length ? props.allKeys[props.allKeys.length - 1].id : 1;

          keyName.value = generateUniqueSSHKeyName();
          createdKey.value = {
            id: lastID + 1,
            publicKey: props.generatedSshKey as string,
            createdAt: formatSSHKeyTableCreatedAt(now),
            name: keyName.value.length === 0 ? generateUniqueSSHKeyName() : keyName.value,
            isActive: true,
          };
        }
      },
      { deep: true },
    );

    watch(
      () => props.generatedSshKey,
      () => {
        if (props.generatedSshKey?.length) {
          createNewSSHKey();
        }
      },
      { deep: true },
    );

    function generateSSHKey() {
      emit("generate", createdKey.value);
    }

    function createNewSSHKey() {
      if (createdKey.value) {
        const isNewSSHKey = ref<boolean>(props.dialogType === SSHCreationMethod.Generate);
        createdKey.value.publicKey = isNewSSHKey.value ? props.generatedSshKey || "" : sshKey.value;
        createdKey.value.name = keyName.value;
        emit("save", createdKey.value);
      }
      sshKey.value = "";
    }

    function generateUniqueSSHKeyName(depth = 0): string {
      const keyName: string = generateSSHKeyName();
      if (!props.allKeys.length) {
        return keyName;
      }

      const exists: boolean = props.allKeys.some(key => key.name === keyName);

      if (exists && depth < 100) {
        return generateUniqueSSHKeyName(depth + 1);
      }

      return keyName;
    }

    async function __loadBalance(profile?: Profile, tries = 1) {
      profile = profile || profileManager.profile!;
      if (!profile) return;

      try {
        loadingBalance.value = true;
        const grid = await getGrid(profile);
        balance.value = await loadBalance(grid!);
        loadingBalance.value = false;
      } catch {
        if (tries > 10) {
          loadingBalance.value = false;
          return;
        }

        setTimeout(() => __loadBalance(profile, tries + 1), Math.floor(Math.exp(tries) * 1_000));
      }
    }

    watch(
      () => profileManager.profile,
      profile => {
        if (profile) {
          __loadBalance(profile);
          if (interval) clearInterval(interval);
          interval = setInterval(__loadBalance.bind(undefined, profile), 1000 * 60 * 2);
        } else {
          if (interval) clearInterval(interval);
          balance.value = undefined;
        }
      },
      { immediate: true, deep: true },
    );

    function sshRules(value: any) {
      return [
        (v: any) => !!v || "SSH key is required.",
        (v: string) =>
          isValidSSHKey(v) ||
          "The SSH key you provided is not valid. Please double-check that it is copied correctly and follows the correct format.",
      ];
    }

    return {
      keyName,
      createdKey,
      hasEnoughBalance,
      sshKey,
      SSHCreationMethod,

      generateUniqueSSHKeyName,
      createNewSSHKey,
      sshRules,
      generateSSHKey,
      isValidSSHKey,
    };
  },
});
</script>

<style scoped>
.custom-toolbar {
  height: 2.5rem !important;
  padding-left: 10px;
}
.custom-actions {
  border-top: 1px solid rgb(101 99 99);
  display: flex;
  justify-content: center;
  margin: 13px;
}
</style>
