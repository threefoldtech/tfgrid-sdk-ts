<template>
  <v-dialog v-model="$props.open" max-width="600">
    <template v-slot:default>
      <v-card title="Generate New SSH Keys">
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
            width="500"
            location="top right"
            tooltip="The fingerprint is a unique identifier generated from your SSH key's contents. It's typically displayed as a sequence of hexadecimal characters, e.g., '0a:1b:2c:3d:4e:5f:6g:7h:8i:9j'. You can find it by running 'ssh-keygen -lf <path-to-your-key>'."
          >
            <v-text-field hide-details="auto" v-model="fingerPrint" label="fingerprint" />
          </input-tooltip>
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
import { defineComponent, PropType, ref, watch } from "vue";

import { SSHKeyData } from "@/types";
import { generateSSHKeyName } from "@/utils/strings";

export default defineComponent({
  emits: ["close", "save"],
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    allKeys: {
      type: Object as PropType<SSHKeyData[]>,
      required: true,
    },
  },

  setup(props, { emit }) {
    const fingerPrint = ref<string>("");
    const keyName = ref<string>(generateUniqueSSHKeyName());
    const createdKey = ref<SSHKeyData | null>(null); // Initialize createdKey with null

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
            lastUsed: "-",
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

    return { fingerPrint, keyName, createdKey, generateUniqueSSHKeyName, createNewSSHKey };
  },
});
</script>
