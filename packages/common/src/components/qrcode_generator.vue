<template>
  <img v-if="src" :src="src" alt="qrcode" />
</template>

<script lang="ts">
import qrcode from "qrcode";
import { onMounted, onUpdated, ref } from "vue";

export default {
  name: "QrcodeGenerator",
  props: {
    data: String,
  },
  setup(props) {
    const src = ref<string | null>(null);

    onMounted(updateSrc);
    onUpdated(updateSrc);
    async function updateSrc() {
      src.value = props.data ? await qrcode.toDataURL(props.data, { width: 250 }) : null;
    }

    return { src };
  },
};
</script>
