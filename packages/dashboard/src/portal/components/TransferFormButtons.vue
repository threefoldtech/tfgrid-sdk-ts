<template>
  <v-card-actions>
    <v-spacer></v-spacer>
    <v-btn @click="clearInput" color="grey lighten-2 black--text">Clear</v-btn>
    <v-btn class="primary white--text" @click="submitForm" :loading="loadingTransfer" :disabled="!isTransferValid"
      >Submit</v-btn
    >
  </v-card-actions>
</template>

<script>
export default {
  props: {
    isTransferValid: Boolean,
    loadingTransfer: Boolean,
  },
  methods: {
    clearInput() {
      this.$emit("clear");
    },
    submitForm() {
      this.$emit("submit");
    },
  },
};
</script>
