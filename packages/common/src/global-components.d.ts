/* eslint-disable @typescript-eslint/no-empty-interface */
import type { GlobalTypes } from "./types";

declare module "@vue/runtime-core" {
  export interface GlobalComponents extends GlobalTypes.Components {}
  export interface ComponentCustomProperties extends GlobalTypes.Properties {
    $vuetify: any;
  }
}

declare module "vue" {
  export interface ComponentCustomProperties extends GlobalTypes.Properties {
    $vuetify: any;
  }
}

declare global {
  export interface Window {
    env: GlobalTypes.Environment;
  }
}
