<template>
  <v-text-field
    v-model="internalValue"
    :label="label"
    :rules="rules"
    :type="type"
    @input="emitInput"
    @keydown="handleInput"
  ></v-text-field>
</template>

<script>
export default {
  props: {
    amount: {
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
  data() {
    return {
      internalValue: this.value,
    };
  },
  methods: {
    handleInput(event) {
      this.internalValue = event.target.value;
    },
    emitInput() {
      this.$emit("input", this.internalValue);
    },
  },
  watch: {
    value(newValue) {
      this.internalValue = newValue;
    },
  },
};
</script>
