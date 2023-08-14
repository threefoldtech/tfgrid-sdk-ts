<template>
  <v-text-field
    :hint="hint"
    :value="value"
    :label="label"
    :rules="rules"
    :type="type"
    @input="emitInput"
    :error-messages="errorMessages"
  ></v-text-field>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    amount: {
      type: [String, Number],
      required: false,
    },
    value: {
      type: [String, Number],
      required: false,
    },
    errorMessages: {
      type: String,
      required: false,
    },
    hint: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    rules: {
      type: Array,
      default: () => [],
    },
  },

  methods: {
    emitInput(value: string) {
      this.$emit("input", value);
    },
  },
});
</script>
