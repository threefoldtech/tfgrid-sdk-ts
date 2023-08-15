import { marked } from "marked";
import type { App, Component } from "vue";

import ViewLayout from "./components/view_layout.vue";
import WebletLayout from "./components/weblet_layout.vue";

const GLOBAL_COMPONENTS: { [key: string]: Component } = {
  WebletLayout,
  ViewLayout,
};

export function defineGlobals(app: App<Element>): void {
  defineGlobalComponents(app);

  marked.use({
    renderer: {
      heading(text, level) {
        const margin = Math.max(7 - level, 3);
        return `<h${level} class="text-h${level} mb-${margin}">${text}</h${level}>`;
      },
      link(href, title, text) {
        const t = title ? `title="${title}"` : "";
        const h = `href="${href}"`;
        return `<a class="app-link" target="_blank" ${t} ${h}>${text}</a>`;
      },
    },
  });
}

function defineGlobalComponents(app: App<Element>) {
  for (const key in GLOBAL_COMPONENTS) {
    app.component(key, GLOBAL_COMPONENTS[key]);
  }
}
