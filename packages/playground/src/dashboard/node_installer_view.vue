<template>
  <div>
    <iframe :src="url" height="1400" width="100%"></iframe>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      url: "https://bootstrap.grid.tf/",
    };
  },
});
</script>
