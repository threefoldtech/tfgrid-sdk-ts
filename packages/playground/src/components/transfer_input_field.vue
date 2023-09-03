<template>
  <v-text-field
    :hint="hint"
    :value="value"
    :label="label"
    :type="type"
    @input="emitInput"
    :error-messages="errorMessages"
  ></v-text-field>
</template>
<script lang="ts">
export default {
  name: "TransferInputField",
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
  },

  methods: {
    emitInput(value: string) {
      this.$emit("input", value);
    },
  },
};
</script>
