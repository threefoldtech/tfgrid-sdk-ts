import FormValidator from "./components/form_validator.vue";
import InputValidator from "./components/input_validator.vue";
import type { ValidatorsType } from "./utils";

export declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    InputValidator: typeof InputValidator;
    FormValidator: typeof FormValidator;
  }

  export interface ComponentCustomProperties {
    validators: ValidatorsType;
  }
}
