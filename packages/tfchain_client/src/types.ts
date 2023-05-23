import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { ISubmittableResult } from "@polkadot/types/types";

export interface PublicIp {
  ip: string;
  gateway: string;
  contractId: number;
}

export interface PatchExtrinsicOptions<T> {
  map?: (value: unknown) => T;
  resultSections?: string[];
  resultEvents?: string[];
}
export type Extrinsic = SubmittableExtrinsic<"promise", ISubmittableResult>;
export type ExtrinsicResult<T> = Extrinsic & { apply(): Promise<T>; resultEvents: string[]; resultSections: string[] };
export type validatorFunctionType = (eventData: unknown) => boolean;
