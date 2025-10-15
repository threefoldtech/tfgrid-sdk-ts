import { describe, expect, it } from "vitest";

import { extractDomainIP, getDeploymentIps } from "../../src/utils/gateway";

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

describe("getDeploymentIps", () => {
  it("should return an empty array for a deployment with no IPs", () => {
    const deployment = {};
    const ips = getDeploymentIps(deployment);
    expect(ips).toEqual([]);
  });

  it("should extract interface IPs", () => {
    const deployment = {
      interfaces: [
        { network: "network1", ip: "10.1.1.2" },
        { network: "network2", ip: "10.1.2.3" },
      ],
    };
    const ips = getDeploymentIps(deployment);
    expect(ips).toEqual(["10.1.1.2", "10.1.2.3"]);
  });

  it("should extract public IPv4 address", () => {
    const deployment = {
      publicIP: {
        ip: "185.206.122.35/24",
      },
    };
    const ips = getDeploymentIps(deployment);
    expect(ips).toEqual(["185.206.122.35"]);
  });

  it("should extract public IPv6 address", () => {
    const deployment = {
      publicIP: {
        ip6: "2001:0db8:85a3::8a2e:0370:7334/64",
      },
    };
    const ips = getDeploymentIps(deployment);
    expect(ips).toEqual(["2001:0db8:85a3::8a2e:0370:7334"]);
  });

  it("should extract both IPv4 and IPv6 from publicIP", () => {
    const deployment = {
      publicIP: {
        ip: "185.206.122.35/24",
        ip6: "2001:0db8:85a3::8a2e:0370:7334/64",
      },
    };
    const ips = getDeploymentIps(deployment);
    expect(ips).toEqual(["185.206.122.35", "2001:0db8:85a3::8a2e:0370:7334"]);
  });

  it("should extract planetary IP", () => {
    const deployment = {
      planetary: "300:e280:c0de:e8f4:dc2d:839d:850f:d2c8",
    };
    const ips = getDeploymentIps(deployment);
    expect(ips).toEqual(["300:e280:c0de:e8f4:dc2d:839d:850f:d2c8"]);
  });

  it("should extract mycelium IP", () => {
    const deployment = {
      myceliumIP: "4d3:ecb6:f6ae:ec26:d15d:1dc4:d8fe:5271",
    };
    const ips = getDeploymentIps(deployment);
    expect(ips).toEqual(["4d3:ecb6:f6ae:ec26:d15d:1dc4:d8fe:5271"]);
  });

  it("should extract all types of IPs from a complete deployment", () => {
    const deployment = {
      interfaces: [{ network: "network1", ip: "10.1.1.2" }],
      publicIP: {
        ip: "185.206.122.35/24",
        ip6: "2001:0db8:85a3::8a2e:0370:7334/64",
      },
      planetary: "300:e280:c0de:e8f4:dc2d:839d:850f:d2c8",
      myceliumIP: "4d3:ecb6:f6ae:ec26:d15d:1dc4:d8fe:5271",
    };
    const ips = getDeploymentIps(deployment);
    expect(ips).toEqual([
      "10.1.1.2",
      "185.206.122.35",
      "2001:0db8:85a3::8a2e:0370:7334",
      "300:e280:c0de:e8f4:dc2d:839d:850f:d2c8",
      "4d3:ecb6:f6ae:ec26:d15d:1dc4:d8fe:5271",
    ]);
  });

  it("should handle interfaces with missing ip field", () => {
    const deployment = {
      interfaces: [{ network: "network1", ip: "10.1.1.2" }, { network: "network2" }],
    };
    const ips = getDeploymentIps(deployment);
    expect(ips).toEqual(["10.1.1.2"]);
  });

  it("should handle publicIP with only gateway information", () => {
    const deployment = {
      publicIP: {
        gateway: "185.206.122.1",
      },
    };
    const ips = getDeploymentIps(deployment);
    expect(ips).toEqual([]);
  });

  it("should handle empty interfaces array", () => {
    const deployment = {
      interfaces: [],
    };
    const ips = getDeploymentIps(deployment);
    expect(ips).toEqual([]);
  });

  it("should handle null/undefined values gracefully", () => {
    const deployment = {
      interfaces: null,
      publicIP: null,
      planetary: undefined,
      myceliumIP: null,
    };
    const ips = getDeploymentIps(deployment);
    expect(ips).toEqual([]);
  });

  it("should strip CIDR notation from IP addresses", () => {
    const deployment = {
      publicIP: {
        ip: "192.168.1.1/32",
        ip6: "fe80::1/128",
      },
    };
    const ips = getDeploymentIps(deployment);
    expect(ips).toEqual(["192.168.1.1", "fe80::1"]);
  });

  it("should handle multiple interfaces with the same network", () => {
    const deployment = {
      interfaces: [
        { network: "network1", ip: "10.1.1.2" },
        { network: "network1", ip: "10.1.1.3" },
        { network: "network2", ip: "10.1.2.2" },
      ],
    };
    const ips = getDeploymentIps(deployment);
    expect(ips).toEqual(["10.1.1.2", "10.1.1.3", "10.1.2.2"]);
  });
});
