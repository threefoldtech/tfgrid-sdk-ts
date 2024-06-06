import { type ComputedRef, inject, provide, type Ref, ref } from "vue";

import type { InputValidatorService } from "./input_validator";

export enum ValidatorStatus {
  Valid = "VALID",
  Invalid = "INVALID",
  Pending = "PENDING",
  Init = "INIT",
}

export interface FormValidatorService {
  register(uid: string, service: InputValidatorService): void;
  updateStatus(uid: string, status: ValidatorStatus): void;
  validate(): Promise<boolean>;
  unregister(uid: string): void;
  reset(): void;
  get(name: string): InputValidatorService | undefined;
  valid: ComputedRef<boolean>;
  invalid: ComputedRef<boolean>;
  pending: ComputedRef<boolean>;
  validOnInit: boolean;
  inputs: ComputedRef<InputValidatorService[]>;
}

export const formValidatorKey = Symbol("form:validator");

export function provideForm(obj: FormValidatorService) {
  provide(formValidatorKey, obj);
}

export function useForm(): FormValidatorService | null {
  return inject(formValidatorKey, null);
}

export function useFormRef(): Ref<FormValidatorService>;
export function useFormRef(isArray: true): Ref<FormValidatorService[]>;
export function useFormRef(isArray?: true) {
  return isArray ? (ref([]) as Ref<FormValidatorService[]>) : (ref() as Ref<FormValidatorService>);
}
