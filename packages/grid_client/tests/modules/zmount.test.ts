import { Zmount } from "../../src";

let zmount: Zmount;

beforeEach(() => {
  zmount = new Zmount();
});
describe("Zmount module", () => {
  test("Zmount instance is of type Zmount.", () => {
    expect(zmount).toBeInstanceOf(Zmount);
  });

  // The following tests are skipped as there's an issue w input validation. Should be returned once validation is fixed here: https://github.com/threefoldtech/tfgrid-sdk-ts/issues/2821
  test.skip("Min value for size.", () => {
    const size = 100 * 1025 ** 2;

    zmount.size = size;

    const result = () => zmount.challenge();

    expect(result).toThrow();
  });

  test.skip("Max value for size.", () => {
    const size = 100 * 1025 ** 4;

    zmount.size = size;

    const result = () => zmount.challenge();

    expect(result).toThrow();
  });

  test.skip("Size doesn't accept decimal value.", () => {
    const size = 1.5;

    zmount.size = size;

    const result = () => zmount.challenge();

    expect(result).toThrow();
  });

  test.skip("Size empty value.", () => {
    const result = () => zmount.challenge();

    expect(result).toThrow();
  });

  test.skip("Size negative value.", () => {
    const negative_size = -1;

    zmount.size = negative_size;

    const result = () => zmount.challenge();

    expect(result).toThrow();
  });
});
