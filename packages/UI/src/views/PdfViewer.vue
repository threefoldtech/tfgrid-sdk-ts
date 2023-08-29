<template>
  <pdf-form />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import PdfForm from "../components/pdf/PdfForm.vue";
export default defineComponent({
  components: {
    PdfForm,
  },

  data() {
    return {
      pdfLink: "https://www.orimi.com/pdf-test.pdf",
      pdfLoaded: false,
    };
  },

  methods: {
    loadPdf() {
      this.pdfLoaded = true;
      console.log(`Loaded PDF from: ${this.pdfLink}`);
    },
  },
});
</script>
