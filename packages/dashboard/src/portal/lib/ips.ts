/**
 * Represents an IPv4 address with CIDR notation capabilities.
 */
export class IP4 {
  private maskBits: number;
  private mask: number;
  private maskedIP: string;

  /**
   * Constructs an IP4 instance with the given IPv4 address in CIDR notation.
   * @param ip - The IPv4 address in CIDR notation (e.g., "192.168.0.1/24").
   * @throws Error if the CIDR mask is invalid.
   */
  constructor(private ip: string) {
    const [ipPart, maskPart] = ip.split("/");
    this.ip = ipPart;
    this.mask = parseInt(maskPart);
    this.maskBits = (0xffffffff << (32 - this.mask)) >>> 0;
    const selfIpBits = this.ipBits(this.ip);
    this.maskedIP = this.masked(selfIpBits).join(".");
  }

  /**
   * Converts an IPv4 address string to an array of individual IP segments and ensure each bit is within 8 bits.
   * @param ip - The IPv4 address.
   * @returns An array containing the IP segments.
   */
  private ipBits(ip: string): number[] {
    const ipSegments = ip.split(".").map(segment => parseInt(segment));
    return ipSegments.map(bit => bit & 0xff);
  }

  /**
   * Applies the stored mask bits to the provided IPv4 segments.
   *
   * This method performs a bitwise AND operation between each segment of the IPv4 address
   * and the corresponding mask bits. The mask bits are shifted to the right by a certain
   * amount to align with the current segment, ensuring that only the relevant bits are retained.
   *
   * The bitwise AND operation with shifted mask bits effectively masks out the unwanted bits
   * in each segment, following the CIDR notation. This process is essential for isolating
   * the network portion of the address and applying the subnet mask effectively.
   *
   * @param ipBits - The IPv4 segments to be masked.
   * @returns The masked IPv4 segments after applying the bitwise AND operation.
   */
  private masked(ipBits: number[]): number[] {
    return ipBits.map((bit, index) => bit & (this.maskBits >>> (24 - index * 8)));
  }
  /**
   * Checks if the provided IPv4 address falls within the CIDR range of this instance.
   * @param ipToCheck - The IPv6 address to check.
   * @returns True if the address is within the CIDR range, otherwise false.
   */
  contains(ipToCheck: string): boolean {
    const ipToCheckBits = this.ipBits(ipToCheck);
    const maskedIpToCheck = this.masked(ipToCheckBits);

    return maskedIpToCheck.join(".") === this.maskedIP;
  }
}

/**
 * Represents an IPv6 address with CIDR notation capabilities.
 */
export class IP6 {
  private ip: string;
  private mask: number;
  private maskedIp: string;

  /**
   * Constructs an IP6 instance with the given IPv6 address in CIDR notation.
   * @param ip - The IPv6 address in CIDR notation (e.g., "2001:db8::1/64").
   * @throws Error if the CIDR mask is invalid.
   */
  constructor(ip: string) {
    const [ipPart, maskPart] = ip.split("/");
    if (+maskPart > 128) {
      throw new Error("CIDR mask can't be higher than 128");
    }
    this.ip = this.expandIPv6(ipPart);
    this.mask = parseInt(maskPart);
    const cidrIpValue = BigInt(`0x${this.ip.replace(/:/g, "")}`);
    this.maskedIp = (cidrIpValue & this.asBitmask()).toString(16);
  }

  /**
   * Calculates the bitmask based on the stored mask value.
   *
   * The bitmask is a binary value that represents the network portion of an IPv6 address
   * according to the CIDR mask value. If the CIDR mask is 0, the entire address space is
   * treated as the network. Otherwise, the bitmask is calculated by creating a value where
   * the first `(128 - mask)` bits are 1 and the remaining `mask` bits are 0, effectively
   * isolating the network portion.
   *
   * @returns The bitmask as a BigInt.
   */
  private asBitmask(): bigint {
    if (this.mask === 0) {
      return BigInt("0xffffffffffffffffffffffffffffffff");
    } else {
      return ~(BigInt(2) ** BigInt(128 - this.mask) - BigInt(1));
    }
  }

  /**
   * Expands an abbreviated IPv6 address to its full form.
   * @param ip - The abbreviated IPv6 address.
   * @returns The expanded IPv6 address.
   */
  expandIPv6(ip: string): string {
    const parts = ip.split(":");
    // to handle edge case starting with `::`
    let last_seen_empty = false;
    let empty_index: number | null = null;
    const expandedParts = [];
    for (const index in parts) {
      const part = parts[index];
      if (part === "") {
        if (last_seen_empty) continue;
        last_seen_empty = true;
        if (empty_index === null) {
          empty_index = +index;
        } else {
          expandedParts.splice(empty_index, 0, "0000");
          empty_index = +index;
        }
      } else {
        expandedParts.push(part.padStart(4, "0"));
        last_seen_empty = false;
      }
    }
    // the :: may include many omitted parts ex: "2001:db8::1" so here we need to add 3 section of '0000'
    const omittedParts = new Array(8 - expandedParts.length).fill("0000");
    if (empty_index !== null) expandedParts.splice(empty_index, 0, ...omittedParts);

    return expandedParts.join(":");
  }

  /**
   * Checks if the provided IPv6 address falls within the CIDR range of this instance.
   * @param ipToCheck - The IPv6 address to check.
   * @returns True if the address is within the CIDR range, otherwise false.
   */
  contains(ipToCheck: string): boolean {
    const maskBits = this.asBitmask();

    const ipValue = BigInt(`0x${this.expandIPv6(ipToCheck).replace(/:/g, "")}`);
    const cidrIpValue = BigInt(`0x${this.maskedIp}`);

    return (ipValue & maskBits) === cidrIpValue;
  }
}
