import { Decimal } from "decimal.js";

const GB = 1024;

export default function rootFs(cpu_in_cores?: number, mem_in_mb?: number): number {
  let cu = 0;

  if (cpu_in_cores && mem_in_mb) {
    cu = new Decimal(cpu_in_cores)
      .mul(mem_in_mb)
      .divToInt(8 * GB)
      .toNumber();
  }

  return cu === 0 ? 500 / GB : 2;
}
