import { describe, expect, it } from "vitest";

import { IsAlphaExpectDashAndUnderscore } from "../../../src/utils/validators";

const validator = IsAlphaExpectDashAndUnderscore("Username should consist of letters, dashs and underscores only.");

describe("IsAlphaExpectDashAndUnderscore", () => {
  it("returns an error message for input with spaces", () => {
    const result = validator("hello world!");
    expect(result).toEqual({
      message: "Username should consist of letters, dashs and underscores only.",
      requiredTrue: true,
    });
  });

  it("returns an error message for input with special characters", () => {
    const result = validator("hello@world");
    expect(result).toEqual({
      message: "Username should consist of letters, dashs and underscores only.",
      requiredTrue: true,
    });
  });

  it("returns undefined for valid username that contains underscore", () => {
    const result = validator("hello_world");
    expect(result).toBeUndefined();
  });

  it("returns undefined for valid username that contains dash", () => {
    const result = validator("hello-world");
    expect(result).toBeUndefined();
  });

  it("returns undefined for valid username", () => {
    const result = validator("hello");
    expect(result).toBeUndefined();
  });
});
