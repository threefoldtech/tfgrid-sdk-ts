import { marked } from "marked";
import type { App, Component } from "vue";

import CopyInputWrapper from "./components/copy_input_wrapper.vue";
import DTabs from "./components/dynamic_tabs.vue";
import FormValidator from "./components/form_validator.vue";
import InputTooltip from "./components/input_tooltip.vue";
import InputValidator from "./components/input_validator.vue";
import PasswordInputWrapper from "./components/password_input_wrapper.vue";
import ViewLayout from "./components/view_layout.vue";
import WebletLayout from "./components/weblet_layout.vue";
import * as validators from "./utils/validators";

const GLOBAL_COMPONENTS: { [key: string]: Component } = {
  PasswordInputWrapper,
  WebletLayout,
  CopyInputWrapper,
  DTabs,
  InputValidator,
  FormValidator,
  ViewLayout,
  InputTooltip,
};

export function defineGlobals(app: App<Element>): void {
  defineGlobalComponents(app);
  defineGlobalProps(app);

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

function defineGlobalProps(app: App<Element>) {
  app.config.globalProperties.validators = validators;
}
