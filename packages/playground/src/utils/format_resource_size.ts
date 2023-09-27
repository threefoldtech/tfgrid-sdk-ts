/**
 * Formats the size of a resource in a human-readable format.
 * @param sizeInBytes - The size of the resource in bytes.
 * @returns A formatted string representing the size of the resource.
 * @throws Error if the sizeInBytes is undefined or negative.
 */
export default function formatResourceSize(sizeInBytes?: number): string {
  if (sizeInBytes === undefined || sizeInBytes < 0) {
    throw new Error("Invalid sizeInBytes value: " + sizeInBytes);
  }

  const units = [
    { value: 1 << 30, label: "GB" },
    { value: 1 << 40, label: "TB" },
    { value: 1 << 50, label: "PB" },
  ];

  for (const unit of units) {
    if (sizeInBytes < unit.value) {
      const sizeInUnit = sizeInBytes / (unit.value / 1024);
      return `${sizeInUnit.toFixed(2)} ${unit.label}`;
    }
  }

  const largestUnit = units[units.length - 1];
  const sizeInLargestUnit = sizeInBytes / (largestUnit.value / 1024);
  return `${sizeInLargestUnit.toFixed(2)} ${largestUnit.label}`;
}
