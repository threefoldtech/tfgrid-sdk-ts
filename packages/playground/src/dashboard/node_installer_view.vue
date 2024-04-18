<template>
  <div>
    <iframe :src="ruta" height="1400" width="100%"></iframe>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      ruta: "https://bootstrap.grid.tf/",
    };
  },
});
</script>
