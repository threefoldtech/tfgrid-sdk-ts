import type { App, Component } from "vue";

import CopyInputWrapper from "../components/copy_input_wrapper.vue";
import DTabs from "../components/dynamic_tabs.vue";
import FormValidator from "../components/form_validator.vue";
import InputTooltip from "../components/input_tooltip.vue";
import InputValidator from "../components/input_validator.vue";
import PasswordInputWrapper from "../components/password_input_wrapper.vue";
import * as validators from "../utils/validators";

const GLOBAL_COMPONENTS: { [key: string]: Component } = {
  InputValidator,
  FormValidator,
  PasswordInputWrapper,
  CopyInputWrapper,
  DTabs,
  InputTooltip,
};
export function useGlobals(): any {
  return (app: App<any>) => {
    app.config.globalProperties.validators = validators;

    for (const key in GLOBAL_COMPONENTS) {
      app.component(key, GLOBAL_COMPONENTS[key]);
    }
  };
}
