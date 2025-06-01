import { describe, expect, it } from "vitest";

import { calculateUpgradeBalanceNeeded } from "../../src/utils/pricing_calculator";

describe("calculateUpgradeBalanceNeeded", () => {
  // Base test: no upgrade needed
  it("should return 0 when no upgrade is needed", () => {
    expect(calculateUpgradeBalanceNeeded(100, 0, false, 0)).toBe(0);
  });

  // Base calculation test without discounts
  it("should calculate correctly with no discount and no current balance", () => {
    // Price is 100, no discount, no balance
    // 100 * 18 = 1800 + 1 = 1801 (added 1 to pass threshold)
    expect(calculateUpgradeBalanceNeeded(100, 0, true, 0)).toBe(1801);
  });

  // Bronze discount (10%)
  it("should calculate correctly with Bronze tier discount (10%)", () => {
    // Price after 10% discount = 90, original price = 100
    // 100 * 18 = 1800 + 1 = 1801
    expect(calculateUpgradeBalanceNeeded(90, 10, true, 0)).toBe(1801);
  });

  // Silver discount (20%)
  it("should calculate correctly with Silver tier discount (20%)", () => {
    // Price after 20% discount = 80, original price = 100
    // 100 * 18 = 1800 + 1 = 1801
    expect(calculateUpgradeBalanceNeeded(80, 20, true, 0)).toBe(1801);
  });

  // Test when current balance is sufficient
  it("should return 0 when current balance is sufficient", () => {
    // Price after 60% discount = 40, original price = 100
    // 100 * 18 = 1800, balance 2000 > 1800, so return 0
    expect(calculateUpgradeBalanceNeeded(40, 60, true, 2000)).toBe(0);
  });

  // Test when user balance is exactly at the threshold
  it("should return 1 when current balance is exactly at threshold", () => {
    // Price after 60% discount = 40, original price = 100
    // 100 * 18 = 1800, balance = 1800
    // Need 1 more to pass threshold
    expect(calculateUpgradeBalanceNeeded(40, 60, true, 1800)).toBe(1);
  });

  // Edge case test with small values
  it("should handle edge cases with very small TFT values", () => {
    // Price is 0.5, no discount
    // 0.5 * 18 = 9 + 1 = 10
    expect(calculateUpgradeBalanceNeeded(0.5, 0, true, 0)).toBe(10);
  });

  // Test error cases
  it("should throw error when discount is 100%", () => {
    expect(() => calculateUpgradeBalanceNeeded(100, 100, true, 0)).toThrow(
      "Discount cannot be 100% (would result in division by zero)",
    );
  });

  it("should throw error when discount is greater than 100%", () => {
    expect(() => calculateUpgradeBalanceNeeded(100, 110, true, 0)).toThrow("Discount must be between 0 and 100");
  });

  it("should throw error when discount is negative", () => {
    expect(() => calculateUpgradeBalanceNeeded(100, -10, true, 0)).toThrow("Discount must be between 0 and 100");
  });

  it("should throw error when price is negative", () => {
    expect(() => calculateUpgradeBalanceNeeded(-100, 20, true, 0)).toThrow("Price cannot be negative");
  });
});
