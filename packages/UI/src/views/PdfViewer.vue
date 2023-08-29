<template>
  <pdf-form />
  <!-- <div>
    <input v-model="pdfLink" placeholder="Enter PDF Link" />
    <button @click="this.loadPdf">Load PDF</button>
    <div v-if="pdfLoaded">
      <object :data="pdfLink" type="application/pdf" width="100%" height="600">
        <p>PDF cannot be displayed.</p>
      </object>
    </div>
  </div> -->
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
