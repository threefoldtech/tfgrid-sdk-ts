<template>
  <v-dialog v-model="$props.open" max-width="600">
    <template v-slot:default>
      <v-card title="Generate New SSH Keys">
        <v-card-text>
          <v-text-field
            v-model="keyName"
            label="name"
            hint="An optional field to provide a label or identifier for the key."
          />

          <v-text-field
            v-model="fingerPrint"
            label="fingerprint"
            hint="An optional field to provide a label or identifier for the key."
          />
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
import { defineComponent, PropType, ref } from "vue";

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

  methods: {
    createNewSSHKey() {
      const now = new Date();
      const key: SSHKeyData = {
        key: "",
        activating: false,
        createdAt: `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`,
        lastUsed: "-",
        deleting: false,
        fingerPrint: this.fingerPrint,
        name: this.keyName,
        id: 1,
        isActive: true,
      };
      this.$emit("save", key);
    },
  },

  setup(props) {
    function generateUniqueSSHKeyName(depth = 0) {
      const keyName: string = generateSSHKeyName();
      const exists: boolean = props.allKeys.some(key => key.name === keyName);

      if (exists) {
        return generateUniqueSSHKeyName(depth + 1);
      }

      return keyName;
    }
    const fingerPrint = ref<string>("");
    const keyName = ref<string>(generateUniqueSSHKeyName());

    return { fingerPrint, keyName };
  },
});
</script>
