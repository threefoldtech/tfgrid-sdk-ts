<template>
  <PDFSignerViewComponent pdfurl dest />
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
    return {
      PDFSignerViewComponent,
      pdfurl,
      dest,
    };
  },
};
</script>
