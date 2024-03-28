<template>
  <div class="position-relative my-6">
    <VDivider />
    <span
      class="position-absolute px-2 bg-surface"
      :style="{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }"
      v-text="$props.text"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "TextDivider",
  props: { text: String },
};
</script>
