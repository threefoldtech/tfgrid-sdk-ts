export default function toTera(value?: string) {
  if (!value) return "Unknown";

  const val = +value;
  if (val === 0 || isNaN(val)) return "0";

  if (val < 1e9) return val.toString();

  let gb = Math.round(val / 1e7) / 1e2;

  gb /= 10;
  gb = Math.round(gb) / 1e2;

  return `${gb} TB`;
}
