import {
  ActivationMonitor,
  GraphQLMonitor,
  GridProxyMonitor,
  RMBMonitor,
  ServiceUrlManager,
  StatsMonitor,
  TFChainMonitor,
} from "@threefold/monitoring";
import { marked } from "marked";
import { type App, type Component, defineAsyncComponent } from "vue";

import CopyInputWrapper from "./components/copy_input_wrapper.vue";
import Filters from "./components/filter.vue";
import FormValidator from "./components/form_validator.vue";
import InputTooltip from "./components/input_tooltip.vue";
import InputValidator from "./components/input_validator.vue";
import TfSelectCountry from "./components/node_selector/select_location_internals/TfSelectCountry.vue";
import TfSelectRegion from "./components/node_selector/select_location_internals/TfSelectRegion.vue";
import PasswordInputWrapper from "./components/password_input_wrapper.vue";
import ViewLayout from "./components/view_layout.vue";
import * as validators from "./utils/validators";

const GLOBAL_COMPONENTS: { [key: string]: Component } = {
  PasswordInputWrapper,
  WebletLayout: defineAsyncComponent(() => import("./components/weblet_layout.vue")),
  CopyInputWrapper,
  DTabs: defineAsyncComponent(() => import("./components/dynamic_tabs.vue")),
  InputValidator,
  FormValidator,
  ViewLayout,
  InputTooltip,
  Filters,
  TfSelectionDetails: defineAsyncComponent(() => import("./components/node_selector/TfSelectionDetails.vue")),
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
  const { GRIDPROXY_STACKS, GRAPHQL_STACKS, STATS_STACKS, RELAY_STACKS, SUBSTRATE_STACKS, ACTIVATION_SERVICE_STACKS } =
    window.env;
  const urlManger = new ServiceUrlManager({
    services: [
      { URLs: GRIDPROXY_STACKS, service: new GridProxyMonitor() },
      { URLs: GRAPHQL_STACKS, service: new GraphQLMonitor() },
      { URLs: STATS_STACKS, service: new StatsMonitor() },
      { URLs: SUBSTRATE_STACKS, service: new TFChainMonitor() },
      { URLs: ACTIVATION_SERVICE_STACKS, service: new ActivationMonitor() },
    ],
    silent: true,
  });
  const result = await urlManger.getAvailableServicesStack();

  // if (result.TFChain) {
  //   result.RMB = await urlManger.getAvailableStack(
  //     RELAY_STACKS,
  //     new RMBMonitor({
  //       chainUrl: result.TFChain,
  //       mnemonics: "",
  //       keypairType: "sr25519",
  //     }),
  //   );
  // }
  // result.test = null;
  if (Object.values(result).includes(null)) {
    window.$$showMonitorError(result);
    return false;
  }
  const { GridProxy, Stats, TFChain, GraphQl, Activation, RMB } = result;

  window.env.GRIDPROXY_URL = GridProxy!;
  window.env.STATS_URL = Stats!;
  window.env.GRAPHQL_URL = GraphQl!;
  window.env.SUBSTRATE_URL = TFChain!;
  window.env.ACTIVATION_SERVICE_URL = Activation!;
  window.env.RELAY_DOMAIN = "wss://relay.dev.grid.tf"!;

  await new Promise(r => setTimeout(r, 3000));

  return true;
}
