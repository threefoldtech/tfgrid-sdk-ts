import { generateString } from "../src/helpers/utils";

describe("generateString", () => {
  test("should generate a string of the specified length", () => {
    const length = 10;
    const result = generateString(length);
    expect(result).toHaveLength(length);
  });

  test("should generate an empty string if the length is 0", () => {
    const result = generateString(0);
    expect(result).toBe("");
  });

  test("should generate unique strings for multiple calls", () => {
    const length = 5;
    const result1 = generateString(length);
    const result2 = generateString(length);
    expect(result1).not.toBe(result2);
  });

  test("should generate strings containing only lowercase letters and numbers", () => {
    const length = 8;
    const result = generateString(length);
    const isValid = /^[a-z0-9]+$/.test(result);
    expect(isValid).toBe(true);
  });
});
