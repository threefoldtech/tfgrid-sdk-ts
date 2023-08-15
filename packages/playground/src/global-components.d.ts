import ViewLayout from "./components/view_layout.vue";
import WebletLayout from "./components/weblet_layout.vue";

declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    WebletLayout: typeof WebletLayout;
    ViewLayout: typeof ViewLayout;
  }
}
