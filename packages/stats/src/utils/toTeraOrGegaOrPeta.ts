export default function toTeraOrGiga(value?: string) {
  const giga = 1024 ** 3;

  if (!value) return "0";

  const val = +value;
  if (val === 0 || isNaN(val)) return "0";

  if (val < giga) return val.toString();

  let gb = val / giga;

  if (gb < 1024) return `${gb.toFixed(2)} GB`;

  gb = gb / 1024;

  if (gb < 1024) return `${gb.toFixed(2)} TB`;

  gb = gb / 1024;
  return `${gb.toFixed(2)} PB`;
}
