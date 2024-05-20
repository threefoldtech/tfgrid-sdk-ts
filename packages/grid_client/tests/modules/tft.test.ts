import Decimal from "decimal.js";

import { type GridClient, tft as TFT } from "../../src";
import { getClient } from "../client_loader";

jest.setTimeout(300000);

const mock_price = jest.fn().mockResolvedValue(0.2);

let grid: GridClient;

beforeAll(async () => {
  grid = await getClient();

  grid.tft.price = mock_price;
});

afterAll(async () => {
  jest.clearAllMocks();
  await grid.disconnect();
});

describe("Testing TFT module", () => {
  test("tft module to be instance of TFTUSDConversionService", async () => {
    expect(await grid.tft).toBeInstanceOf(TFT);
  });

  test("should convert to the correct value based on the mocked price.", async () => {
    const result = await grid.tft.convertTFTtoUSD({ amount: 5 });

    expect(mock_price).toHaveBeenCalled();
    expect(typeof result).toBe("string");
    expect(result).toBe(new Decimal(5 * 0.2).toFixed(2));
  });

  test("convertTFTtoUSD function to throw if passed a negative value.", async () => {
    await expect(async () => await grid.tft.convertTFTtoUSD({ amount: -1 })).rejects.toThrow();
  });

  test("convertUSDtoTFT function returns a valid value.", async () => {
    const usd = 1;
    const result = await grid.tft.convertUSDtoTFT({ amount: usd });

    expect(typeof result).toBe("string");
    expect(result).toEqual(new Decimal(1 / 0.2).toFixed(2));
  });

  test("convertUSDtoTFT function to throw if passed a negative value.", async () => {
    await expect(async () => await grid.tft.convertUSDtoTFT({ amount: -1 })).rejects.toThrow();
  });

  test("monthlyTFT function returns a valid value.", async () => {
    const tfts = 1;
    const result = await grid.tft.monthlyTFT({ amount: tfts });
    const expected_result = new Decimal(tfts * 24 * 30).toFixed(2);

    expect(result).toBe(expected_result);
  });

  test("monthlyTFT function throws if passed anything other than a positive value.", async () => {
    await expect(async () => await grid.tft.monthlyTFT({ amount: -1 })).rejects.toThrow();
  });

  test("yearlyTFT function returns a valid value.", async () => {
    const tfts = 1;
    const result = await grid.tft.yearlyTFT({ amount: tfts });
    const expected_result = new Decimal(+(await grid.tft.monthlyTFT({ amount: tfts })) * 12).toFixed(2);

    expect(result).toBe(expected_result);
  });

  test("yearlyTFT function throws if passed anything other than a positive value.", async () => {
    await expect(async () => grid.tft.yearlyTFT({ amount: -1 })).rejects.toThrow();
  });
});
