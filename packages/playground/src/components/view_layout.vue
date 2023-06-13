<template>
  <div class="border pa-4 rounded">
    <slot></slot>

    <div class="mt-4" v-if="$slots.list">
      <slot name="list"></slot>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "ViewLayout",
};
</script>
