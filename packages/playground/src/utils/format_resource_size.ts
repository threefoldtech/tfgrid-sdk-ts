/**
 * Formats the size of a resource in a human-readable format.
 * @param sizeInBytes - The size of the resource in bytes.
 * @returns A formatted string representing the size of the resource.
 */
export default function formatResourceSize(sizeInBytes?: number): string {
  if (sizeInBytes === undefined || sizeInBytes === null || isNaN(sizeInBytes) || sizeInBytes === 0) {
    return "0 Bytes";
  }

  const giga = 1024 ** 3; // One gigabyte in bytes
  const tera = 1024 ** 4; // One terabyte in bytes
  const peta = 1024 ** 5; // One petabyte in bytes

  if (sizeInBytes < giga) {
    return sizeInBytes.toString() + " Bytes";
  }

  if (sizeInBytes < tera) {
    const sizeInGB = sizeInBytes / giga;
    return sizeInGB.toFixed(2) + " GB";
  }

  if (sizeInBytes < peta) {
    const sizeInTB = sizeInBytes / tera;
    return sizeInTB.toFixed(2) + " TB";
  }

  const sizeInPB = sizeInBytes / peta;
  return sizeInPB.toFixed(2) + " PB";
}
