<template>
  <div class="form">
    <PDFSignerViewComponent :pdf-url="props.pdfUrl" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";

import PDFSignerViewComponent from "../components/PDFSignerViewComponent.vue";
const props = defineProps<{ pdfUrl: string }>();

onMounted(() => {
  console.log("props.pdfUrl: ", props.pdfUrl);
});
</script>

<script lang="ts">
export default {
  name: "PDFSignerView",
};
</script>
