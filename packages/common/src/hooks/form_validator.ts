import { type ComputedRef, inject, provide, type Ref, ref } from "vue";

import type { InputValidatorService } from "./input_validator";

export enum ValidatorStatus {
  Valid = "VALID",
  Invalid = "INVALID",
  Pending = "PENDING",
  Init = "INIT",
}

export interface FormValidatorService {
  register(uid: number, service: InputValidatorService): void;
  updateStatus(uid: number, status: ValidatorStatus): void;
  validate(): Promise<boolean>;
  unregister(uid: number): void;
  reset(): void;
  valid: ComputedRef<boolean>;
  invalid: ComputedRef<boolean>;
  pending: ComputedRef<boolean>;
}

export const formValidatorKey = Symbol("form:validator");

export function provideForm(obj: FormValidatorService) {
  provide(formValidatorKey, obj);
}

export function useForm(): FormValidatorService | null {
  return inject(formValidatorKey, null);
}

export function useFormRef(isArray: true): Ref<FormValidatorService[]>;
export function useFormRef(isArray: false): Ref<FormValidatorService>;
export function useFormRef(isArray = false) {
  return isArray ? (ref([]) as Ref<FormValidatorService[]>) : (ref() as Ref<FormValidatorService>);
}
