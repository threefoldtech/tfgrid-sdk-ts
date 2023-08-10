import { IP6 } from "../../src/portal/lib/ips";

test("IP6 contains", () => {
  const ip6Range = new IP6("2001:db8::/64");
  expect(ip6Range.contains("2001:db8::1")).toBe(true);
  expect(ip6Range.contains("2001:db8:1234::1")).toBe(false);
});
test("IP expand", () => {
  const ip6Range = new IP6("2001:db8::/64"); // Creating an IP range with a /64 mask
  expect(ip6Range.expandIPv6("2001:db8::")).toBe("2001:0db8:0000:0000:0000:0000:0000:0000");
  expect(ip6Range.expandIPv6("2001:db8::1")).toBe("2001:0db8:0000:0000:0000:0000:0000:0001");
  expect(ip6Range.expandIPv6("2001:db8:abcd::")).toBe("2001:0db8:abcd:0000:0000:0000:0000:0000");
  expect(ip6Range.expandIPv6("1::")).toBe("0001:0000:0000:0000:0000:0000:0000:0000");
  expect(ip6Range.expandIPv6("::1")).toBe("0000:0000:0000:0000:0000:0000:0000:0001");
  expect(ip6Range.expandIPv6("12::1::")).toBe("0012:0000:0001:0000:0000:0000:0000");
});
