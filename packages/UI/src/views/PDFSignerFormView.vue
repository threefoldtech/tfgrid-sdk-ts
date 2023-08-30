<template>
  <div class="form">
    <PDFSignerFormComponent :pdf-url="pdfUrl" />
  </div>
</template>

<script lang="ts">
import PDFSignerFormComponent from "../components/PDFSignerFormComponent.vue";

export default {
  name: "PDFSignerView",
  components: {
    PDFSignerFormComponent,
  },
  setup() {
    return {
      pdfUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
      // pdfUrl: "https://www.family-action.org.uk/content/uploads/2019/07/meals-more-recipes.pdf", // with error
    };
  },
};
</script>
