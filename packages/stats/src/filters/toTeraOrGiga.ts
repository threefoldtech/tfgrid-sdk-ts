export default function toTeraOrGiga(value?: string) {
  const giga = 1024 ** 3;

  if (!value) return "0";

  const val = +value;
  if (val === 0 || isNaN(val)) return "0";

  if (val < giga) return val.toString();

  let storageUnit = val / giga;

  if (storageUnit < 1024) return `${storageUnit.toFixed(0)} GB`;

  storageUnit = storageUnit / 1024;

  if (storageUnit < 1024) return `${storageUnit.toFixed(0)} TB`;

  storageUnit = storageUnit / 1024;
  return `${storageUnit.toFixed(0)} PB`;
}
