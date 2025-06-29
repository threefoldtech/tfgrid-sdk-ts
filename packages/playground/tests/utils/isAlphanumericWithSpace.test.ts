import { describe, expect,it } from "vitest";

import { isAlphanumericWithSpace } from "../../src/utils/validators";

describe("isAlphanumericWithSpace", () => {
  const validator = isAlphanumericWithSpace("Invalid input");

  it("should allow alphanumeric characters and spaces inside only", () => {
    expect(validator("Hello World 123")).toBeUndefined();
    expect(validator("A1 B2 C3")).toBeUndefined();
    expect(validator("abcXYZ 789")).toBeUndefined();
    expect(validator("abc 123 xyz")).toBeUndefined();
  });

  it("should not allow leading or trailing spaces, or only spaces", () => {
    expect(validator(" HelloWorld")).toEqual({ message: "Invalid input" });
    expect(validator("HelloWorld ")).toEqual({ message: "Invalid input" });
    expect(validator(" ")).toEqual({ message: "Invalid input" });
    expect(validator("")).toEqual({ message: "Invalid input" });
    expect(validator("   ")).toEqual({ message: "Invalid input" });
  });

  it("should not allow special characters", () => {
    expect(validator("Hello@World")).toEqual({ message: "Invalid input" });
    expect(validator("Test!123")).toEqual({ message: "Invalid input" });
    expect(validator("Name_123")).toEqual({ message: "Invalid input" });
    expect(validator("Dash-Here")).toEqual({ message: "Invalid input" });
  });

  it("should not allow empty string", () => {
    expect(validator("")).toEqual({ message: "Invalid input" });
  });
});
