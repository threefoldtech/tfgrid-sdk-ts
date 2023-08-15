import InputValidator from "./components/input_validator.vue";
import type { ValidatorsType } from "./utils";

export declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    InputValidator: typeof InputValidator;
  }

  export interface ComponentCustomProperties {
    validators: ValidatorsType;
  }
}
