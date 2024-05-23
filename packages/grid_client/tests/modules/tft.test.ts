import { ValidationError } from "@threefold/types";
import Decimal from "decimal.js";

import { currency, type GridClient } from "../../src";
import { getClient } from "../client_loader";

jest.setTimeout(300000);
let grid: GridClient;
let tftPrice: number;

beforeAll(async () => {
  grid = await getClient();
  tftPrice = await grid.tfclient.tftPrice.get();
  grid.currency.decimals = 5;
});

afterAll(async () => {
  await grid.disconnect();
});

describe("Testing TFT module", () => {
  test("tft module to be instance of TFTUSDConversionService", async () => {
    expect(await grid.currency).toBeInstanceOf(currency);
  });

  test("should return value with 2 decimals.", async () => {
    const result = await grid.currency.normalizeCurrency({ amount: 1 });

    expect(typeof result).toBe("string");
    expect(result).toBe(new Decimal(1).toFixed(grid.currency.decimals));
  });

  test("should convert to the correct value based on tftPrice.", async () => {
    const hourlyTFT = { amount: 1 };
    const result = await grid.currency.convertTFTtoUSD(hourlyTFT);

    expect(typeof result).toBe("string");
    expect(result).toBe(new Decimal(1 * tftPrice).toFixed(grid.currency.decimals));
  });

  test("convertTFTtoUSD function to throw if passed a negative value.", async () => {
    const result = async () => await grid.currency.convertTFTtoUSD({ amount: -1 });

    await expect(result).rejects.toThrow();
    await expect(result).rejects.toBeInstanceOf(ValidationError);
  });

  test("convertUSDtoTFT function returns a valid value.", async () => {
    const usd = 1;
    const result = await grid.currency.convertUSDtoTFT({ amount: usd });

    expect(typeof result).toBe("string");
    expect(result).toEqual(new Decimal(1 / tftPrice).toFixed(grid.currency.decimals));
  });

  test("convertUSDtoTFT function to throw if passed a negative value.", async () => {
    const result = async () => await grid.currency.convertUSDtoTFT({ amount: -1 });

    await expect(result).rejects.toThrow();
    await expect(result).rejects.toBeInstanceOf(ValidationError);
  });

  test("dailyTFT function returns a valid value.", async () => {
    const tfts = 1;
    const result = await grid.currency.dailyTFT({ amount: tfts });
    const expected_result = new Decimal(tfts * 24).toFixed(grid.currency.decimals);

    expect(typeof result).toBe("string");
    expect(result).toBe(expected_result);
  });

  test("dailyTFT function throws if passed anything other than a positive value.", async () => {
    const result = async () => await grid.currency.dailyTFT({ amount: -1 });

    expect(result).rejects.toThrow();
    expect(result).rejects.toBeInstanceOf(ValidationError);
  });

  test("monthlyTFT function returns a valid value.", async () => {
    const tfts = 1;
    const result = await grid.currency.monthlyTFT({ amount: tfts });
    const expected_result = new Decimal(tfts * 24 * 30).toFixed(grid.currency.decimals);

    expect(typeof result).toBe("string");
    expect(result).toBe(expected_result);
  });

  test("monthlyTFT function throws if passed anything other than a positive value.", async () => {
    const result = async () => await grid.currency.monthlyTFT({ amount: -1 });

    await expect(result).rejects.toThrow();
    await expect(result).rejects.toBeInstanceOf(ValidationError);
  });

  test("yearlyTFT function returns a valid value.", async () => {
    const tfts = 1;
    const result = await grid.currency.yearlyTFT({ amount: tfts });
    const expected_result = new Decimal(+(await grid.currency.monthlyTFT({ amount: tfts })) * 12).toFixed(
      grid.currency.decimals,
    );

    expect(typeof result).toBe("string");
    expect(result).toBe(expected_result);
  });

  test("yearlyTFT function throws if passed anything other than a positive value.", async () => {
    const result = async () => grid.currency.yearlyTFT({ amount: -1 });

    await expect(result).rejects.toThrow();
    await expect(result).rejects.toBeInstanceOf(ValidationError);
  });

  test("dailyUSD function returns a valid value.", async () => {
    const tfts = 1;
    const result = await grid.currency.dailyUSD({ amount: tfts });
    const expected_result = new Decimal(tfts * 24).toFixed(grid.currency.decimals);

    expect(typeof result).toBe("string");
    expect(result).toBe(expected_result);
  });

  test("dailyUSD function throws if passed anything other than a positive value.", async () => {
    const result = async () => await grid.currency.dailyUSD({ amount: -1 });

    expect(result).rejects.toThrow();
    expect(result).rejects.toBeInstanceOf(ValidationError);
  });

  test("monthlyUSD function returns a valid value.", async () => {
    const tfts = 1;
    const result = await grid.currency.monthlyUSD({ amount: tfts });
    const expected_result = new Decimal(tfts * 24 * 30).toFixed(grid.currency.decimals);

    expect(typeof result).toBe("string");
    expect(result).toBe(expected_result);
  });

  test("monthlyUSD function throws if passed anything other than a positive value.", async () => {
    const result = async () => await grid.currency.monthlyUSD({ amount: -1 });

    await expect(result).rejects.toThrow();
    await expect(result).rejects.toBeInstanceOf(ValidationError);
  });

  test("yearlyUSD function returns a valid value.", async () => {
    const tfts = 1;
    const result = await grid.currency.yearlyUSD({ amount: tfts });
    const expected_result = new Decimal(+(await grid.currency.monthlyUSD({ amount: tfts })) * 12).toFixed(
      grid.currency.decimals,
    );

    expect(typeof result).toBe("string");
    expect(result).toBe(expected_result);
  });

  test("yearlyUSD function throws if passed anything other than a positive value.", async () => {
    const result = async () => grid.currency.yearlyUSD({ amount: -1 });

    await expect(result).rejects.toThrow();
    await expect(result).rejects.toBeInstanceOf(ValidationError);
  });
});
