<template>
  <div class="pdf-viewer">
    <div v-if="loadingPdf" class="loading">
      <div class="spinner"></div>
      <p>Loading PDF...</p>
    </div>
    <div v-else-if="isError">
      <div class="loading red-color">Error: {{ errorMessage }}</div>
    </div>
    <div v-else class="pdf-container">
      <VuePdf v-for="page in numOfPages" :key="page" :src="pdfSrc" :page="page" class="pdf-page" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { onMounted, ref } from "vue";
import { createLoadingTask, VuePdf } from "vue3-pdfjs";
import { type VuePdfPropsType } from "vue3-pdfjs/components/vue-pdf/vue-pdf-props"; // Prop type definitions can also be imported

const props = defineProps<{ pdfUrl: string }>();

const numOfPages = ref(0);
const loadingPdf = ref(false);
const isError = ref(false);
const errorMessage = ref("");

const pdfSrc = ref<VuePdfPropsType["src"]>(props.pdfUrl);

onMounted(async () => {
  loadingPdf.value = true;
  try {
    const loadingTask = createLoadingTask(pdfSrc.value);
    const pdf: PDFDocumentProxy = await loadingTask.promise;
    numOfPages.value = pdf.numPages;
  } catch (error) {
    isError.value = true;
    errorMessage.value =
      `An error occurred while loading the PDF: ${error.message}` || "An error occurred while loading the PDF.";
    console.error(error);
  } finally {
    loadingPdf.value = false; // Set loading to false when PDF is loaded or errored
  }
});
</script>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 95vh;
  justify-content: center;
}

.red-color {
  color: red;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left: 4px solid #000;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

<script lang="ts">
export default {
  name: "PDFSignerViewComponent",
};
</script>
