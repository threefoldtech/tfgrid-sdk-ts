import { BaseError } from "../base_error";
import { ErrorModules } from "../modules";

export enum Errors {
  WorkloadDeleteError,
  WorkloadDeployError,
  WorkloadUpdateError,
  WorkloadCreateError,
}
class TFGridWorkloadError extends BaseError {
  constructor(name = "TFGridWorkloadError", code: number, message: string) {
    super(name, code, message, ErrorModules.Workloads);
  }
}

export class WorkloadDeleteError extends TFGridWorkloadError {
  constructor(message: string) {
    super("WorkloadDeleteError", Errors.WorkloadDeleteError, message);
  }
}

export class WorkloadDeployError extends TFGridWorkloadError {
  constructor(message: string) {
    super("WorkloadDeployError", Errors.WorkloadDeployError, message);
  }
}

export class WorkloadUpdateError extends TFGridWorkloadError {
  constructor(message: string) {
    super("WorkloadUpdateError", Errors.WorkloadUpdateError, message);
  }
}

export class WorkloadCreateError extends TFGridWorkloadError {
  constructor(message: string) {
    super("WorkloadCreateError", Errors.WorkloadCreateError, message);
  }
}
