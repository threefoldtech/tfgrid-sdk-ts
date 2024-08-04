import { plainToClass } from "class-transformer";

import { Volume } from "../../src";

let volume: Volume;

beforeEach(() => {
  volume = new Volume();
});

describe("Test volume workload.", () => {
  test("volume should be type of Volume", () => {
    expect(volume).toBeInstanceOf(Volume);
  });
  test("should fail if passed invalid size", () => {
    const minSize = 100 * 1024 ** 1;
    const maxSize = 100 * 1024 ** 5;

    const setMinSize = () => (volume.size = minSize);
    const setMaxSize = () => (volume.size = maxSize);
    const challenge = () => volume.challenge();

    expect(setMinSize).toThrow();
    expect(setMaxSize).toThrow();
    expect(challenge).toThrow();
  });
  test("should fail if volume was assigned to an invalid parsed obj", () => {
    const invalidVolume = `{"size": "2"}`;
    const result = () => {
      volume = plainToClass(Volume, JSON.parse(invalidVolume));
    };

    expect(result).toThrow();
  });
});
