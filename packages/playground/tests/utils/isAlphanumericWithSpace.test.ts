import { describe, expect, it } from "vitest";

import { isAlphanumericWithSpace } from "../../src/utils/validators";

describe("isAlphanumericWithSpace", () => {
  const validator = isAlphanumericWithSpace("Invalid input");

  it("should allow alphanumeric characters and spaces inside only", () => {
    expect(validator("Hello World 123")).toBe(true);
    expect(validator("A1 B2 C3")).toBe(true);
    expect(validator("abcXYZ 789")).toBe(true);
    expect(validator("abc 123 xyz")).toBe(true);
  });

  it("Should allow single trailing space", () => {
    expect(validator("Hello World ")).toBe(true);
  });

  it("should not allow leading or multiple trailing spaces", () => {
    expect(validator(" HelloWorld")).toBe("Invalid input");
    expect(validator("HelloWorld  ")).toBe("Invalid input");
    expect(validator("Hello  World")).toBe("Invalid input");
  });

  it("should not allow a string with only spaces", () => {
    expect(validator(" ")).toBe("Invalid input");
    expect(validator("     ")).toBe("Invalid input");
  });

  it("should allow a single character", () => {
    expect(validator("A")).toBe(true);
    expect(validator("z")).toBe(true);
    expect(validator("1")).toBe(true);
  });
  it("should not allow special characters", () => {
    expect(validator("Hello@World")).toBe("Invalid input");
    expect(validator("Test!123")).toBe("Invalid input");
    expect(validator("Name_123")).toBe("Invalid input");
    expect(validator("Dash-Here")).toBe("Invalid input");
  });

  it("should not allow empty string", () => {
    expect(validator("")).toBe("Invalid input");
  });
});
