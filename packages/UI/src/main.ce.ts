import { defineCustomElement } from "./apiCustomElement";
import PDFSignerView from "./views/PDFSignerView.ce.vue";

customElements.define("pdf-signer", defineCustomElement(PDFSignerView, { shadowRoot: false }));
