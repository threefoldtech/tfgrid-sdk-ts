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

export function longToIp(long: bigint): string {
  const max = BigInt("4294967295");
  if (long < BigInt(0) || long > max) {
    throw new Error(`Invalid long number: ${long}`);
  }

  const octet1 = Number((long >> BigInt(24)) & BigInt(255));
  const octet2 = Number((long >> BigInt(16)) & BigInt(255));
  const octet3 = Number((long >> BigInt(8)) & BigInt(255));
  const octet4 = Number(long & BigInt(255));

  return `${octet1}.${octet2}.${octet3}.${octet4}`;
}
