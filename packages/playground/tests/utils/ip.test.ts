import { describe, expect, it } from "vitest";

import { ipToLong, longToIp } from "../../src/utils/ip";

describe("ipToLong", () => {
  it('should convert IPv4 "0.0.0.0" to 0', () => {
    expect(ipToLong("0.0.0.0")).toBe(0n);
  });

  it('should convert IPv4 "255.255.255.255" to 4294967295', () => {
    expect(ipToLong("255.255.255.255")).toBe(4294967295n);
  });

  it('should convert IPv4 "192.168.1.1" to 3232235777', () => {
    expect(ipToLong("192.168.1.1")).toBe(3232235777n);
  });

  it('should convert IPv4 "127.0.0.1" to 2130706433', () => {
    expect(ipToLong("127.0.0.1")).toBe(2130706433n);
  });

  it("should handle invalid input gracefully", () => {
    expect(() => ipToLong("256.100.50.25")).toThrowError();
    expect(() => ipToLong("192.168.1")).toThrowError();
    expect(() => ipToLong("not.an.ip")).toThrowError();
    expect(() => ipToLong("001.002.003.004")).toThrowError();
  });
});
describe("longToIp", () => {
  it('should convert 0 to "0.0.0.0"', () => {
    expect(longToIp(0)).toBe("0.0.0.0");
  });

  it('should convert 4294967295 to "255.255.255.255"', () => {
    expect(longToIp(4294967295)).toBe("255.255.255.255");
  });

  it('should convert 3232235777 to "192.168.1.1"', () => {
    expect(longToIp(3232235777)).toBe("192.168.1.1");
  });

  it('should convert 2130706433 to "127.0.0.1"', () => {
    expect(longToIp(2130706433)).toBe("127.0.0.1");
  });

  it('should convert 4194308 to "1.2.3.4"', () => {
    expect(longToIp(4194308)).toBe("0.64.0.4");
  });

  it('should convert 2886729728 to "172.16.0.0"', () => {
    expect(longToIp(2886729728)).toBe("172.16.0.0");
  });

  it("should correctly convert long to ip", () => {
    const ip = "192.168.1.1";
    const long = 3232235777;
    expect(longToIp(long)).toBe(ip);
  });
});
