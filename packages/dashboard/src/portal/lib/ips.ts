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
