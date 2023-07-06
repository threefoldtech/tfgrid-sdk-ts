<template>
  <img v-if="src" :src="src" alt="qrcode" />
</template>

<script lang="ts">
import qrcode from "qrcode";

export default {
  name: "QrcodeGenerator",
  props: {
    data: {
      type: String,
      required: true,
    },
  },
  data() {
    return { src: "" };
  },
  async mounted() {
    this.src = await qrcode.toDataURL(this.data, { width: 250 });
  },
};
</script>
