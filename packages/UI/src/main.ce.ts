import { defineCustomElement } from "vue";

import PDFSignerView from "./views/PDFSignerView.ce.vue";

const PDFSignerComponent = defineCustomElement(PDFSignerView);

customElements.define("pdf-signer", PDFSignerComponent);
