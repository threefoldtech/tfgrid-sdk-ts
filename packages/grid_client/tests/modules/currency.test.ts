import { ValidationError } from "@threefold/types";
import Decimal from "decimal.js";

import { currency as TFTUSDConversionService, type GridClient } from "../../src";
import { getClient } from "../client_loader";

jest.setTimeout(300000);
let grid: GridClient;
let rate: number;
let decimals: number;
let currency: TFTUSDConversionService;

beforeAll(async () => {
  grid = await getClient();
  rate = await grid.tfclient.tftPrice.get();
  decimals = 5;
  currency = new TFTUSDConversionService(rate, decimals);
});

afterAll(async () => {
  await grid.disconnect();
});

describe("Testing TFT module", () => {
  test("tft module to be instance of TFTUSDConversionService", () => {
    expect(currency).toBeInstanceOf(TFTUSDConversionService);
  });

  test("should return value with 2 decimals.", () => {
    const result = currency.normalizeCurrency({ amount: 1 });

    expect(typeof result).toBe("string");
    expect(result).toBe(new Decimal(1).toFixed(decimals));
  });

  test("should convert to the correct value based on tftPrice.", () => {
    const hourlyTFT = { amount: 1 };
    const result = currency.convertTFTtoUSD(hourlyTFT);

    expect(typeof result).toBe("string");
    expect(result).toBe(new Decimal(1 * rate).toFixed(decimals));
  });

  test("convertTFTtoUSD function to throw if passed a negative value.", () => {
    const result = () => currency.convertTFTtoUSD({ amount: -1 });
    try {
      expect(result).toThrow();
    } catch (error) {
      expect(result).toBeInstanceOf(ValidationError);
    }
  });

  test("convertUSDtoTFT function returns a valid value.", () => {
    const usd = 1;
    const result = currency.convertUSDtoTFT({ amount: usd });

    expect(typeof result).toBe("string");
    expect(result).toEqual(new Decimal(1 / rate).toFixed(decimals));
  });

  test("convertUSDtoTFT function to throw if passed a negative value.", () => {
    const result = () => currency.convertUSDtoTFT({ amount: -1 });

    try {
      expect(result).toThrow();
    } catch (error) {
      expect(result).toBeInstanceOf(ValidationError);
    }
  });

  test("dailyTFT function returns a valid value.", () => {
    const tfts = 1;
    const result = currency.dailyTFT({ amount: tfts });
    const expected_result = new Decimal(tfts * 24).toFixed(decimals);

    expect(typeof result).toBe("string");
    expect(result).toBe(expected_result);
  });

  test("dailyTFT function throws if passed anything other than a positive value.", () => {
    const result = () => currency.dailyTFT({ amount: -1 });

    try {
      expect(result).toThrow();
    } catch (error) {
      expect(result).toBeInstanceOf(ValidationError);
    }
  });

  test("monthlyTFT function returns a valid value.", () => {
    const tfts = 1;
    const result = currency.monthlyTFT({ amount: tfts });
    const expected_result = new Decimal(tfts * 24 * 30).toFixed(decimals);

    expect(typeof result).toBe("string");
    expect(result).toBe(expected_result);
  });

  test("monthlyTFT function throws if passed anything other than a positive value.", () => {
    const result = () => currency.monthlyTFT({ amount: -1 });

    try {
      expect(result).toThrow();
    } catch (error) {
      expect(result).toBeInstanceOf(ValidationError);
    }
  });

  test("yearlyTFT function returns a valid value.", () => {
    const tfts = 1;
    const result = currency.yearlyTFT({ amount: tfts });
    const expected_result = new Decimal(+currency.monthlyTFT({ amount: tfts }) * 12).toFixed(decimals);

    expect(typeof result).toBe("string");
    expect(result).toBe(expected_result);
  });

  test("yearlyTFT function throws if passed anything other than a positive value.", () => {
    const result = () => currency.yearlyTFT({ amount: -1 });

    try {
      expect(result).toThrow();
    } catch (error) {
      expect(result).toBeInstanceOf(ValidationError);
    }
  });

  test("dailyUSD function returns a valid value.", () => {
    const tfts = 1;
    const result = currency.dailyUSD({ amount: tfts });
    const expected_result = new Decimal(tfts * 24).toFixed(decimals);

    expect(typeof result).toBe("string");
    expect(result).toBe(expected_result);
  });

  test("dailyUSD function throws if passed anything other than a positive value.", () => {
    const result = () => currency.dailyUSD({ amount: -1 });

    try {
      expect(result).toThrow();
    } catch (error) {
      expect(result).toBeInstanceOf(ValidationError);
    }
  });

  test("monthlyUSD function returns a valid value.", () => {
    const tfts = 1;
    const result = currency.monthlyUSD({ amount: tfts });
    const expected_result = new Decimal(tfts * 24 * 30).toFixed(decimals);

    expect(typeof result).toBe("string");
    expect(result).toBe(expected_result);
  });

  test("monthlyUSD function throws if passed anything other than a positive value.", () => {
    const result = () => currency.monthlyUSD({ amount: -1 });

    try {
      expect(result).toThrow();
    } catch (error) {
      expect(result).toBeInstanceOf(ValidationError);
    }
  });

  test("yearlyUSD function returns a valid value.", () => {
    const tfts = 1;
    const result = currency.yearlyUSD({ amount: tfts });
    const expected_result = new Decimal(+currency.monthlyUSD({ amount: tfts }) * 12).toFixed(decimals);

    expect(typeof result).toBe("string");
    expect(result).toBe(expected_result);
  });

  test("yearlyUSD function throws if passed anything other than a positive value.", () => {
    const result = () => currency.yearlyUSD({ amount: -1 });

    try {
      expect(result).toThrow();
    } catch (error) {
      expect(result).toBeInstanceOf(ValidationError);
    }
  });
});
