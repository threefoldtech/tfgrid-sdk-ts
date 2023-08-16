/* eslint-disable @typescript-eslint/no-empty-interface */
import type { GlobalTypes } from "@threefold/common";

import ViewLayout from "./components/view_layout.vue";
import WebletLayout from "./components/weblet_layout.vue";

declare module "@vue/runtime-core" {
  export interface GlobalComponents extends GlobalTypes.Components {
    WebletLayout: typeof WebletLayout;
    ViewLayout: typeof ViewLayout;
  }

  export interface ComponentCustomProperties extends GlobalTypes.Properties {}
}

declare module "vue" {
  export interface ComponentCustomProperties extends GlobalTypes.Properties {}
}

declare module "@vue/compiler-core" {
  export interface ComponentCustomProperties extends GlobalTypes.Properties {}
}

declare global {
  export interface Window {
    env: GlobalTypes.Environment;
  }
}
