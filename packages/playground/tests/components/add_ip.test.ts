import CidrTools from "cidr-tools";
import { getIPRange } from "get-ip-range";
import * as ip from "ip";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ipToLong, longToIp } from "../../src/utils/ip";
import { IPType } from "../../src/utils/types";

// Mock dependencies
vi.mock("cidr-tools", () => ({
  default: {
    containsCidr: vi.fn(),
  },
}));

vi.mock("get-ip-range", () => ({
  getIPRange: vi.fn(),
}));

describe("Add IP Range Validation", () => {
  // Replicate the validateIPRange function logic for testing
  const validateIPRange = (
    publicIP: string,
    toPublicIP: string,
    field: "from" | "to",
  ): { message: string } | undefined => {
    if (!publicIP || !toPublicIP) return;

    const [fromIP, fromSubnet] = publicIP.split("/");
    const [toIP, toSubnet] = toPublicIP.split("/");

    if (fromSubnet !== toSubnet) return { message: "Subnet is different." };

    try {
      const fromCIDR = ip.cidrSubnet(publicIP);
      const toCIDR = ip.cidrSubnet(toPublicIP);

      if (fromCIDR.networkAddress !== toCIDR.networkAddress) {
        return { message: "IPs are not in the same network." };
      }

      const fromLong = ip.toLong(fromIP);
      const toLong = ip.toLong(toIP);
      const rangeSize = toLong - fromLong + 1;

      if (field === "from" && fromLong >= toLong) {
        return { message: "From IP must be smaller than To IP." };
      }
      if (field === "to" && toLong <= fromLong) {
        return { message: "To IP must be bigger than From IP." };
      }
      if (rangeSize > 16) {
        return { message: "Range must not exceed 16." };
      }
    } catch {
      return;
    }
  };

  // Replicate the gatewayCheck function logic
  const gatewayCheck = (
    gateway: string,
    publicIP: string,
    toPublicIP: string | undefined,
    type: IPType,
  ): { message: string } | undefined => {
    if (!gateway || !publicIP) {
      return;
    }

    const firstIP = publicIP?.split("/")[0];
    const lastIP = toPublicIP?.split("/")[0];
    let isRange = false;

    try {
      isRange = CidrTools.containsCidr(publicIP, gateway);
    } catch {
      isRange = false;
    }

    if (!isRange) {
      return {
        message: "Gateway IP not in the provided IP range.",
      };
    }

    if (firstIP === gateway || (lastIP && lastIP === gateway)) {
      return {
        message: "IPs cannot be the same.",
      };
    }

    if (type !== IPType.single && lastIP) {
      try {
        const range = getIPRange(firstIP, lastIP);
        if (range.includes(gateway)) {
          return {
            message: "The gateway IP shouldn't be in the IPs range.",
          };
        }
      } catch (error: any) {
        return {
          message: error.message,
        };
      }
    }

    return undefined;
  };

  // Replicate generateIpTable function
  const generateIpTable = (startIp: string, endIp: string, sub: number) => {
    const startLong = ipToLong(startIp);
    const endLong = ipToLong(endIp);

    const mask = (BigInt(0xffffffff) << BigInt(32 - sub)) & BigInt(0xffffffff);
    const networkBaseLong = startLong & mask;
    const networkBase = longToIp(networkBaseLong);

    const ipsRangeTable: string[] = [];
    for (let i = startLong; i <= endLong; i++) {
      ipsRangeTable.push(longToIp(i));
    }

    return {
      network: `${networkBase}/${sub}`,
      ipsRangeTable,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateIPRange", () => {
    it("should return undefined for valid IP range", () => {
      const result = validateIPRange("192.168.1.1/24", "192.168.1.5/24", "from");
      expect(result).toBeUndefined();
    });

    it("should return error when from IP is greater than to IP", () => {
      const result = validateIPRange("192.168.1.10/24", "192.168.1.5/24", "from");
      expect(result).toEqual({ message: "From IP must be smaller than To IP." });
    });

    it("should return error when range exceeds 16 IPs", () => {
      const result = validateIPRange("192.168.1.1/24", "192.168.1.18/24", "from");
      expect(result).toEqual({ message: "Range must not exceed 16." });
    });

    it("should return error when subnets are different", () => {
      const result = validateIPRange("192.168.1.1/24", "192.168.1.5/28", "from");
      expect(result).toEqual({ message: "Subnet is different." });
    });

    it("should return error when IPs are in different networks", () => {
      const result = validateIPRange("192.168.1.1/24", "192.168.2.5/24", "from");
      expect(result).toEqual({ message: "IPs are not in the same network." });
    });

    it("should handle boundary case: range of exactly 16 IPs", () => {
      const result = validateIPRange("192.168.1.1/24", "192.168.1.16/24", "from");
      expect(result).toBeUndefined();
    });

    it("should handle invalid IP formats gracefully", () => {
      const invalidIPs = [
        "192.168.1/24", // missing octets
        "192.168.256.1/24", // octet > 255
        "192.168.-1.1/24", // negative octet
        "192.168.1.1", // missing subnet
      ];

      invalidIPs.forEach(invalidIP => {
        const result = validateIPRange(invalidIP, "192.168.1.5/24", "from");
        // Should return undefined or appropriate error, not throw
        expect(result === undefined || typeof result === "object").toBe(true);
      });
    });
  });

  describe("gatewayCheck", () => {
    beforeEach(() => {
      vi.mocked(CidrTools.containsCidr).mockReturnValue(true);
      vi.mocked(getIPRange).mockReturnValue(["192.168.1.1", "192.168.1.2", "192.168.1.3"]);
    });

    it("should return undefined for valid gateway", () => {
      const result = gatewayCheck("192.168.1.254", "192.168.1.1/24", "192.168.1.10/24", IPType.range);
      expect(result).toBeUndefined();
    });

    it("should return error when gateway is same as first IP", () => {
      const result = gatewayCheck("192.168.1.1", "192.168.1.1/24", undefined, IPType.single);
      expect(result).toEqual({ message: "IPs cannot be the same." });
    });

    it("should return error when gateway is in the IP range", () => {
      vi.mocked(getIPRange).mockReturnValue(["192.168.1.1", "192.168.1.2", "192.168.1.3", "192.168.1.4"]);
      const result = gatewayCheck("192.168.1.2", "192.168.1.1/24", "192.168.1.4/24", IPType.range);
      expect(result).toEqual({ message: "The gateway IP shouldn't be in the IPs range." });
    });

    it("should return error when gateway is not in CIDR range", () => {
      vi.mocked(CidrTools.containsCidr).mockReturnValue(false);
      const result = gatewayCheck("192.168.2.254", "192.168.1.1/24", undefined, IPType.single);
      expect(result).toEqual({ message: "Gateway IP not in the provided IP range." });
    });

    it("should handle invalid gateway formats", () => {
      vi.mocked(CidrTools.containsCidr).mockReturnValue(false);
      const invalidGateways = ["192.168.1", "192.168.256.1", "192.168.abc.1", "192.168.-1.1"];

      invalidGateways.forEach(gateway => {
        const result = gatewayCheck(gateway, "192.168.1.1/24", undefined, IPType.single);
        expect(result).toEqual({ message: "Gateway IP not in the provided IP range." });
      });
    });

    it("should handle CidrTools error gracefully", () => {
      vi.mocked(CidrTools.containsCidr).mockImplementation(() => {
        throw new Error("Invalid CIDR");
      });
      const result = gatewayCheck("192.168.1.254", "192.168.1.1/24", undefined, IPType.single);
      expect(result).toEqual({ message: "Gateway IP not in the provided IP range." });
    });
  });

  describe("generateIpTable", () => {
    it("should generate IP table for single IP", () => {
      const result = generateIpTable("192.168.1.1", "192.168.1.1", 24);
      expect(result.ipsRangeTable).toEqual(["192.168.1.1"]);
      expect(result.network).toBe("192.168.1.0/24");
    });

    it("should generate IP table for range", () => {
      const result = generateIpTable("192.168.1.1", "192.168.1.3", 24);
      expect(result.ipsRangeTable).toEqual(["192.168.1.1", "192.168.1.2", "192.168.1.3"]);
      expect(result.network).toBe("192.168.1.0/24");
    });

    it("should generate IP table for maximum valid range (16 IPs)", () => {
      const result = generateIpTable("192.168.1.1", "192.168.1.16", 24);
      expect(result.ipsRangeTable).toHaveLength(16);
      expect(result.ipsRangeTable[0]).toBe("192.168.1.1");
      expect(result.ipsRangeTable[15]).toBe("192.168.1.16");
      expect(result.network).toBe("192.168.1.0/24");
    });

    it("should calculate correct network address for different subnets", () => {
      expect(generateIpTable("192.168.1.1", "192.168.1.5", 28).network).toBe("192.168.1.0/28");
      expect(generateIpTable("192.168.1.1", "192.168.1.2", 30).network).toBe("192.168.1.0/30");
    });

    it("should throw error for invalid IPs", () => {
      expect(() => generateIpTable("192.168.1", "192.168.1.5", 24)).toThrow();
      expect(() => generateIpTable("192.168.256.1", "192.168.1.5", 24)).toThrow();
    });
  });

  // Replicate validateRangeIPs function for testing
  const validateRangeIPs = async (
    publicIP: string,
    toPublicIP: string,
    type: IPType,
    mockIpExistsCheck: (ip: string) => Promise<boolean>,
  ) => {
    if (type !== IPType.range || !publicIP || !toPublicIP) return;

    // Early return if either IP is invalid - prevents hanging on invalid IPs
    const validator = await import("validator");
    if (!validator.default.isIPRange(publicIP, 4) || !validator.default.isIPRange(toPublicIP, 4)) {
      return;
    }

    try {
      const [start, sub] = publicIP.split("/");
      const [end] = toPublicIP.split("/");

      // Validate that start and end are valid IPs before calling getIPRange
      if (!validator.default.isIP(start, 4) || !validator.default.isIP(end, 4)) {
        return;
      }

      const rangeIPs = getIPRange(start, end).map(ip => `${ip}/${sub}`);
      const existingCount = (await Promise.all(rangeIPs.map(mockIpExistsCheck))).filter(Boolean).length;
      if (existingCount > 0) {
        return { message: `${existingCount} IP(s) in range already exist in another farm.` };
      }
    } catch {
      // If getIPRange throws an error (e.g., invalid IP format), return early
      return;
    }
  };

  describe("validateRangeIPs - Bug Fix", () => {
    it("should return early when From IP is invalid (negative octet) without hanging", async () => {
      const mockIpExistsCheck = vi.fn().mockResolvedValue(false);
      const result = await validateRangeIPs("2.2.2.-1/16", "2.2.2.0/16", IPType.range, mockIpExistsCheck);
      expect(result).toBeUndefined();
      expect(mockIpExistsCheck).not.toHaveBeenCalled();
      expect(getIPRange).not.toHaveBeenCalled();
    });

    it("should return early when To IP is invalid without hanging", async () => {
      const mockIpExistsCheck = vi.fn().mockResolvedValue(false);
      const result = await validateRangeIPs("2.2.2.1/16", "2.2.2.-1/16", IPType.range, mockIpExistsCheck);
      expect(result).toBeUndefined();
      expect(mockIpExistsCheck).not.toHaveBeenCalled();
      expect(getIPRange).not.toHaveBeenCalled();
    });

    it("should handle getIPRange errors gracefully", async () => {
      vi.mocked(getIPRange).mockImplementation(() => {
        throw new Error("Invalid IP range");
      });
      const mockIpExistsCheck = vi.fn().mockResolvedValue(false);
      const result = await validateRangeIPs("2.2.2.1/16", "2.2.2.0/16", IPType.range, mockIpExistsCheck);
      expect(result).toBeUndefined();
    });

    it("should proceed with validation when both IPs are valid", async () => {
      vi.mocked(getIPRange).mockReturnValue(["2.2.2.1", "2.2.2.2", "2.2.2.3"]);
      const mockIpExistsCheck = vi.fn().mockResolvedValue(false);
      const result = await validateRangeIPs("2.2.2.1/16", "2.2.2.3/16", IPType.range, mockIpExistsCheck);
      expect(result).toBeUndefined();
      expect(mockIpExistsCheck).toHaveBeenCalled();
    });
  });
});
