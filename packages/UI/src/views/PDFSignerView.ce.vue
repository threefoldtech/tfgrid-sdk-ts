<template>
  <PDFSignerViewComponent pdfurl />
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
    return {
      PDFSignerViewComponent,
      pdfurl,
    };
  },
};
</script>
