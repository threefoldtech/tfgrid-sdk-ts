import { describe, expect, it } from "vitest";

import { extractDomainIP } from "../../src/utils/gateway";

describe("extractDomainIP", () => {
  it("should extract the domain from a URL with a protocol", () => {
    const domain = extractDomainIP("https://example.com:8080");
    expect(domain).toBe("example.com");
  });

  it("should extract the IPv6 address from a URL", () => {
    const ipv6 = extractDomainIP("https://[::1]:8080");
    expect(ipv6).toBe("::1");
  });

  it("should throw an error when there is no domain or IP address", () => {
    expect(() => extractDomainIP("http://:8080")).toThrow(
      'Invalid input "http://:8080": No domain or IP address found.',
    );
  });

  it("should throw an error for invalid IPv6 format", () => {
    expect(() => extractDomainIP("https://[]:8080")).toThrow(
      'Invalid input "https://[]:8080": Invalid IPv6 address format.',
    );
  });

  it("should extract the domain from a URL without a port", () => {
    const domain = extractDomainIP("https://example.com");
    expect(domain).toBe("example.com");
  });

  it("should extract the IPv4 address from a URL", () => {
    const ipv4 = extractDomainIP("http://192.168.0.1:3000");
    expect(ipv4).toBe("192.168.0.1");
  });

  it("should handle plain domain strings without protocols", () => {
    const domain = extractDomainIP("example.com");
    expect(domain).toBe("example.com");
  });
});
