import { ComputeCapacity } from "../../src";

let computeCapacity: ComputeCapacity;

beforeEach(() => {
  computeCapacity = new ComputeCapacity();
});
describe("Compute Capacity module", () => {
  test("Compute Capacity instance is of type ComputeCapacity.", () => {
    expect(computeCapacity).toBeInstanceOf(ComputeCapacity);
  });

  test.skip("Min values for cpu & memory.", () => {
    const cpu = 0;
    const mem = 255 * 1024 ** 2;

    computeCapacity.cpu = cpu;
    computeCapacity.memory = mem;

    const result = () => computeCapacity.challenge();

    expect(result).toThrow();
  });

  test.skip("Max values for cpu & memory.", () => {
    const cpu = 33;
    const mem = 255 * 1024 ** 4;

    computeCapacity.cpu = cpu;
    computeCapacity.memory = mem;

    const result = () => computeCapacity.challenge();

    expect(result).toThrow();
  });

  test.skip("cpu & memory doesn't accept decimal values.", () => {
    const cpu = 1.5;
    const mem = 1.2;

    computeCapacity.cpu = cpu;
    computeCapacity.memory = mem;

    const result = () => computeCapacity.challenge();

    expect(result).toThrow();
  });

  test.skip("cpu & memory empty values.", () => {
    const result = () => computeCapacity.challenge();

    expect(result).toThrow();
  });

  test.skip("An error should be thrown if cpu & memory negative values.", () => {
    const negative_cpu = -1;
    const negative_mem = -1;

    computeCapacity.cpu = negative_cpu;
    computeCapacity.memory = negative_mem;

    const result = () => computeCapacity.challenge();

    expect(result).toThrow();
  });
});
