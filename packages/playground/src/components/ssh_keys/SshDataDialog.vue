<template>
  <v-dialog @keydown.esc="$emit('close')" v-model="$props.open" max-width="750">
    <template v-slot:default>
      <v-card>
        <v-toolbar color="primary" class="custom-toolbar">
          <p class="mb-5">{{ capitalize(selectedKey.name || "") }} Detials</p>
        </v-toolbar>

        <v-card-text> </v-card-text>

        <v-card-actions class="mb-3">
          <v-spacer></v-spacer>
          <div class="mr-4">
            <v-btn color="white" variant="outlined" text="Close" @click="$emit('close')"></v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts">
import { capitalize, defineComponent, PropType } from "vue";

import { SSHKeyData } from "@/types";

export default defineComponent({
  name: "SSHDataDialog",
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    selectedKey: {
      type: Object as PropType<SSHKeyData>,
      required: true,
    },
  },
  setup() {
    return {
      capitalize,
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
