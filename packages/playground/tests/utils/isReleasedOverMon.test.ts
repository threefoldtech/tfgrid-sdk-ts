import { describe, expect, it } from "vitest";

import { isReleasedOverMon } from "../../src/utils/date";

describe("isReleasedOverMon", () => {
  it("return true if the releaseDate is within 30 days", () => {
    const releaseDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    expect(isReleasedOverMon(releaseDate, new Date())).toBe(true);
  });

  it("return false if the releaseDate was from more than 30 days", () => {
    const releaseDate = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000);

    expect(isReleasedOverMon(releaseDate, new Date())).toBe(false);
  });

  it("return true if releaseDate is today", () => {
    const releaseDate = new Date();
    expect(isReleasedOverMon(releaseDate, new Date())).toBe(true);
  });
});
