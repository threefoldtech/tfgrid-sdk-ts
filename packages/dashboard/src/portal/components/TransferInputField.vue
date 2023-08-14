<template>
  <v-text-field :value="value" :label="label" :rules="rules" :type="type" @input="emitInput"></v-text-field>
</template>

<script>
export default {
  props: {
    amount: {
      type: [String, Number],
      required: false,
    },
    value: {
      type: [String, Number],
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
    emitInput(value) {
      this.$emit("input", value);
    },
  },
};
</script>
