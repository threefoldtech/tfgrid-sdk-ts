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
   * Masks the given IPv4 segments using the stored mask bits.
   * @param ipBits - The IPv4 segments to be masked.
   * @returns The masked IPv4 segments.
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
   * Calculates the bitmask based on the stored mask.
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
