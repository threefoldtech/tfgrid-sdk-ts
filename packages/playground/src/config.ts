import type { App, Component } from "vue";

import CopyInputWrapper from "./components/copy_input_wrapper.vue";
import DTabs from "./components/dynamic_tabs.vue";
import FormValidator from "./components/form_validator.vue";
import InputValidator from "./components/input_validator.vue";
import PasswordInputWrapper from "./components/password_input_wrapper.vue";
import WebletLayout from "./components/weblet_layout.vue";
import * as validators from "./utils/validators";

const GLOBAL_COMPONENTS: { [key: string]: Component } = {
  PasswordInputWrapper,
  WebletLayout,
  CopyInputWrapper,
  DTabs,
  InputValidator,
  FormValidator,
};

export function defineGlobals(app: App<Element>): void {
  defineGlobalComponents(app);
  defineGlobalProps(app);
}

function defineGlobalComponents(app: App<Element>) {
  for (const key in GLOBAL_COMPONENTS) {
    app.component(key, GLOBAL_COMPONENTS[key]);
  }
}

function defineGlobalProps(app: App<Element>) {
  app.config.globalProperties.validators = validators;
}
