import { defineCustomElement } from "./apiCustomElement";
import PDFSignerView from "./views/PDFSignerView.ce.vue";
import ScriptEditorView from "./views/ScriptEditorView.ce.vue";

customElements.define("pdf-signer", defineCustomElement(PDFSignerView, { shadowRoot: false }));
customElements.define("script-editor", defineCustomElement(ScriptEditorView, { shadowRoot: false }));
