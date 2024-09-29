import { describe, expect, it } from "vitest";

import { isValidSmtp } from "../../src/utils/validators";

describe("isValidSmtp", () => {
  it("returns nothing for valid username and email", () => {
    const input = "valid.username@example.com";
    expect(isValidSmtp(input)).toBeUndefined();
  });

  it("returns an error message for special characters in username", () => {
    const input = "invalid_email";
    expect(isValidSmtp(input)).toEqual({
      message: "Please provide a valid username or email",
    });
  });

  it("returns an error message for white spaces in username", () => {
    const input = "invalid username";
    expect(isValidSmtp(input)).toEqual({
      message: "Please provide a valid username or email",
    });
  });
});
