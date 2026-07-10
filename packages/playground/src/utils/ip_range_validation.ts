import CidrTools from "cidr-tools";
import { getIPRange } from "get-ip-range";
import * as ip from "ip";
import validator from "validator";

import { IPType } from "./types";

/**
 * Validates IP range for cross-field validation
 * @param publicIP - The "from" IP address in CIDR format
 * @param toPublicIP - The "to" IP address in CIDR format
 * @param field - Which field is being validated ("from" or "to")
 * @returns Error message object if validation fails, undefined if valid
 */
export function validateIPRange(
  publicIP: string,
  toPublicIP: string,
  field: "from" | "to",
): { message: string } | undefined {
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
}

/**
 * Validates gateway IP against the provided IP range
 * @param gateway - The gateway IP address
 * @param publicIP - The "from" IP address in CIDR format
 * @param toPublicIP - Optional "to" IP address in CIDR format (for range type)
 * @param type - IP type (single or range)
 * @returns Error message object if validation fails, undefined if valid
 */
export function gatewayCheck(
  gateway: string,
  publicIP: string,
  toPublicIP: string | undefined,
  type: IPType,
): { message: string } | undefined {
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
}

/**
 * Validates that IPs in a range don't already exist in another farm
 * @param publicIP - The "from" IP address in CIDR format
 * @param toPublicIP - The "to" IP address in CIDR format
 * @param type - IP type (single or range)
 * @param ipExistsCheck - Function to check if an IP exists
 * @returns Error message object if validation fails, undefined if valid
 */
export async function validateRangeIPs(
  publicIP: string,
  toPublicIP: string,
  type: IPType,
  ipExistsCheck: (ip: string) => Promise<boolean>,
): Promise<{ message: string } | undefined> {
  if (type !== IPType.range || !publicIP || !toPublicIP) return;

  if (!validator.isIPRange(publicIP, 4) || !validator.isIPRange(toPublicIP, 4)) {
    return;
  }

  try {
    const [start, sub] = publicIP.split("/");
    const [end] = toPublicIP.split("/");

    if (!validator.isIP(start, 4) || !validator.isIP(end, 4)) {
      return;
    }

    const rangeIPs = getIPRange(start, end).map(ip => `${ip}/${sub}`);
    const existingCount = (await Promise.all(rangeIPs.map(ipExistsCheck))).filter(Boolean).length;
    if (existingCount > 0) {
      return { message: `${existingCount} IP(s) in range already exist in another farm.` };
    }
  } catch {
    return;
  }
}
