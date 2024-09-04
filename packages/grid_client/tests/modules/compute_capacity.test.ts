import { ComputeCapacity } from "../../src";

let computeCapacity: ComputeCapacity;

beforeEach(() => {
  computeCapacity = new ComputeCapacity();
});
describe("Compute Capacity module", () => {
  test("Compute Capacity instance is of type ComputeCapacity.", () => {
    expect(computeCapacity).toBeInstanceOf(ComputeCapacity);
  });

  test("Min values for cpu & memory.", () => {
    const cpu = 0;
    const mem = 255 * 1024 ** 2;

    const setCPU = () => (computeCapacity.cpu = cpu);
    const setMem = () => (computeCapacity.memory = mem);
    const result = () => computeCapacity.challenge();

    expect(setCPU).toThrow();
    expect(setMem).toThrow();
    expect(result).toThrow();
  });

  test("Max values for cpu & memory.", () => {
    const cpu = 33;
    const mem = 255 * 1024 ** 4;

    const setCPU = () => (computeCapacity.cpu = cpu);
    const setMem = () => (computeCapacity.memory = mem);
    const result = () => computeCapacity.challenge();

    expect(setCPU).toThrow();
    expect(setMem).toThrow();
    expect(result).toThrow();
  });

  test("cpu & memory doesn't accept decimal values.", () => {
    const cpu = 1.5;
    const mem = 1.2;

    const setCPU = () => (computeCapacity.cpu = cpu);
    const setMem = () => (computeCapacity.memory = mem);
    const result = () => computeCapacity.challenge();

    expect(setCPU).toThrow();
    expect(setMem).toThrow();
    expect(result).toThrow();
  });

  test("cpu & memory empty values.", () => {
    const result = () => computeCapacity.challenge();

    expect(result).toThrow();
  });

  test("An error should be thrown if cpu & memory negative values.", () => {
    const negative_cpu = -1;
    const negative_mem = -1;

    const setCPU = () => (computeCapacity.cpu = negative_cpu);
    const setMem = () => (computeCapacity.memory = negative_mem);
    const result = () => computeCapacity.challenge();

    expect(setCPU).toThrow();
    expect(setMem).toThrow();
    expect(result).toThrow();
  });
});
