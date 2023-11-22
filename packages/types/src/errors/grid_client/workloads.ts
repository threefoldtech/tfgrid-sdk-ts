import { BaseError } from "../base_error";
import { ErrorModules } from "../modules";

export enum Errors {
  WorkloadDeletionError,
  WorkloadDeploymentError,
}
class TFGridWorkloadError extends BaseError {
  constructor(code: number, message: string) {
    super(code, message, ErrorModules.Workloads);
  }
}

export class WorkloadDeletionError extends TFGridWorkloadError {
  constructor(message: string) {
    super(Errors.WorkloadDeletionError, message);
  }
}

export class WorkloadDeploymentError extends TFGridWorkloadError {
  constructor(message: string) {
    super(Errors.WorkloadDeploymentError, message);
  }
}
