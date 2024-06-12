import { Zmount } from "../../src";

let zmount: Zmount;

beforeEach(() => {
  zmount = new Zmount();
});
describe("Zmount module", () => {
  test("Zmount instance is of type Zmount.", () => {
    expect(zmount).toBeInstanceOf(Zmount);
  });

  test("Min value for size.", () => {
    const size = 100 * 1025 ** 2;

    zmount.size = size;

    const result = () => zmount.challenge();

    expect(result).toThrow();
  });

  test("Max value for size.", () => {
    const size = 100 * 1025 ** 4;

    zmount.size = size;

    const result = () => zmount.challenge();

    expect(result).toThrow();
  });

  test("Size doesn't accept decimal value.", () => {
    const size = 1.5;

    zmount.size = size;

    const result = () => zmount.challenge();

    expect(result).toThrow();
  });

  test("Size empty value.", () => {
    const result = () => zmount.challenge();

    expect(result).toThrow();
  });

  test("Size negative value.", () => {
    const negative_size = -1;

    zmount.size = negative_size;

    const result = () => zmount.challenge();

    expect(result).toThrow();
  });
});
