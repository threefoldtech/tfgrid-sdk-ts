import type { App, Component } from "vue";

import FormValidator from "../components/form_validator.vue";
import InputValidator from "../components/input_validator.vue";
import * as validators from "../utils/validators";

const GLOBAL_COMPONENTS: { [key: string]: Component } = {
  InputValidator,
  FormValidator,
};
export function useGlobals(): any {
  return (app: App<any>) => {
    app.config.globalProperties.validators = validators;

    for (const key in GLOBAL_COMPONENTS) {
      app.component(key, GLOBAL_COMPONENTS[key]);
    }
  };
}
