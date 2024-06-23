import { Decimal } from "decimal.js";

const GB = 1024;

interface RootFSOptions {
  /** The machine CPU, should be in cores e.g. 5 cores*/
  CPUCores: number;
  /** The machine memory, should be in megabytes e.g. 1024 or 2048 MG*/
  RAMInMegaBytes: number;
}

/**
 * Calculate the root filesystem size (CU - Compute Units) based on provided options.
 *
 * This function calculates the compute units (CU) required based on the CPU cores and RAM in megabytes.
 * If both CPU cores and RAM are provided in the `options` parameter, it calculates CU by multiplying
 * the CPU cores with RAM and dividing by 8 * GB, then converting the result to an integer. If the
 * calculated CU is zero, it returns 500 / GB; otherwise, it returns 2.
 *
 * @param {RootFSOptions} [options] - Optional configuration object.
 * @param {number} [options.CPUCores] - The number of CPU cores.
 * @param {number} [options.RAMInMegaBytes] - The RAM size in megabytes.
 *
 * @returns {number} - The calculated compute units (CU) based on the provided options.
 */
function calculateRootFileSystem(options?: RootFSOptions): number {
  let cu = 0;

  if (options && options.CPUCores && options.RAMInMegaBytes) {
    cu = new Decimal(options.CPUCores)
      .mul(options.RAMInMegaBytes)
      .divToInt(8 * GB)
      .toNumber();
  }

  return cu === 0 ? 500 / GB : 2;
}

export { calculateRootFileSystem, RootFSOptions };
