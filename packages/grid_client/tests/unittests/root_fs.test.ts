import { calculateRootFileSystem } from "../../src/helpers/root_fs";

describe("Calculate the rootFS size based on the machine specs", () => {
  it("should return 2GB when the options are provided", () => {
    const options = { CPUCores: 5, RAMInMegaBytes: 2048 };
    const result = calculateRootFileSystem(options);
    expect(result).toEqual(2);
  });

  it("should return 0.48828125 when CPU cores and RAM are zero", () => {
    const options = { CPUCores: 0, RAMInMegaBytes: 0 };
    const result = calculateRootFileSystem(options);
    expect(result).toEqual(0.48828125);
  });
});
