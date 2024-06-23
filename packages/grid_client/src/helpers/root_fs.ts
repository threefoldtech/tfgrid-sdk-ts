import { Decimal } from "decimal.js";

const GB = 1024;

export interface RootFSOptions {
  /** The machine CPU, should be in cores e.g. 5 cores*/
  CPUCores: number;
  /** The machine memory, should be in megabytes e.g. 1024 or 2048 MG*/
  RAMInMegaBytes: number;
}

export default function calculateRootFs(options?: RootFSOptions): number {
  let cu = 0;

  if (options && options.CPUCores && options.RAMInMegaBytes) {
    console.log("Here", options);
    cu = new Decimal(options.CPUCores)
      .mul(options.RAMInMegaBytes)
      .divToInt(8 * GB)
      .toNumber();
  }

  return cu === 0 ? 500 / GB : 2;
}
