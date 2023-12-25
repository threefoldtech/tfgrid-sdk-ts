import { type App, inject } from "vue";

export function useApp() {
  return inject("root:app") as App<Element>;
}
