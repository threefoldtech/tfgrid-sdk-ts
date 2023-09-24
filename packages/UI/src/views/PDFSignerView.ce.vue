<template>
  <PDFSignerComponent pdfurl dest network />
</template>

<script lang="ts">
import { ref } from "vue";

import PDFSignerComponent from "../components/PDFSignerViewComponent.vue";
export default {
  name: "TFPDFSignerView",
  components: {
    PDFSignerComponent,
  },
  setup() {
    const pdfurl = ref<string>();
    const dest = ref<string>();
    const network = ref<string>();
    return {
      PDFSignerComponent,
      pdfurl,
      dest,
      network,
    };
  },
};
</script>
