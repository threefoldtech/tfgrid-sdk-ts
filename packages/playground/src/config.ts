import { marked } from "marked";
import type { App, Component } from "vue";

import CopyInputWrapper from "./components/copy_input_wrapper.vue";
import DTabs from "./components/dynamic_tabs.vue";
import Filters from "./components/filter.vue";
import FormValidator from "./components/form_validator.vue";
import InputTooltip from "./components/input_tooltip.vue";
import InputValidator from "./components/input_validator.vue";
import TfSelectCountry from "./components/node_selector/select_location_internals/TfSelectCountry.vue";
import TfSelectRegion from "./components/node_selector/select_location_internals/TfSelectRegion.vue";
import TfSelectionDetails from "./components/node_selector/TfSelectionDetails.vue";
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
  Filters,
  TfSelectionDetails,
  TfSelectRegion,
  TfSelectCountry,
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
      list(body) {
        return `<ul style="list-style: none;padding: 10px;">${body}</ul>`;
      },
      blockquote(quote) {
        return `
          <blockquote class="md-blockquote">
            <p>${quote}</p>
          </blockquote>
        `;
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
  app.config.globalProperties.MANUAL_URL = window.env.MANUAL_URL;
}

export async function setGlobalEnv() {
  // const services = await urlManager.getAvailableServices();
  // if (services.graphql) window.env.GRAPHQL_URL = services.graphql;
  // if (services.gridproxy) window.env.GRIDPROXY_URL;
  // if (services.tfChain) window.env.SUBSTRATE_URL;
  // await new Promise(r => setTimeout(r, 3000));
  // if(true){
  window.$$showMonitorError({ TFChain: null, RMB: "teiahio", GridProxy: null, GraphQL: "DFAJ", Activation: "testr" });
  return false;
  return true;
  // if (Object.values(services).includes(null)) {
  //   window.$$showMonitorError(services);
  //   return false;
  // }
  return true;
}
