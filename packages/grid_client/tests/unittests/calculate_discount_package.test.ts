import { calculateDiscountPackage } from "../../src/modules/utils";

describe("calculateDiscountPackage", () => {
  const dedicatedPrice = 80;
  const sharedPrice = 100;
  it("should return 'none' for both packages when balance is insufficient", () => {
    const balance = 0;
    const result = calculateDiscountPackage(balance, dedicatedPrice, sharedPrice);
    expect(result.dedicatedPackage).toEqual("none");
    expect(result.sharedPackage).toEqual("none");
  });

  it("should return 'default' package on dedicated price only when balance is sufficient for default duration", () => {
    const balance = 130;
    const result = calculateDiscountPackage(balance, dedicatedPrice, sharedPrice);
    expect(result.dedicatedPackage).toEqual("default");
    expect(result.sharedPackage).toEqual("none");
  });

  it("should return 'default' package on both price prices", () => {
    const balance = 160; // 160 is > 80 * 1.5 && 100 * 1.5 but < 80 * 3 && 100 * 3
    const result = calculateDiscountPackage(balance, dedicatedPrice, sharedPrice);
    expect(result.dedicatedPackage).toEqual("default");
    expect(result.sharedPackage).toEqual("default");
  });

  it("should return 'bronze' package when balance is sufficient for bronze duration", () => {
    const balance = 250; // 250 is > 80 * 3 but < 100 * 3

    const result = calculateDiscountPackage(balance, dedicatedPrice, sharedPrice);

    expect(result.dedicatedPackage).toEqual("bronze");
    expect(result.sharedPackage).toEqual("default");
  });

  it("should return 'bronze' package on both price prices", () => {
    const balance = 350; // 350 is > 80 * 3 && 100 * 3 but < 80 * 6 && 100 * 6

    const result = calculateDiscountPackage(balance, dedicatedPrice, sharedPrice);

    expect(result.dedicatedPackage).toEqual("bronze");
    expect(result.sharedPackage).toEqual("bronze");
  });

  it("should return 'silver' package when balance is sufficient for silver duration", () => {
    const balance = 500; // 500 is > 80 * 6 but < 100 * 6

    const result = calculateDiscountPackage(balance, dedicatedPrice, sharedPrice);

    expect(result.dedicatedPackage).toEqual("silver");
    expect(result.sharedPackage).toEqual("bronze");
  });

  it("should return 'silver' package when balance is sufficient for silver duration", () => {

    const balance = 650; // 650 is > 80 * 6 && 100 * 6 but < 80 * 18 && 100 * 18

    const result = calculateDiscountPackage(balance, dedicatedPrice, sharedPrice);

    expect(result.dedicatedPackage).toEqual("silver");
    expect(result.sharedPackage).toEqual("silver");
  });

  it("should return 'gold' package when balance is sufficient for gold duration only for dedicated price", () => {
    const balance = 1500; // 1500 is > 80 * 18 but < 100 * 18

    const result = calculateDiscountPackage(balance, dedicatedPrice, sharedPrice);

    expect(result.dedicatedPackage).toEqual("gold");
    expect(result.sharedPackage).toEqual("silver");
  });

  it("should return 'gold' package when balance is sufficient for gold duration for both prices", () => {
    const balance = 1900; // 1900 is > 80 * 18 && 100 * 18

    const result = calculateDiscountPackage(balance, dedicatedPrice, sharedPrice);

    expect(result.dedicatedPackage).toEqual("gold");
    expect(result.sharedPackage).toEqual("gold");
  });
});
