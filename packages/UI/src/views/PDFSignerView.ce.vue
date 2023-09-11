<template>
  <PDFSignerViewComponent pdfurl dest network />
</template>

<script lang="ts">
import { ref } from "vue";

import PDFSignerViewComponent from "../components/PDFSignerViewComponent.vue";
export default {
  name: "TFPDFSignerView",
  components: {
    PDFSignerViewComponent,
  },
  setup() {
    const pdfurl = ref();
    const dest = ref();
    const network = ref();
    return {
      PDFSignerViewComponent,
      pdfurl,
      dest,
      network,
    };
  },
};
</script>
