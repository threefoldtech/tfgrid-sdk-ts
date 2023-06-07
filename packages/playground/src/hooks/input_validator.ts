import { type Ref, ref } from "vue";

import type { ValidatorStatus } from "./form_validator";

export interface InputValidatorService {
  validate(): Promise<boolean>;
  setStatus(newStatus: ValidatorStatus): void;
}

export function useInputRef(isArray: true): Ref<InputValidatorService[]>;
export function useInputRef(): Ref<InputValidatorService>;
export function useInputRef(isArray = false) {
  return isArray ? (ref([]) as Ref<InputValidatorService[]>) : (ref() as Ref<InputValidatorService>);
}
