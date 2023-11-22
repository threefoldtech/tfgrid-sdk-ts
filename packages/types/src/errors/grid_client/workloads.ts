import { BaseError } from "../base_error";
import { ErrorModules } from "../modules";

export enum Errors {
  WorkloadDeleteError,
  WorkloadDeployError,
  WorkloadUpdateError,
  WorkloadCreateError,
}
class TFGridWorkloadError extends BaseError {
  constructor(code: number, message: string) {
    super(code, message, ErrorModules.Workloads);
  }
}

export class WorkloadDeleteError extends TFGridWorkloadError {
  constructor(message: string) {
    super(Errors.WorkloadDeleteError, message);
  }
}

export class WorkloadDeployError extends TFGridWorkloadError {
  constructor(message: string) {
    super(Errors.WorkloadDeployError, message);
  }
}

export class WorkloadUpdateError extends TFGridWorkloadError {
  constructor(message: string) {
    super(Errors.WorkloadUpdateError, message);
  }
}

export class WorkloadCreateError extends TFGridWorkloadError {
  constructor(message: string) {
    super(Errors.WorkloadCreateError, message);
  }
}
