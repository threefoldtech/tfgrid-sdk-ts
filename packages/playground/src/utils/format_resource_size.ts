/**
 * Formats the size of a resource in a human-readable format.
 * @param sizeInBytes - The size of the resource in bytes.
 * @returns A formatted string representing the size of the resource.
 */
export default function formatResourceSize(sizeInBytes?: number): string {
  if (sizeInBytes === undefined || sizeInBytes === null || isNaN(sizeInBytes) || sizeInBytes === 0) {
    return "0";
  }

  const kilo = 1024;
  const mega = 1024 ** 2;
  const giga = 1024 ** 3; // One gigabyte in bytes
  const tera = 1024 ** 4; // One terabyte in bytes
  const peta = 1024 ** 5; // One petabyte in bytes

  if (sizeInBytes < kilo) {
    return sizeInBytes.toString() + " Bytes";
  }

  if (sizeInBytes < mega) {
    const sizeInKilo = sizeInBytes / kilo;
    return toFixedTwo(sizeInKilo) + " KB";
  }

  if (sizeInBytes < giga) {
    const sizeInMega = sizeInBytes / mega;
    return toFixedTwo(sizeInMega) + " MB";
  }

  if (sizeInBytes < tera) {
    const sizeInGB = sizeInBytes / giga;
    return toFixedTwo(sizeInGB) + " GB";
  }

  if (sizeInBytes < peta) {
    const sizeInTB = sizeInBytes / tera;
    return toFixedTwo(sizeInTB) + " TB";
  }

  const sizeInPB = sizeInBytes / peta;
  return toFixedTwo(sizeInPB) + " PB";
}

function toFixedTwo(val: number) {
  return Math.floor(val * 100) / 100;
}
