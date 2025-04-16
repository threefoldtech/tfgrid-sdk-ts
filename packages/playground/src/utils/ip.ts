export function ipToLong(ip: string): number {
  const octets = ip.split(".");

  // Check for invalid format (must have exactly 4 octets)
  if (octets.length !== 4) {
    throw new Error(`Invalid IP address: ${ip}`);
  }

  let long = 0;

  for (const octet of octets) {
    // Convert each octet from string to number and validate
    const num = Number(octet);

    // Validation checks for octet
    if (isNaN(num) || num < 0 || num > 255 || String(num) !== octet) {
      throw new Error(`Invalid IP address: ${ip}`);
    }

    // Build the long integer representation
    long = (long << 8) + num;
  }

  return long >>> 0; // Return the result as an unsigned integer
}

export function longToIp(long: number): string {
  // Ensure that the input long number is within the valid range for an IPv4 address
  if (long < 0 || long > 4294967295) {
    throw new Error(`Invalid long number: ${long}`);
  }

  // Calculate each octet using bitwise operations
  const octet1 = (long >>> 24) & 255; // First octet (most significant byte)
  const octet2 = (long >>> 16) & 255; // Second octet
  const octet3 = (long >>> 8) & 255; // Third octet
  const octet4 = long & 255; // Fourth octet (least significant byte)

  // Join the octets into an IPv4 address string
  return `${octet1}.${octet2}.${octet3}.${octet4}`;
}
