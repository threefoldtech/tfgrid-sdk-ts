export function toUTC(date: string): string {
  try {
    const d = new Date(date);
    return `${d.getUTCFullYear()}-${
      d.getUTCMonth() + 1
    }-${d.getUTCDate()} at ${d.getUTCHours()}:${d.getUTCMinutes()} UTC`;
  } catch {
    return date;
  }
}
