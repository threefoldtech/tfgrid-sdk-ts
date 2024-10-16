<template>
  <v-dialog
    fullscreen
    :model-value="moduleValue"
    @update:model-value="handleUpdateDialog($event)"
    width="100%"
    class="w-100 h-100 d-flex justify-center align-center"
  >
    <iframe
      id="iframe"
      allowfullscreen
      style="width: 100%; height: 100%; border: none"
      src="https://ui.idenfy.com/?authToken=3FA5TFPA2ZE3LMPGGS1EGOJNJE"
      allow="camera"
    ></iframe>
  </v-dialog>
</template>
<script lang="ts">
export default {
  name: "KycVerifier",
  props: {
    moduleValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:moduleValue"],
  setup(props, { emit }) {
    const handleUpdateDialog = (event: boolean) => {
      emit("update:moduleValue", event);
    };
    return {
      handleUpdateDialog,
    };
  },
};
</script>
