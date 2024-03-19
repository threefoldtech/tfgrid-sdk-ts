<template>
  <v-dialog v-model="$props.open" max-width="750">
    <template v-slot:default>
      <v-card>
        <v-toolbar color="primary" class="custom-toolbar">
          <p class="mb-5">Import an exact SSH Key</p>
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

          <input-tooltip
            class="mt-4"
            width="500"
            location="top right"
            #="{ props }"
            tooltip="This key will be used for authentication when accessing remote servers securely via SSH protocol."
          >
            <CopyInputWrapper :data="$props.generatedSshkey" #="{ props: copyInputProps }">
              <v-textarea
                hide-details="auto"
                v-model.trim="userSSHKey"
                no-resize
                :readonly="!hasEnoughBalance || sshCreationMethod === SSHCreationMethod.new"
                :label="sshCreationMethod === SSHCreationMethod.new ? 'Generated public ssh key' : 'Public ssh key'"
                v-bind="{ ...props, ...copyInputProps }"
              >
              </v-textarea>
            </CopyInputWrapper>
          </input-tooltip>

          <v-alert v-if="sshCreationMethod == SSHCreationMethod.new" type="info" class="mt-4">
            We will not keep your private key information. Be sure to save the private key downloaded after creation.
          </v-alert>

          <div class="import" v-else>
            <v-switch
              color="primary"
              v-model="setKeyActive"
              :label="setKeyActive ? 'Active' : 'Inactive'"
              hide-details
              inset
            ></v-switch>
          </div>
        </v-card-text>

        <v-card-actions class="mb-3">
          <v-spacer></v-spacer>
          <div class="mr-4">
            <v-btn color="white" variant="outlined" text="Close" @click="$emit('close')"></v-btn>
            <v-btn color="secondary" variant="outlined" text="Save" @click="createNewSSHKey"></v-btn>
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
import { Balance, getGrid, loadBalance } from "@/utils/grid";
import { isEnoughBalance } from "@/utils/helpers";
import { generateSSHKeyName } from "@/utils/strings";

export default defineComponent({
  emits: ["close", "save", "generate"],
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    allKeys: {
      type: Object as PropType<SSHKeyData[]>,
      required: true,
    },
    generatedSshkey: {
      type: String,
      required: true,
    },
  },

  setup(props, { emit }) {
    const profileManager = useProfileManager();
    const sshCreationMethod = ref<SSHCreationMethod>(SSHCreationMethod.new);
    const userSSHKey = ref<string>(props.generatedSshkey);
    const fingerPrint = ref<string>("");
    const keyName = ref<string>(generateUniqueSSHKeyName());
    const createdKey = ref<SSHKeyData | null>(null); // Initialize createdKey with null
    const balance = ref<Balance>();
    const hasEnoughBalance = computed(() => isEnoughBalance(balance.value, 0.01));
    const loadingBalance = ref<boolean>(false);
    const setKeyActive = ref<boolean>(true);
    let interval: any;

    watch(
      sshCreationMethod,
      () => {
        if (sshCreationMethod.value === SSHCreationMethod.import) {
          userSSHKey.value = "";
        } else {
          userSSHKey.value = props.generatedSshkey;
        }
      },
      { deep: true },
    );

    watch(
      () => props.open,
      isOpen => {
        if (isOpen) {
          const now = new Date();
          const lastID = props.allKeys.length ? props.allKeys[props.allKeys.length - 1].id : 1;

          keyName.value = generateUniqueSSHKeyName();
          createdKey.value = {
            id: lastID + 1,
            key: "",
            activating: false,
            createdAt: `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`,
            deleting: false,
            fingerPrint: fingerPrint.value,
            name: keyName.value.length === 0 ? generateUniqueSSHKeyName() : keyName.value,
            isActive: true,
          };
        }
      },
      { deep: true },
    );

    function createNewSSHKey() {
      if (createdKey.value) {
        emit("save", createdKey.value);
      }
    }

    function generateUniqueSSHKeyName(depth = 0): string {
      const keyName: string = generateSSHKeyName();
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

    return {
      fingerPrint,
      keyName,
      createdKey,
      sshCreationMethod,
      SSHCreationMethod,
      hasEnoughBalance,
      userSSHKey,
      setKeyActive,

      generateUniqueSSHKeyName,
      createNewSSHKey,
    };
  },
});
</script>

<style scoped>
.custom-toolbar {
  height: 2.5rem !important;
  padding-left: 10px;
}
</style>
