export default function toTeraOrGiga(value?: string) {
  const giga = 1024 ** 3;

  if (!value) return "0";

  const val = +value;
  if (val === 0 || isNaN(val)) return "0";

  if (val < giga) return val.toString();

  let gb = val / giga;

  if (gb < 1024) return `${toDecimalTwo(gb)} GB`;

  gb = gb / 1024;

  if (gb < 1024) return `${toDecimalTwo(gb)} TB`;

  gb = gb / 1024;
  return `${toDecimalTwo(gb)} PB`;
}

function toDecimalTwo(val: number) {
  return Math.floor(val * 100) / 100;
}
