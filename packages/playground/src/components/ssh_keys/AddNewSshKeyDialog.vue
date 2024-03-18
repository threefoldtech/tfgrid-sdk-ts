<template>
  <v-dialog v-model="$props.open" max-width="600">
    <template v-slot:default>
      <v-card title="Generate New SSH Keys">
        <v-card-text>
          <v-text-field label="name" hint="An optional field to provide a label or identifier for the key." />
          <v-text-field label="fingerprint" hint="An optional field to provide a label or identifier for the key." />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="white" variant="outlined" text="Close" @click="$emit('close')"></v-btn>
          <v-btn color="primary" variant="outlined" text="Save" @click="$emit('close')"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts">
import { emit } from "process";
import { defineComponent } from "vue";

export default defineComponent({
  emits: ["close"],
  props: {
    open: {
      type: Boolean,
      required: true,
    },
  },

  methods: {},

  setup() {
    return {};
  },
});
</script>
