function toByteArray(hexString: string): Uint8Array {
  const hexStringBytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    hexStringBytes[i / 2] = parseInt(hexString.slice(i, i + 2), 16);
  }
  return hexStringBytes;
}

export { toByteArray };
