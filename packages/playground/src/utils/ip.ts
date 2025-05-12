export function ipToLong(ip: string): bigint {
  const octets = ip.split(".");

  if (octets.length !== 4) {
    throw new Error(`Invalid IP address: ${ip}`);
  }

  let long = BigInt(0);

  for (const octet of octets) {
    const num = Number(octet);

    if (isNaN(num) || num < 0 || num > 255 || String(num) !== octet) {
      throw new Error(`Invalid IP address: ${ip}`);
    }

    long = (long << BigInt(8)) + BigInt(num);
  }

  return long;
}

export function longToIp(long: bigint | number): string {
  const bigLong = typeof long === "number" ? BigInt(long) : BigInt(long);

  const octet1 = (bigLong >> BigInt(24)) & BigInt(255);
  const octet2 = (bigLong >> BigInt(16)) & BigInt(255);
  const octet3 = (bigLong >> BigInt(8)) & BigInt(255);
  const octet4 = bigLong & BigInt(255);

  return `${Number(octet1)}.${Number(octet2)}.${Number(octet3)}.${Number(octet4)}`;
}
